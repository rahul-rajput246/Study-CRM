<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subtopic;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubtopicController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic_id' => ['required', 'exists:topics,id'],
            'title' => ['required', 'string', 'max:255'],
        ]);

        $topic = Topic::whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($validated['topic_id']);

        $order = $topic->subtopics()->count();

        $subtopic = $topic->subtopics()->create([
            'title' => $validated['title'],
            'is_completed' => false,
            'order_index' => $order + 1,
        ]);

        return response()->json([
            'message' => 'Subtopic added successfully.',
            'data' => $subtopic,
        ], 201);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $subtopic = Subtopic::whereHas('topic.subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with('topic.subtopics')
            ->findOrFail($id);

        $subtopic->update([
            'is_completed' => ! $subtopic->is_completed,
        ]);

        // Calculate new topic rollup stats
        $topic = $subtopic->topic->fresh(['subtopics']);
        $total = $topic->subtopics->count();
        $completed = $topic->subtopics->where('is_completed', true)->count();
        $percent = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        // Auto-update topic status if all subtopics done and was not_started
        if ($percent === 100 && $topic->status !== 'completed') {
            $topic->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        } elseif ($percent > 0 && $topic->status === 'not_started') {
            $topic->update([
                'status' => 'in_progress',
            ]);
        }

        return response()->json([
            'message' => 'Subtopic toggled.',
            'data' => [
                'subtopic' => $subtopic,
                'topic_id' => $topic->id,
                'topic_status' => $topic->status,
                'completion_percent' => $percent,
                'completed_count' => $completed,
                'total_count' => $total,
            ],
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $subtopic = Subtopic::whereHas('topic.subject.phase.roadmap', fn ($q) => $q->where('user_id', $request->user()->id))
            ->findOrFail($id);

        $subtopic->delete();

        return response()->json([
            'message' => 'Subtopic deleted successfully.',
        ]);
    }
}

