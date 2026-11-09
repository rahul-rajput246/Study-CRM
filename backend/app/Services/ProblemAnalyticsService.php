<?php

namespace App\Services;

use App\Models\ProblemLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProblemAnalyticsService
{
    public function getAnalytics(User $user): array
    {
        $baseQuery = ProblemLog::where('user_id', $user->id);

        $totalCount = (clone $baseQuery)->count();

        // 1. Difficulty Distribution
        $difficultyCounts = (clone $baseQuery)
            ->select('difficulty', DB::raw('count(*) as count'))
            ->groupBy('difficulty')
            ->pluck('count', 'difficulty')
            ->toArray();

        $easyCount = $difficultyCounts['easy'] ?? 0;
        $mediumCount = $difficultyCounts['medium'] ?? 0;
        $hardCount = $difficultyCounts['hard'] ?? 0;

        // 2. Independence Level Breakdown
        $independenceCounts = (clone $baseQuery)
            ->select('independence_level', DB::raw('count(*) as count'))
            ->groupBy('independence_level')
            ->pluck('count', 'independence_level')
            ->toArray();

        $independentCount = $independenceCounts['independent'] ?? 0;
        $smallHintCount = $independenceCounts['small_hint'] ?? 0;
        $guidedCount = $independenceCounts['significant_guidance'] ?? 0;
        $memorizedCount = $independenceCounts['solution_memorized'] ?? 0;

        $independenceRatio = $totalCount > 0
            ? round(($independentCount / $totalCount) * 100)
            : 100;

        // 3. Platform Distribution
        $platformCounts = (clone $baseQuery)
            ->select('platform', DB::raw('count(*) as count'))
            ->groupBy('platform')
            ->pluck('count', 'platform')
            ->toArray();

        // 4. Pattern Breakdown
        $patternCounts = (clone $baseQuery)
            ->whereNotNull('pattern')
            ->select('pattern', DB::raw('count(*) as count'))
            ->groupBy('pattern')
            ->orderByDesc('count')
            ->pluck('count', 'pattern')
            ->toArray();

        // 5. Time Spent
        $totalMinutes = (clone $baseQuery)->sum('time_spent_minutes');
        $avgMinutes = $totalCount > 0 ? round($totalMinutes / $totalCount) : 0;

        // 6. Needs Revisit Count
        $needsRevisitCount = (clone $baseQuery)
            ->where(function ($q) {
                $q->where('status', 'needs_revisit')
                    ->orWhere('independence_level', 'solution_memorized');
            })
            ->count();

        // 7. Benchmark Assessment
        if ($totalCount === 0) {
            $benchmarkRating = 'No Problems Logged Yet';
            $benchmarkTier = 'starter';
        } elseif ($independenceRatio >= 70) {
            $benchmarkRating = 'Elite Independence (₹40 LPA+ Ready)';
            $benchmarkTier = 'elite';
        } elseif ($independenceRatio >= 50) {
            $benchmarkRating = 'Proficient Independent Thinker';
            $benchmarkTier = 'proficient';
        } else {
            $benchmarkRating = 'Developing Independence (Reduce Tutorial Dependence)';
            $benchmarkTier = 'developing';
        }

        return [
            'total_solved' => $totalCount,
            'independence_ratio_pct' => $independenceRatio,
            'benchmark' => [
                'rating' => $benchmarkRating,
                'tier' => $benchmarkTier,
                'target_pct' => 70,
            ],
            'difficulty' => [
                'easy' => $easyCount,
                'medium' => $mediumCount,
                'hard' => $hardCount,
            ],
            'independence' => [
                'independent' => $independentCount,
                'small_hint' => $smallHintCount,
                'significant_guidance' => $guidedCount,
                'solution_memorized' => $memorizedCount,
            ],
            'time' => [
                'total_minutes' => $totalMinutes,
                'total_hours' => round($totalMinutes / 60, 1),
                'avg_minutes_per_problem' => $avgMinutes,
            ],
            'needs_revisit_count' => $needsRevisitCount,
            'platforms' => $platformCounts,
            'patterns' => $patternCounts,
        ];
    }
}

