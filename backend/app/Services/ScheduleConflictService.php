<?php

namespace App\Services;

use App\Models\StudySchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ScheduleConflictService
{
    /**
     * Check if a proposed time slot collides with existing schedules for a user.
     * Interval overlap formula: (existing.start < new.end) AND (existing.end > new.start)
     */
    public function detectConflict(
        User $user,
        string $date,
        string $startTime,
        string $endTime,
        ?int $ignoreScheduleId = null
    ): ?array {
        $conflicts = StudySchedule::where('user_id', $user->id)
            ->whereDate('scheduled_date', $date)
            ->where('status', '!=', 'cancelled')
            ->where('status', '!=', 'missed')
            ->when($ignoreScheduleId, fn ($q) => $q->where('id', '!=', $ignoreScheduleId))
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->with('topic')
            ->get();

        if ($conflicts->isEmpty()) {
            return null;
        }

        $conflictingSession = $conflicts->first();
        $suggestedSlot = $this->suggestAvailableSlot($user, $date, $endTime, 60);

        return [
            'has_conflict' => true,
            'conflicting_session' => [
                'id' => $conflictingSession->id,
                'title' => $conflictingSession->title,
                'start_time' => substr($conflictingSession->start_time, 0, 5),
                'end_time' => substr($conflictingSession->end_time, 0, 5),
                'priority' => $conflictingSession->priority,
            ],
            'total_conflicts' => $conflicts->count(),
            'suggested_slot' => $suggestedSlot,
        ];
    }

    /**
     * Suggest the next available non-overlapping time slot on the same day.
     */
    public function suggestAvailableSlot(User $user, string $date, string $afterTime, int $durationMinutes): ?array
    {
        $after = Carbon::parse("{$date} {$afterTime}");
        $endOfDay = Carbon::parse("{$date} 23:00:00");

        $schedules = StudySchedule::where('user_id', $user->id)
            ->whereDate('scheduled_date', $date)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get();

        $candidateStart = $after->copy();

        while ($candidateStart->copy()->addMinutes($durationMinutes)->lte($endOfDay)) {
            $candidateEnd = $candidateStart->copy()->addMinutes($durationMinutes);

            $overlap = $schedules->first(function ($s) use ($candidateStart, $candidateEnd, $date) {
                $sStart = Carbon::parse("{$date} {$s->start_time}");
                $sEnd = Carbon::parse("{$date} {$s->end_time}");
                return $sStart->lt($candidateEnd) && $sEnd->gt($candidateStart);
            });

            if (! $overlap) {
                return [
                    'date' => $date,
                    'start_time' => $candidateStart->format('H:i'),
                    'end_time' => $candidateEnd->format('H:i'),
                    'duration_minutes' => $durationMinutes,
                ];
            }

            // Move candidate start to end of overlapping schedule + 15 min buffer
            $overlapEnd = Carbon::parse("{$date} {$overlap->end_time}");
            $candidateStart = $overlapEnd->copy()->addMinutes(10);
        }

        return null;
    }

    /**
     * Get all overdue study schedules (scheduled before today and unfinished).
     */
    public function getOverdueSchedules(User $user): Collection
    {
        $today = Carbon::today()->toDateString();

        return StudySchedule::with(['topic.subject'])
            ->where('user_id', $user->id)
            ->where('scheduled_date', '<', $today)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('scheduled_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }
}

