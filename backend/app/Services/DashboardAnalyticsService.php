<?php

namespace App\Services;

use App\Models\RevisionItem;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardAnalyticsService
{
    public function getOverviewMetrics(User $user): array
    {
        $today = Carbon::today();

        // 1. Today's Schedules
        $todaySchedules = StudySchedule::where('user_id', $user->id)
            ->whereDate('scheduled_date', $today)
            ->get();

        $scheduledMinutes = $todaySchedules->sum('estimated_minutes');
        $tasksCompleted = $todaySchedules->where('status', 'completed')->count();
        $tasksPending = $todaySchedules->whereIn('status', ['scheduled', 'in_progress'])->count();

        // Highest priority task today
        $highestPriorityTask = $todaySchedules
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->sortByDesc(function ($schedule) {
                return match ($schedule->priority) {
                    'critical' => 4,
                    'high' => 3,
                    'medium' => 2,
                    'low' => 1,
                    default => 0,
                };
            })
            ->first();

        // 2. Today's Actual Study Time from Sessions
        $todaySessions = StudySession::where('user_id', $user->id)
            ->whereDate('started_at', $today)
            ->where('status', 'completed')
            ->get();

        $actualSeconds = $todaySessions->sum('active_seconds');
        $actualMinutes = (int) round($actualSeconds / 60);

        // 3. Current Study Streak (consecutive days with completed sessions)
        $streak = $this->calculateStreak($user);

        // 4. Weekly Consistency % (days with study sessions in last 7 days / 7 * 100)
        $last7DaysStart = Carbon::today()->subDays(6)->startOfDay();
        $activeDaysInLast7 = StudySession::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('started_at', '>=', $last7DaysStart)
            ->selectRaw('DATE(started_at) as session_date')
            ->distinct()
            ->get()
            ->count();

        $weeklyConsistencyPercent = (int) round(($activeDaysInLast7 / 7) * 100);

        // 5. Topics due for revision (including overdue)
        $dueRevisionsCount = RevisionItem::where('user_id', $user->id)
            ->whereDate('next_revision_date', '<=', $today)
            ->where('status', '!=', 'completed')
            ->count();

        // 6. Upcoming study sessions today
        $upcomingSessions = StudySchedule::with(['topic.subject'])
            ->where('user_id', $user->id)
            ->whereDate('scheduled_date', $today)
            ->orderBy('start_time')
            ->get();

        // 7. Last 7 Days Planned vs Actual Chart Data
        $weeklyChartData = $this->getWeeklyTrendData($user);

        // 8. Subject-wise Progress
        $subjectProgress = $this->getSubjectProgress($user);

        return [
            'today' => [
                'date' => $today->toDateString(),
                'formatted_date' => $today->format('D, d M Y'),
                'scheduled_minutes' => $scheduledMinutes,
                'scheduled_hours' => round($scheduledMinutes / 60, 1),
                'actual_minutes' => $actualMinutes,
                'actual_hours' => round($actualMinutes / 60, 1),
                'daily_goal_minutes' => $user->daily_goal_minutes ?? 240,
                'daily_goal_hours' => round(($user->daily_goal_minutes ?? 240) / 60, 1),
                'goal_completion_percent' => min(100, (int) round(($actualMinutes / ($user->daily_goal_minutes ?? 240)) * 100)),
                'tasks_completed' => $tasksCompleted,
                'tasks_pending' => $tasksPending,
                'highest_priority_task' => $highestPriorityTask ? [
                    'id' => $highestPriorityTask->id,
                    'title' => $highestPriorityTask->title,
                    'priority' => $highestPriorityTask->priority,
                    'start_time' => substr($highestPriorityTask->start_time, 0, 5),
                    'end_time' => substr($highestPriorityTask->end_time, 0, 5),
                ] : null,
            ],
            'metrics' => [
                'current_streak_days' => $streak,
                'weekly_consistency_percent' => $weeklyConsistencyPercent,
                'topics_due_revision' => $dueRevisionsCount,
                'upcoming_sessions_count' => $upcomingSessions->where('status', 'scheduled')->count(),
            ],
            'weekly_trend' => $weeklyChartData,
            'subject_progress' => $subjectProgress,
            'upcoming_sessions' => $upcomingSessions->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'subject' => $s->topic?->subject?->title ?? 'General Engineering',
                    'topic' => $s->topic?->title ?? $s->title,
                    'start_time' => substr($s->start_time, 0, 5),
                    'end_time' => substr($s->end_time, 0, 5),
                    'estimated_minutes' => $s->estimated_minutes,
                    'priority' => $s->priority,
                    'status' => $s->status,
                    'description' => $s->description,
                ];
            }),
        ];
    }

    private function calculateStreak(User $user): int
    {
        $dates = StudySession::where('user_id', $user->id)
            ->where('status', 'completed')
            ->selectRaw('DATE(started_at) as session_date')
            ->distinct()
            ->orderByDesc('session_date')
            ->pluck('session_date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        if (empty($dates)) {
            return 0;
        }

        $streak = 0;
        $checkDate = Carbon::today();

        // If no study session logged today yet, start checking from yesterday so streak doesn't reset prematurely
        if (! in_array($checkDate->toDateString(), $dates)) {
            $checkDate = Carbon::yesterday();
        }

        while (in_array($checkDate->toDateString(), $dates)) {
            $streak++;
            $checkDate->subDay();
        }

        return $streak;
    }

    private function getWeeklyTrendData(User $user): array
    {
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->toDateString();

            // Planned minutes from schedules
            $plannedMins = StudySchedule::where('user_id', $user->id)
                ->whereDate('scheduled_date', $dateStr)
                ->sum('estimated_minutes');

            // Actual minutes from sessions
            $actualSecs = StudySession::where('user_id', $user->id)
                ->whereDate('started_at', $dateStr)
                ->where('status', 'completed')
                ->sum('active_seconds');

            $days[] = [
                'day' => $date->format('D'),
                'date' => $date->format('d M'),
                'planned_minutes' => (int) $plannedMins,
                'planned_hours' => round($plannedMins / 60, 1),
                'actual_minutes' => (int) round($actualSecs / 60),
                'actual_hours' => round($actualSecs / 3600, 1),
            ];
        }

        return $days;
    }

    private function getSubjectProgress(User $user): Collection
    {
        return Subject::with(['topics'])
            ->whereHas('phase.roadmap', fn ($q) => $q->where('user_id', $user->id))
            ->take(6)
            ->get()
            ->map(function ($subject) {
                $total = $subject->topics->count();
                $completed = $subject->topics->where('status', 'completed')->count();
                $percent = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

                return [
                    'id' => $subject->id,
                    'title' => $subject->title,
                    'total_topics' => $total,
                    'completed_topics' => $completed,
                    'progress_percent' => $percent,
                    'status' => $subject->status,
                ];
            });
    }
}

