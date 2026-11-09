<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\Topic;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    public function store(StoreTopicRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Security authorization check: subject must belong to user's roadmap
        $subject = Subject::whereHas('phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($validated['subject_id']);

        $order = $subject->topics()->count();

        $topic = Topic::create([
            'subject_id' => $subject->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'learning_objectives' => $validated['learning_objectives'] ?? [],
            'priority' => $validated['priority'],
            'estimated_minutes' => $validated['estimated_minutes'],
            'actual_minutes' => 0,
            'status' => $validated['status'] ?? 'not_started',
            'start_date' => $validated['start_date'] ?? null,
            'target_date' => $validated['target_date'] ?? null,
            'order_index' => $order + 1,
            'personal_notes' => $validated['personal_notes'] ?? null,
        ]);

        // Bulk create subtopics if provided
        if (! empty($validated['subtopics'])) {
            foreach ($validated['subtopics'] as $index => $subTitle) {
                if (trim($subTitle) !== '') {
                    Subtopic::create([
                        'topic_id' => $topic->id,
                        'title' => trim($subTitle),
                        'is_completed' => false,
                        'order_index' => $index + 1,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Topic created successfully.',
            'data' => $topic->load('subtopics'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $topic = Topic::with(['subject.phase.roadmap', 'subtopics', 'revisionItem', 'notes'])
            ->whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($id);

        $subTotal = $topic->subtopics->count();
        $subCompleted = $topic->subtopics->where('is_completed', true)->count();
        $progress = $subTotal > 0 ? (int) round(($subCompleted / $subTotal) * 100) : ($topic->status === 'completed' ? 100 : 0);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $topic->id,
                'title' => $topic->title,
                'description' => $topic->description,
                'subject' => $topic->subject->title,
                'subject_id' => $topic->subject_id,
                'phase' => $topic->subject->phase->title,
                'roadmap' => $topic->subject->phase->roadmap->title,
                'learning_objectives' => $topic->learning_objectives ?? [],
                'priority' => $topic->priority,
                'estimated_minutes' => $topic->estimated_minutes,
                'actual_minutes' => $topic->actual_minutes,
                'status' => $topic->status,
                'start_date' => $topic->start_date?->toDateString(),
                'target_date' => $topic->target_date?->toDateString(),
                'completed_at' => $topic->completed_at?->toIso8601String(),
                'order_index' => $topic->order_index,
                'personal_notes' => $topic->personal_notes,
                'progress_percent' => $progress,
                'subtopics' => $topic->subtopics,
                'revision' => $topic->revisionItem,
            ],
        ]);
    }

    public function update(UpdateTopicRequest $request, int $id): JsonResponse
    {
        $topic = Topic::whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($id);

        $validated = $request->validated();

        if (isset($validated['status']) && $validated['status'] === 'completed' && $topic->status !== 'completed') {
            $validated['completed_at'] = Carbon::now();
        } elseif (isset($validated['status']) && $validated['status'] !== 'completed') {
            $validated['completed_at'] = null;
        }

        $topic->update($validated);

        return response()->json([
            'message' => 'Topic updated successfully.',
            'data' => $topic->load('subtopics'),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:not_started,in_progress,completed,needs_revision'],
        ]);

        $topic = Topic::whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($id);

        $updateData = ['status' => $validated['status']];
        if ($validated['status'] === 'completed') {
            $updateData['completed_at'] = Carbon::now();
        } else {
            $updateData['completed_at'] = null;
        }

        $topic->update($updateData);

        return response()->json([
            'message' => "Topic status updated to {$validated['status']}.",
            'data' => $topic,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $topic = Topic::whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($id);

        $topic->delete();

        return response()->json([
            'message' => 'Topic deleted successfully.',
        ]);
    }
}

