<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProblemLog;
use App\Services\ProblemAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProblemLogController extends Controller
{
    public function __construct(
        protected ProblemAnalyticsService $analyticsService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProblemLog::with('topic.subject')
            ->where('user_id', $request->user()->id);

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->query('difficulty'));
        }

        if ($request->filled('platform')) {
            $query->where('platform', $request->query('platform'));
        }

        if ($request->filled('independence_level')) {
            $query->where('independence_level', $request->query('independence_level'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('pattern')) {
            $query->where('pattern', $request->query('pattern'));
        }

        if ($request->filled('search')) {
            $search = '%' . $request->query('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                    ->orWhere('approach', 'like', $search)
                    ->orWhere('pattern', 'like', $search)
                    ->orWhere('key_learnings', 'like', $search);
            });
        }

        $problems = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $problems->items(),
            'pagination' => [
                'current_page' => $problems->currentPage(),
                'last_page' => $problems->lastPage(),
                'per_page' => $problems->perPage(),
                'total' => $problems->total(),
            ],
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $analytics = $this->analyticsService->getAnalytics($request->user());

        return response()->json([
            'status' => 'success',
            'analytics' => $analytics,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'platform' => ['required', 'in:leetcode,hackerrank,gfg,project_feature,interview,other'],
            'problem_url' => ['nullable', 'url', 'max:500'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            'pattern' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:50'],
            'time_complexity' => ['nullable', 'string', 'max:50'],
            'space_complexity' => ['nullable', 'string', 'max:50'],
            'initial_understanding' => ['required', 'string'],
            'approach' => ['required', 'string'],
            'pseudocode' => ['nullable', 'string'],
            'code_solution' => ['required', 'string'],
            'test_cases' => ['nullable', 'string'],
            'mistakes_made' => ['nullable', 'string'],
            'key_learnings' => ['required', 'string'],
            'independence_level' => ['required', 'in:independent,small_hint,significant_guidance,solution_memorized'],
            'time_spent_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:solved,attempted,needs_revisit'],
        ]);

        $problem = ProblemLog::create([
            'user_id' => $request->user()->id,
            'topic_id' => $validated['topic_id'] ?? null,
            'title' => $validated['title'],
            'platform' => $validated['platform'],
            'problem_url' => $validated['problem_url'] ?? null,
            'difficulty' => $validated['difficulty'],
            'pattern' => $validated['pattern'] ?? null,
            'language' => $validated['language'] ?? 'JavaScript',
            'time_complexity' => $validated['time_complexity'] ?? null,
            'space_complexity' => $validated['space_complexity'] ?? null,
            'initial_understanding' => $validated['initial_understanding'],
            'approach' => $validated['approach'],
            'pseudocode' => $validated['pseudocode'] ?? null,
            'code_solution' => $validated['code_solution'],
            'test_cases' => $validated['test_cases'] ?? null,
            'mistakes_made' => $validated['mistakes_made'] ?? null,
            'key_learnings' => $validated['key_learnings'],
            'independence_level' => $validated['independence_level'],
            'time_spent_minutes' => $validated['time_spent_minutes'] ?? 30,
            'status' => $validated['status'] ?? 'solved',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Problem solved and logged successfully.',
            'data' => $problem->load('topic.subject'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $problem = ProblemLog::with('topic.subject.phase')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $problem,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $problem = ProblemLog::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'platform' => ['sometimes', 'in:leetcode,hackerrank,gfg,project_feature,interview,other'],
            'problem_url' => ['nullable', 'url', 'max:500'],
            'difficulty' => ['sometimes', 'in:easy,medium,hard'],
            'pattern' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:50'],
            'time_complexity' => ['nullable', 'string', 'max:50'],
            'space_complexity' => ['nullable', 'string', 'max:50'],
            'initial_understanding' => ['sometimes', 'string'],
            'approach' => ['sometimes', 'string'],
            'pseudocode' => ['nullable', 'string'],
            'code_solution' => ['sometimes', 'string'],
            'test_cases' => ['nullable', 'string'],
            'mistakes_made' => ['nullable', 'string'],
            'key_learnings' => ['sometimes', 'string'],
            'independence_level' => ['sometimes', 'in:independent,small_hint,significant_guidance,solution_memorized'],
            'time_spent_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:solved,attempted,needs_revisit'],
        ]);

        $problem->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Problem log updated successfully.',
            'data' => $problem->fresh('topic.subject'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $problem = ProblemLog::where('user_id', $request->user()->id)->findOrFail($id);
        $problem->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Problem log deleted.',
        ]);
    }
}

