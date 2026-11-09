<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoadmapRequest;
use App\Models\Phase;
use App\Models\Roadmap;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoadmapController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $roadmaps = Roadmap::with(['phases.subjects.topics.subtopics'])
            ->where('user_id', $request->user()->id)
            ->orderBy('order_index')
            ->get();

        $formatted = $roadmaps->map(function ($roadmap) {
            $allTopics = $roadmap->phases->flatMap->subjects->flatMap->topics;
            $totalTopics = $allTopics->count();
            $completedTopics = $allTopics->where('status', 'completed')->count();
            $inProgressTopics = $allTopics->where('status', 'in_progress')->count();
            $progressPercent = $totalTopics > 0 ? (int) round(($completedTopics / $totalTopics) * 100) : 0;

            return [
                'id' => $roadmap->id,
                'title' => $roadmap->title,
                'slug' => $roadmap->slug,
                'track_type' => $roadmap->track_type,
                'description' => $roadmap->description,
                'status' => $roadmap->status,
                'total_phases' => $roadmap->phases->count(),
                'total_subjects' => $roadmap->phases->sum(fn ($p) => $p->subjects->count()),
                'total_topics' => $totalTopics,
                'completed_topics' => $completedTopics,
                'in_progress_topics' => $inProgressTopics,
                'progress_percent' => $progressPercent,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $roadmap = Roadmap::with([
            'phases' => function ($q) {
                $q->orderBy('order_index');
            },
            'phases.subjects' => function ($q) {
                $q->orderBy('order_index');
            },
            'phases.subjects.topics' => function ($q) {
                $q->orderBy('order_index');
            },
            'phases.subjects.topics.subtopics' => function ($q) {
                $q->orderBy('order_index');
            },
        ])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Calculate progress hierarchy
        $allTopics = $roadmap->phases->flatMap->subjects->flatMap->topics;
        $totalTopics = $allTopics->count();
        $completedTopics = $allTopics->where('status', 'completed')->count();
        $overallProgress = $totalTopics > 0 ? (int) round(($completedTopics / $totalTopics) * 100) : 0;

        $phasesData = $roadmap->phases->map(function ($phase) {
            $phaseTopics = $phase->subjects->flatMap->topics;
            $pTotal = $phaseTopics->count();
            $pCompleted = $phaseTopics->where('status', 'completed')->count();
            $pProgress = $pTotal > 0 ? (int) round(($pCompleted / $pTotal) * 100) : 0;

            return [
                'id' => $phase->id,
                'title' => $phase->title,
                'description' => $phase->description,
                'order_index' => $phase->order_index,
                'status' => $phase->status,
                'total_topics' => $pTotal,
                'completed_topics' => $pCompleted,
                'progress_percent' => $pProgress,
                'subjects' => $phase->subjects->map(function ($subject) {
                    $sTotal = $subject->topics->count();
                    $sCompleted = $subject->topics->where('status', 'completed')->count();
                    $sProgress = $sTotal > 0 ? (int) round(($sCompleted / $sTotal) * 100) : 0;

                    return [
                        'id' => $subject->id,
                        'title' => $subject->title,
                        'icon' => $subject->icon,
                        'order_index' => $subject->order_index,
                        'status' => $subject->status,
                        'total_topics' => $sTotal,
                        'completed_topics' => $sCompleted,
                        'progress_percent' => $sProgress,
                        'topics' => $subject->topics->map(function ($topic) {
                            $subTotal = $topic->subtopics->count();
                            $subCompleted = $topic->subtopics->where('is_completed', true)->count();
                            $subProgress = $subTotal > 0 ? (int) round(($subCompleted / $subTotal) * 100) : 0;

                            return [
                                'id' => $topic->id,
                                'title' => $topic->title,
                                'description' => $topic->description,
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
                                'subtopics_count' => $subTotal,
                                'subtopics_completed' => $subCompleted,
                                'completion_percent' => $topic->status === 'completed' ? 100 : $subProgress,
                                'subtopics' => $topic->subtopics->map(fn ($st) => [
                                    'id' => $st->id,
                                    'title' => $st->title,
                                    'is_completed' => $st->is_completed,
                                    'order_index' => $st->order_index,
                                ]),
                            ];
                        }),
                    ];
                }),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $roadmap->id,
                'title' => $roadmap->title,
                'slug' => $roadmap->slug,
                'track_type' => $roadmap->track_type,
                'description' => $roadmap->description,
                'status' => $roadmap->status,
                'total_topics' => $totalTopics,
                'completed_topics' => $completedTopics,
                'progress_percent' => $overallProgress,
                'phases' => $phasesData,
            ],
        ]);
    }

    public function store(StoreRoadmapRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $slug = Str::slug($validated['title']);

        $count = Roadmap::where('user_id', $request->user()->id)->count();

        $roadmap = Roadmap::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug . '-' . uniqid(),
            'track_type' => $validated['track_type'],
            'description' => $validated['description'] ?? null,
            'order_index' => $count + 1,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Roadmap track created successfully.',
            'data' => $roadmap,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $roadmap = Roadmap::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'track_type' => ['sometimes', 'in:foundation,dsa,fullstack,system_design,interview'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:active,paused,completed'],
        ]);

        $roadmap->update($validated);

        return response()->json([
            'message' => 'Roadmap track updated.',
            'data' => $roadmap,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $roadmap = Roadmap::where('user_id', $request->user()->id)->findOrFail($id);
        $roadmap->delete();

        return response()->json([
            'message' => 'Roadmap deleted successfully.',
        ]);
    }

    public function storePhase(Request $request, int $roadmapId): JsonResponse
    {
        $roadmap = Roadmap::where('user_id', $request->user()->id)->findOrFail($roadmapId);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $order = $roadmap->phases()->count();

        $phase = $roadmap->phases()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'order_index' => $order + 1,
            'status' => 'not_started',
        ]);

        return response()->json([
            'message' => 'Phase created successfully.',
            'data' => $phase,
        ], 201);
    }

    public function storeSubject(Request $request, int $phaseId): JsonResponse
    {
        $phase = Phase::whereHas('roadmap', fn ($q) => $q->where('user_id', $request->user()->id))->findOrFail($phaseId);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string'],
        ]);

        $order = $phase->subjects()->count();

        $subject = $phase->subjects()->create([
            'title' => $validated['title'],
            'icon' => $validated['icon'] ?? null,
            'order_index' => $order + 1,
            'status' => 'not_started',
        ]);

        return response()->json([
            'message' => 'Subject created successfully.',
            'data' => $subject,
        ], 201);
    }
}

