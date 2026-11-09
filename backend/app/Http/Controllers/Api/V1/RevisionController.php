<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RevisionItem;
use App\Services\SpacedRepetitionService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevisionController extends Controller
{
    public function __construct(
        protected SpacedRepetitionService $spacedRepetitionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'all');
        $query = RevisionItem::with(['topic.subject.phase', 'logs'])
            ->where('user_id', $request->user()->id);

        $today = Carbon::today()->toDateString();

        if ($status === 'due') {
            $query->whereDate('next_revision_date', '<=', $today);
        } elseif ($status === 'mastered') {
            $query->where('repetition_count', '>=', 3)->where('interval_days', '>=', 14);
        } elseif ($status === 'learning') {
            $query->where(function ($q) {
                $q->where('repetition_count', '<', 3)->orWhere('interval_days', '<', 14);
            });
        }

        $items = $query->orderBy('next_revision_date')->paginate(30);

        return response()->json([
            'status' => 'success',
            'data' => $items->items(),
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function dueQueue(Request $request): JsonResponse
    {
        $queue = $this->spacedRepetitionService->getDueQueue($request->user());

        return response()->json([
            'status' => 'success',
            'count' => $queue->count(),
            'data' => $queue,
        ]);
    }

    public function upcoming(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 14);
        $schedule = $this->spacedRepetitionService->getUpcomingSchedule($request->user(), $days);

        return response()->json([
            'status' => 'success',
            'schedule' => $schedule,
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $analytics = $this->spacedRepetitionService->getRetentionAnalytics($request->user());

        return response()->json([
            'status' => 'success',
            'analytics' => $analytics,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic_id' => ['required', 'exists:topics,id'],
            'concept_prompt' => ['nullable', 'string', 'max:1000'],
            'key_takeaways' => ['nullable', 'string', 'max:3000'],
            'confidence_score' => ['nullable', 'integer', 'between:1,5'],
            'next_revision_date' => ['nullable', 'date'],
        ]);

        $item = $this->spacedRepetitionService->createItem($request->user(), $validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Topic added to Spaced Repetition queue.',
            'data' => $item->load('topic.subject'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $item = RevisionItem::with(['topic.subject.phase', 'logs'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $item,
        ]);
    }

    public function review(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'in:again,hard,good,easy'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = $this->spacedRepetitionService->reviewItem(
            $request->user(),
            $id,
            $validated['rating'],
            $validated['review_notes'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => $result['message'],
            'item' => $result['item'],
            'next_revision' => $result['next_revision'],
            'log' => $result['log'],
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = RevisionItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Revision item removed from queue.',
        ]);
    }
}

