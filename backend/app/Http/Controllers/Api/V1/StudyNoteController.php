<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudyNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StudyNote::with(['topic.subject', 'session'])
            ->where('user_id', $request->user()->id);

        if ($request->filled('topic_id')) {
            $query->where('topic_id', $request->query('topic_id'));
        }

        if ($request->filled('note_type')) {
            $query->where('note_type', $request->query('note_type'));
        }

        if ($request->filled('search')) {
            $search = '%' . $request->query('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                    ->orWhere('content_markdown', 'like', $search);
            });
        }

        $notes = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $notes->items(),
            'pagination' => [
                'current_page' => $notes->currentPage(),
                'last_page' => $notes->lastPage(),
                'per_page' => $notes->perPage(),
                'total' => $notes->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content_markdown' => ['required', 'string'],
            'note_type' => ['required', 'in:concept,snippet,mistake_log,interview_qa,deep_dive'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'study_session_id' => ['nullable', 'exists:study_sessions,id'],
            'tags' => ['nullable', 'array'],
        ]);

        $note = StudyNote::create([
            'user_id' => $request->user()->id,
            'topic_id' => $validated['topic_id'] ?? null,
            'study_session_id' => $validated['study_session_id'] ?? null,
            'title' => $validated['title'],
            'content_markdown' => $validated['content_markdown'],
            'note_type' => $validated['note_type'],
            'tags' => $validated['tags'] ?? [],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Study note created.',
            'data' => $note->load('topic.subject'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $note = StudyNote::with(['topic.subject', 'session'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $note,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $note = StudyNote::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content_markdown' => ['sometimes', 'string'],
            'note_type' => ['sometimes', 'in:concept,snippet,mistake_log,interview_qa,deep_dive'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'study_session_id' => ['nullable', 'exists:study_sessions,id'],
            'tags' => ['nullable', 'array'],
        ]);

        $note->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Study note updated.',
            'data' => $note->fresh('topic.subject'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $note = StudyNote::where('user_id', $request->user()->id)->findOrFail($id);
        $note->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Study note deleted.',
        ]);
    }
}

