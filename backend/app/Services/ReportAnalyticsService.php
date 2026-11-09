<?php

namespace App\Services;

use App\Models\DailyJournal;
use App\Models\ProblemLog;
use App\Models\RevisionItem;
use App\Models\RevisionLog;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportAnalyticsService
{
    public function getComprehensiveReport(User $user, string $period = 'last_30_days'): array
    {
        $today = Carbon::today();

        if ($period === 'last_7_days') {
            $startDate = $today->copy()->subDays(6)->startOfDay();
            $daysCount = 7;
        } elseif ($period === 'all_time') {
            $startDate = Carbon::createFromTimestamp(0);
            $daysCount = 365;
        } else { // default 'last_30_days'
            $startDate = $today->copy()->subDays(29)->startOfDay();
            $daysCount = 30;
        }

        // 1. Total Actual Study Hours in Period
        $sessions = StudySession::with('topic.subject')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('started_at', '>=', $startDate)
            ->get();

        $totalActiveSeconds = $sessions->sum('active_seconds');
        $totalActualHours = round($totalActiveSeconds / 3600, 1);
        $totalActualMinutes = round($totalActiveSeconds / 60);

        // 2. Total Planned Hours in Period
        $schedules = StudySchedule::where('user_id', $user->id)
            ->where('scheduled_date', '>=', $startDate->toDateString())
            ->where('scheduled_date', '<=', $today->toDateString())
            ->get();

        $totalPlannedMinutes = $schedules->sum('estimated_minutes');
        $totalPlannedHours = round($totalPlannedMinutes / 60, 1);

        $adherenceVelocity = $totalPlannedHours > 0
            ? min(150, round(($totalActualHours / $totalPlannedHours) * 100))
            : 100;

        // 3. Daily Study Trend (Labels, Planned, Actual)
        $trendLabels = [];
        $trendPlanned = [];
        $trendActual = [];

        $trendDays = min(30, $daysCount);
        $cursor = $today->copy()->subDays($trendDays - 1);

        for ($i = 0; $i < $trendDays; $i++) {
            $dayStr = $cursor->toDateString();
            $trendLabels[] = $cursor->format('d M');

            // Planned
            $dayPlannedMins = StudySchedule::where('user_id', $user->id)
                ->whereDate('scheduled_date', $dayStr)
                ->sum('estimated_minutes');
            $trendPlanned[] = round($dayPlannedMins / 60, 1);

            // Actual
            $dayActualSecs = StudySession::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereDate('started_at', $dayStr)
                ->sum('active_seconds');
            $trendActual[] = round($dayActualSecs / 3600, 1);

            $cursor->addDay();
        }

        // 4. Subject-wise Time Distribution
        $subjectTimes = [];
        foreach ($sessions as $s) {
            $subjName = $s->topic?->subject?->name ?? 'General Engineering';
            $subjectTimes[$subjName] = ($subjectTimes[$subjName] ?? 0) + round($s->active_seconds / 3600, 1);
        }
        arsort($subjectTimes);

        // 5. Problem-Solving Independence Metrics
        $problemQuery = ProblemLog::where('user_id', $user->id);
        $totalProblems = (clone $problemQuery)->count();
        $independentCount = (clone $problemQuery)->where('independence_level', 'independent')->count();
        $smallHintCount = (clone $problemQuery)->where('independence_level', 'small_hint')->count();
        $guidedCount = (clone $problemQuery)->where('independence_level', 'significant_guidance')->count();
        $memorizedCount = (clone $problemQuery)->where('independence_level', 'solution_memorized')->count();

        $independenceRatio = $totalProblems > 0
            ? round(($independentCount / $totalProblems) * 100)
            : 100;

        // 6. Spaced Repetition Retention Metrics
        $totalCards = RevisionItem::where('user_id', $user->id)->count();
        $masteredCards = RevisionItem::where('user_id', $user->id)
            ->where('repetition_count', '>=', 3)
            ->where('interval_days', '>=', 14)
            ->count();

        $userItemIds = RevisionItem::where('user_id', $user->id)->pluck('id');
        $totalReviews = RevisionLog::whereIn('revision_item_id', $userItemIds)->count();
        $successfulReviews = RevisionLog::whereIn('revision_item_id', $userItemIds)
            ->whereIn('rating', ['good', 'easy'])
            ->count();
        $retentionRate = $totalReviews > 0 ? round(($successfulReviews / $totalReviews) * 100) : 100;

        // 7. Day of Week Rhythm
        $dowStudy = ['Mon' => 0, 'Tue' => 0, 'Wed' => 0, 'Thu' => 0, 'Fri' => 0, 'Sat' => 0, 'Sun' => 0];
        foreach ($sessions as $s) {
            $dayName = Carbon::parse($s->started_at)->format('D');
            if (isset($dowStudy[$dayName])) {
                $dowStudy[$dayName] += round($s->active_seconds / 3600, 1);
            }
        }

        // 8. Cognitive Career Benchmark Analysis (Target: ₹40 LPA+)
        $strengths = [];
        $bottlenecks = [];
        $recommendations = [];

        if ($independenceRatio >= 65) {
            $strengths[] = "Strong algorithmic independence ({$independenceRatio}% solo solved).";
        } else {
            $bottlenecks[] = "Independence ratio is {$independenceRatio}%. Increase unassisted problem solving time before checking editorials.";
        }

        if ($retentionRate >= 80) {
            $strengths[] = "High memory retention ({$retentionRate}% recall on spaced repetition).";
        } else {
            $bottlenecks[] = "Retention rate dropped to {$retentionRate}%. Revise due flashcards daily.";
        }

        if ($adherenceVelocity >= 70) {
            $strengths[] = "High schedule commitment ({$adherenceVelocity}% planned vs actual adherence).";
        } else {
            $bottlenecks[] = "Schedule velocity is below 70%. Reduce daily scheduled hours to maintain realistic stamina.";
        }

        $recommendations[] = "Maintain daily active recall in Spaced Repetition to prevent fading memory.";
        $recommendations[] = "Prioritize system design experiments on FoodieHub alongside DSA.";
        $recommendations[] = "Keep daily study sessions bounded to 25-50m Pomodoro blocks with active breaks.";

        return [
            'period' => $period,
            'summary' => [
                'total_actual_hours' => $totalActualHours,
                'total_planned_hours' => $totalPlannedHours,
                'adherence_velocity_pct' => $adherenceVelocity,
                'avg_daily_hours' => round($totalActualHours / max(1, count($trendLabels)), 1),
                'total_problems_solved' => $totalProblems,
                'independence_ratio_pct' => $independenceRatio,
                'retention_accuracy_pct' => $retentionRate,
                'total_flashcards' => $totalCards,
                'mastered_flashcards' => $masteredCards,
            ],
            'trend_chart' => [
                'labels' => $trendLabels,
                'planned' => $trendPlanned,
                'actual' => $trendActual,
            ],
            'subject_distribution' => [
                'labels' => array_keys($subjectTimes),
                'hours' => array_values($subjectTimes),
            ],
            'independence_chart' => [
                'labels' => ['100% Solo', 'Small Hint', 'Guided Tutorial', 'Solution Memorized'],
                'counts' => [$independentCount, $smallHintCount, $guidedCount, $memorizedCount],
            ],
            'day_of_week_rhythm' => [
                'labels' => array_keys($dowStudy),
                'hours' => array_values($dowStudy),
            ],
            'insights' => [
                'strengths' => $strengths,
                'bottlenecks' => $bottlenecks,
                'recommendations' => $recommendations,
            ],
        ];
    }
}

