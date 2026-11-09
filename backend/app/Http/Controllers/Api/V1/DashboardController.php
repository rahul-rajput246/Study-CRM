<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Services\DashboardAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardAnalyticsService $analyticsService
    ) {}

    public function overview(Request $request): JsonResponse
    {
        $metrics = $this->analyticsService->getOverviewMetrics($request->user());

        return response()->json([
            'status' => 'success',
            'data' => $metrics,
        ]);
    }

    public function todaySchedule(Request $request): JsonResponse
    {
        $today = Carbon::today();

        $schedules = StudySchedule::with(['topic.subject.phase', 'topic.subtopics', 'studySessions'])
            ->where('user_id', $request->user()->id)
            ->whereDate('scheduled_date', $today)
            ->orderBy('start_time')
            ->get();

        $formatted = $schedules->map(function ($s) {
            $latestSession = $s->studySessions->sortByDesc('id')->first();

            return [
                'id' => $s->id,
                'title' => $s->title,
                'subject' => $s->topic?->subject?->title ?? 'General Engineering',
                'phase' => $s->topic?->subject?->phase?->title ?? 'Self-Directed',
                'topic' => $s->topic?->title ?? $s->title,
                'topic_id' => $s->topic_id,
                'start_time' => substr($s->start_time, 0, 5),
                'end_time' => substr($s->end_time, 0, 5),
                'estimated_minutes' => $s->estimated_minutes,
                'priority' => $s->priority,
                'status' => $s->status,
                'description' => $s->description,
                'active_session' => $latestSession ? [
                    'id' => $latestSession->id,
                    'status' => $latestSession->status,
                    'active_seconds' => $latestSession->active_seconds,
                    'started_at' => $latestSession->started_at?->toIso8601String(),
                ] : null,
                'subtopics_count' => $s->topic?->subtopics?->count() ?? 0,
                'subtopics_completed' => $s->topic?->subtopics?->where('is_completed', true)->count() ?? 0,
            ];
        });

        return response()->json([
            'status' => 'success',
            'date' => $today->toDateString(),
            'data' => $formatted,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:scheduled,in_progress,completed,missed,rescheduled'],
            'notes' => ['nullable', 'string'],
        ]);

        $schedule = StudySchedule::where('user_id', $request->user()->id)->findOrFail($id);
        $schedule->update(['status' => $validated['status']]);

        // If marked completed, update topic actual_minutes or session
        if ($validated['status'] === 'completed' && $schedule->topic_id) {
            $schedule->topic?->increment('actual_minutes', $schedule->estimated_minutes);
        }

        return response()->json([
            'message' => "Schedule marked as {$validated['status']}.",
            'schedule' => $schedule,
        ]);
    }
}

