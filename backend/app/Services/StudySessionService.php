<?php

namespace App\Services;

use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class StudySessionService
{
    public function getActiveSession(User $user): ?StudySession
    {
        return StudySession::with(['topic.subject', 'schedule'])
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->latest('started_at')
            ->first();
    }

    public function startSession(User $user, array $data): StudySession
    {
        // 1. If another session is in progress, mark it as completed or paused to avoid orphan timers
        $existing = $this->getActiveSession($user);
        if ($existing) {
            $existing->update([
                'status' => 'completed',
                'ended_at' => Carbon::now(),
            ]);
        }

        $now = Carbon::now();

        // 2. Create new session
        $session = StudySession::create([
            'user_id' => $user->id,
            'study_schedule_id' => $data['study_schedule_id'] ?? null,
            'topic_id' => $data['topic_id'] ?? null,
            'session_type' => $data['session_type'] ?? 'pomodoro',
            'planned_minutes' => $data['planned_minutes'] ?? 25,
            'active_seconds' => 0,
            'paused_seconds' => 0,
            'started_at' => $now,
            'status' => 'in_progress',
            'notes' => $data['notes'] ?? null,
        ]);

        // 3. If linked to a schedule, mark it in_progress
        if (! empty($data['study_schedule_id'])) {
            StudySchedule::where('id', $data['study_schedule_id'])
                ->where('user_id', $user->id)
                ->update(['status' => 'in_progress']);
        }

        return $session->load(['topic.subject', 'schedule']);
    }

    public function heartbeat(User $user, int $sessionId, int $activeSeconds, int $pausedSeconds): StudySession
    {
        $session = StudySession::where('user_id', $user->id)->findOrFail($sessionId);

        $session->update([
            'active_seconds' => $activeSeconds,
            'paused_seconds' => $pausedSeconds,
        ]);

        return $session;
    }

    public function completeSession(User $user, int $sessionId, array $data): StudySession
    {
        $session = StudySession::where('user_id', $user->id)->findOrFail($sessionId);
        $now = Carbon::now();

        $activeSeconds = $data['active_seconds'] ?? $session->active_seconds;
        $activeMinutes = max(1, (int) round($activeSeconds / 60));

        $session->update([
            'status' => 'completed',
            'active_seconds' => $activeSeconds,
            'paused_seconds' => $data['paused_seconds'] ?? $session->paused_seconds,
            'ended_at' => $now,
            'notes' => $data['notes'] ?? $session->notes,
        ]);

        // 1. Increment topic actual_minutes if linked
        if ($session->topic_id) {
            Topic::where('id', $session->topic_id)->increment('actual_minutes', $activeMinutes);
        }

        // 2. Mark schedule as completed if linked
        if ($session->study_schedule_id) {
            StudySchedule::where('id', $session->study_schedule_id)
                ->where('user_id', $user->id)
                ->update(['status' => 'completed']);
        }

        return $session->fresh(['topic.subject', 'schedule']);
    }

    public function abandonSession(User $user, int $sessionId): StudySession
    {
        $session = StudySession::where('user_id', $user->id)->findOrFail($sessionId);

        $session->update([
            'status' => 'abandoned',
            'ended_at' => Carbon::now(),
        ]);

        // Reset schedule to scheduled if not completed
        if ($session->study_schedule_id) {
            StudySchedule::where('id', $session->study_schedule_id)
                ->where('user_id', $user->id)
                ->where('status', 'in_progress')
                ->update(['status' => 'scheduled']);
        }

        return $session;
    }

    public function getHistory(User $user, int $limit = 20): Collection
    {
        return StudySession::with(['topic.subject', 'schedule'])
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->orderByDesc('ended_at')
            ->limit($limit)
            ->get();
    }
}

