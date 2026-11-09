<?php

namespace App\Services;

use App\Models\InAppNotification;
use App\Models\NotificationPreference;
use App\Models\RevisionItem;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function getPreferences(User $user): NotificationPreference
    {
        return NotificationPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'in_app_enabled' => true,
                'browser_enabled' => true,
                'lead_time_minutes' => 15,
                'notify_upcoming_sessions' => true,
                'notify_overdue_tasks' => true,
                'notify_revision_due' => true,
                'sound_enabled' => true,
            ]
        );
    }

    public function updatePreferences(User $user, array $data): NotificationPreference
    {
        $prefs = $this->getPreferences($user);
        $prefs->update($data);

        return $prefs->fresh();
    }

    public function getNotifications(User $user, ?string $filter = 'all', int $perPage = 25): array
    {
        // 1. Sync live alerts dynamically on fetch
        $this->generateLiveAlerts($user);

        // 2. Query
        $query = InAppNotification::where('user_id', $user->id)->recent();

        if ($filter === 'unread') {
            $query->unread();
        } elseif ($filter && $filter !== 'all') {
            $query->where('type', $filter);
        }

        $paginator = $query->paginate($perPage);
        $unreadCount = InAppNotification::where('user_id', $user->id)->unread()->count();

        return [
            'status' => 'success',
            'unread_count' => $unreadCount,
            'notifications' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    public function getUnreadCount(User $user): int
    {
        return InAppNotification::where('user_id', $user->id)->unread()->count();
    }

    public function generateLiveAlerts(User $user): void
    {
        $prefs = $this->getPreferences($user);

        if (! $prefs->in_app_enabled) {
            return;
        }

        $now = Carbon::now();
        $today = $now->toDateString();

        // 1. Upcoming Study Session Reminder
        if ($prefs->notify_upcoming_sessions) {
            $leadMinutes = $prefs->lead_time_minutes ?: 15;
            $windowStart = $now->copy()->format('H:i:s');
            $windowEnd = $now->copy()->addMinutes($leadMinutes)->format('H:i:s');

            $upcomingSchedules = StudySchedule::where('user_id', $user->id)
                ->whereDate('scheduled_date', $today)
                ->where('status', 'scheduled')
                ->where('start_time', '>=', $windowStart)
                ->where('start_time', '<=', $windowEnd)
                ->get();

            foreach ($upcomingSchedules as $sched) {
                // Ensure no duplicate notification within the last 2 hours for this schedule
                $exists = InAppNotification::where('user_id', $user->id)
                    ->where('type', 'session_reminder')
                    ->where('action_id', $sched->id)
                    ->where('created_at', '>=', $now->copy()->subHours(2))
                    ->exists();

                if (! $exists) {
                    $startFormatted = Carbon::parse($sched->start_time)->format('h:i A');
                    InAppNotification::create([
                        'user_id' => $user->id,
                        'type' => 'session_reminder',
                        'title' => "Upcoming Session: {$sched->title}",
                        'message' => "Starting soon at {$startFormatted} ({$sched->estimated_minutes} mins). Clear distractions and enter focus state.",
                        'action_tab' => 'schedule',
                        'action_id' => $sched->id,
                        'data' => [
                            'schedule_id' => $sched->id,
                            'start_time' => $sched->start_time,
                            'priority' => $sched->priority,
                            'estimated_minutes' => $sched->estimated_minutes,
                        ],
                    ]);
                }
            }
        }

        // 2. Overdue Tasks Alert
        if ($prefs->notify_overdue_tasks) {
            $currentTimeStr = $now->format('H:i:s');
            $overdueCount = StudySchedule::where('user_id', $user->id)
                ->where('status', 'scheduled')
                ->where(function ($q) use ($today, $currentTimeStr) {
                    $q->whereDate('scheduled_date', '<', $today)
                        ->orWhere(function ($sub) use ($today, $currentTimeStr) {
                            $sub->whereDate('scheduled_date', $today)
                                ->where('end_time', '<', $currentTimeStr);
                        });
                })
                ->count();

            if ($overdueCount > 0) {
                // Generate at most once every 6 hours
                $recentOverdueAlert = InAppNotification::where('user_id', $user->id)
                    ->where('type', 'overdue_alert')
                    ->where('created_at', '>=', $now->copy()->subHours(6))
                    ->exists();

                if (! $recentOverdueAlert) {
                    InAppNotification::create([
                        'user_id' => $user->id,
                        'type' => 'overdue_alert',
                        'title' => "{$overdueCount} Unfinished Study Tasks Need Attention",
                        'message' => "You have {$overdueCount} study activities past their scheduled time. Shift them to open slots or mark them done to keep momentum.",
                        'action_tab' => 'schedule',
                        'action_id' => null,
                        'data' => ['overdue_count' => $overdueCount],
                    ]);
                }
            }
        }

        // 3. Spaced Repetition Revision Due Alert
        if ($prefs->notify_revision_due) {
            $revisionDueCount = RevisionItem::where('user_id', $user->id)
                ->whereDate('next_revision_date', '<=', $today)
                ->count();

            if ($revisionDueCount > 0) {
                // Generate at most once per day
                $recentRevisionAlert = InAppNotification::where('user_id', $user->id)
                    ->where('type', 'revision_due')
                    ->whereDate('created_at', $today)
                    ->exists();

                if (! $recentRevisionAlert) {
                    InAppNotification::create([
                        'user_id' => $user->id,
                        'type' => 'revision_due',
                        'title' => "{$revisionDueCount} Topics Due for Spaced Repetition",
                        'message' => "Spaced repetition cements knowledge into permanent recall. Review today's due cards to stay sharp.",
                        'action_tab' => 'revision',
                        'action_id' => null,
                        'data' => ['revision_count' => $revisionDueCount],
                    ]);
                }
            }
        }

        // 4. Daily Goal Progress Alert
        $activeSecondsToday = StudySession::where('user_id', $user->id)
            ->whereDate('started_at', $today)
            ->where('status', 'completed')
            ->sum('active_seconds');

        $activeMinsToday = round($activeSecondsToday / 60);
        $dailyGoal = $user->daily_goal_minutes ?: 240;

        if ($activeMinsToday >= $dailyGoal) {
            $goalAchievedAlert = InAppNotification::where('user_id', $user->id)
                ->where('type', 'goal_progress')
                ->whereDate('created_at', $today)
                ->exists();

            if (! $goalAchievedAlert) {
                InAppNotification::create([
                    'user_id' => $user->id,
                    'type' => 'goal_progress',
                    'title' => '🎯 Daily Engineering Goal Achieved!',
                    'message' => "Outstanding dedication! You completed {$activeMinsToday} mins of focused study today, surpassing your {$dailyGoal} min target.",
                    'action_tab' => 'dashboard',
                    'action_id' => null,
                    'data' => [
                        'active_minutes' => $activeMinsToday,
                        'goal_minutes' => $dailyGoal,
                    ],
                ]);
            }
        }
    }

    public function markAsRead(User $user, int $id): InAppNotification
    {
        $notification = InAppNotification::where('user_id', $user->id)->findOrFail($id);
        $notification->update([
            'is_read' => true,
            'read_at' => Carbon::now(),
        ]);

        return $notification;
    }

    public function markAllAsRead(User $user): int
    {
        return InAppNotification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);
    }

    public function deleteNotification(User $user, int $id): bool
    {
        $notification = InAppNotification::where('user_id', $user->id)->findOrFail($id);

        return $notification->delete();
    }

    public function clearRead(User $user): int
    {
        return InAppNotification::where('user_id', $user->id)
            ->where('is_read', true)
            ->delete();
    }
}

