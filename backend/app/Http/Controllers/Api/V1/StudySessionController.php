<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\StudySessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudySessionController extends Controller
{
    public function __construct(
        protected StudySessionService $sessionService
    ) {}

    public function active(Request $request): JsonResponse
    {
        $session = $this->sessionService->getActiveSession($request->user());

        return response()->json([
            'status' => 'success',
            'session' => $session,
        ]);
    }

    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'study_schedule_id' => ['nullable', 'exists:study_schedules,id'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'session_type' => ['required', 'in:pomodoro,deep_work,custom,free_flow'],
            'planned_minutes' => ['required', 'integer', 'min:1', 'max:360'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $session = $this->sessionService->startSession($request->user(), $validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Focus session started.',
            'session' => $session,
        ], 201);
    }

    public function heartbeat(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'active_seconds' => ['required', 'integer', 'min:0'],
            'paused_seconds' => ['required', 'integer', 'min:0'],
        ]);

        $session = $this->sessionService->heartbeat(
            $request->user(),
            $id,
            $validated['active_seconds'],
            $validated['paused_seconds']
        );

        return response()->json([
            'status' => 'success',
            'session' => $session,
        ]);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'active_seconds' => ['required', 'integer', 'min:0'],
            'paused_seconds' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $session = $this->sessionService->completeSession($request->user(), $id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Focus session completed and logged to study time.',
            'session' => $session,
        ]);
    }

    public function abandon(Request $request, int $id): JsonResponse
    {
        $session = $this->sessionService->abandonSession($request->user(), $id);

        return response()->json([
            'status' => 'success',
            'message' => 'Focus session cancelled.',
            'session' => $session,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 20);
        $history = $this->sessionService->getHistory($request->user(), $limit);

        return response()->json([
            'status' => 'success',
            'data' => $history,
        ]);
    }
}

