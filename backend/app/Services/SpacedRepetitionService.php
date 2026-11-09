<?php

namespace App\Services;

use App\Models\RevisionItem;
use App\Models\RevisionLog;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class SpacedRepetitionService
{
    /**
     * Process an active recall review using SuperMemo SM-2 principles.
     */
    public function reviewItem(
        User $user,
        int $revisionItemId,
        string $rating,
        ?string $reviewNotes = null
    ): array {
        $item = RevisionItem::with('topic.subject.phase')
            ->where('user_id', $user->id)
            ->findOrFail($revisionItemId);

        $currentRepetitions = $item->repetition_count;
        $currentInterval = $item->interval_days ?: 1;
        $currentEaseFactor = (float) ($item->ease_factor ?: 2.50);

        $today = Carbon::today();

        switch ($rating) {
            case 'again': // Quality 1: Total Blackout / Relearn
                $ratingScore = 1;
                $newRepetitions = 0;
                $newInterval = 1;
                $newEaseFactor = max(1.30, round($currentEaseFactor - 0.20, 2));
                $confidence = 1;
                break;

            case 'hard': // Quality 2: Recalled with significant effort
                $ratingScore = 2;
                $newRepetitions = $currentRepetitions + 1;
                if ($newRepetitions === 1) {
                    $newInterval = 1;
                } elseif ($newRepetitions === 2) {
                    $newInterval = 2;
                } else {
                    $newInterval = max(2, (int) round($currentInterval * 1.2));
                }
                $newEaseFactor = max(1.30, round($currentEaseFactor - 0.15, 2));
                $confidence = 3;
                break;

            case 'good': // Quality 3: Solid recall with reasonable effort
                $ratingScore = 3;
                $newRepetitions = $currentRepetitions + 1;
                if ($newRepetitions === 1) {
                    $newInterval = 1;
                } elseif ($newRepetitions === 2) {
                    $newInterval = 3;
                } else {
                    $newInterval = max(3, (int) round($currentInterval * $currentEaseFactor));
                }
                $newEaseFactor = $currentEaseFactor; // preserve baseline
                $confidence = 4;
                break;

            case 'easy': // Quality 4: Immediate, effortless recall
                $ratingScore = 4;
                $newRepetitions = $currentRepetitions + 1;
                if ($newRepetitions === 1) {
                    $newInterval = 2;
                } elseif ($newRepetitions === 2) {
                    $newInterval = 4;
                } else {
                    $newInterval = max(4, (int) round($currentInterval * $currentEaseFactor * 1.3));
                }
                $newEaseFactor = min(3.50, round($currentEaseFactor + 0.15, 2));
                $confidence = 5;
                break;

            default:
                throw new \InvalidArgumentException("Invalid recall rating '{$rating}'. Must be again, hard, good, or easy.");
        }

        $nextDate = $today->copy()->addDays($newInterval);

        // Update Revision Item
        $item->update([
            'repetition_count' => $newRepetitions,
            'interval_days' => $newInterval,
            'ease_factor' => $newEaseFactor,
            'confidence_score' => $confidence,
            'next_revision_date' => $nextDate->toDateString(),
            'last_revised_at' => $today->toDateString(),
            'status' => 'completed',
        ]);

        // Audit Log
        $log = RevisionLog::create([
            'revision_item_id' => $item->id,
            'rating' => $rating,
            'rating_score' => $ratingScore,
            'interval_applied' => $newInterval,
            'review_notes' => $reviewNotes,
            'created_at' => Carbon::now(),
        ]);

        return [
            'message' => 'Review recorded successfully.',
            'item' => $item->fresh(['topic.subject.phase', 'logs']),
            'next_revision' => [
                'interval_days' => $newInterval,
                'next_date' => $nextDate->toDateString(),
                'formatted_next_date' => $nextDate->format('D, d M Y'),
                'ease_factor' => $newEaseFactor,
                'repetitions' => $newRepetitions,
            ],
            'log' => $log,
        ];
    }

    /**
     * Get review queue (due today and overdue).
     */
    public function getDueQueue(User $user): Collection
    {
        $today = Carbon::today()->toDateString();

        return RevisionItem::with(['topic.subject.phase', 'logs'])
            ->where('user_id', $user->id)
            ->whereDate('next_revision_date', '<=', $today)
            ->orderBy('next_revision_date')
            ->orderBy('confidence_score')
            ->get();
    }

    /**
     * Get upcoming revisions schedule.
     */
    public function getUpcomingSchedule(User $user, int $daysAhead = 14): array
    {
        $today = Carbon::today();
        $endDate = $today->copy()->addDays($daysAhead);

        $items = RevisionItem::with(['topic.subject'])
            ->where('user_id', $user->id)
            ->whereBetween('next_revision_date', [$today->copy()->addDay()->toDateString(), $endDate->toDateString()])
            ->orderBy('next_revision_date')
            ->get();

        return $items->groupBy(fn ($item) => $item->next_revision_date->toDateString())->toArray();
    }

    /**
     * Get quantitative retention analytics.
     */
    public function getRetentionAnalytics(User $user): array
    {
        $today = Carbon::today()->toDateString();

        $totalItems = RevisionItem::where('user_id', $user->id)->count();
        $dueCount = RevisionItem::where('user_id', $user->id)
            ->whereDate('next_revision_date', '<=', $today)
            ->count();

        // Cards categorized by mastery
        $masteredCount = RevisionItem::where('user_id', $user->id)
            ->where('repetition_count', '>=', 3)
            ->where('interval_days', '>=', 14)
            ->count();

        $learningCount = $totalItems - $masteredCount;

        // Average Ease Factor
        $avgEaseFactor = RevisionItem::where('user_id', $user->id)->avg('ease_factor') ?: 2.50;

        // Review Logs Performance
        $userItemIds = RevisionItem::where('user_id', $user->id)->pluck('id');
        $totalReviews = RevisionLog::whereIn('revision_item_id', $userItemIds)->count();

        $successfulReviews = RevisionLog::whereIn('revision_item_id', $userItemIds)
            ->whereIn('rating', ['good', 'easy'])
            ->count();

        $retentionRate = $totalReviews > 0 ? round(($successfulReviews / $totalReviews) * 100) : 100;

        return [
            'total_items' => $totalItems,
            'due_today_count' => $dueCount,
            'mastered_count' => $masteredCount,
            'learning_count' => $learningCount,
            'retention_rate_pct' => $retentionRate,
            'average_ease_factor' => round($avgEaseFactor, 2),
            'total_reviews_logged' => $totalReviews,
        ];
    }

    /**
     * Create a new revision item.
     */
    public function createItem(User $user, array $data): RevisionItem
    {
        return RevisionItem::create([
            'user_id' => $user->id,
            'topic_id' => $data['topic_id'],
            'concept_prompt' => $data['concept_prompt'] ?? null,
            'key_takeaways' => $data['key_takeaways'] ?? null,
            'confidence_score' => $data['confidence_score'] ?? 3,
            'repetition_count' => 0,
            'interval_days' => 1,
            'ease_factor' => 2.50,
            'next_revision_date' => $data['next_revision_date'] ?? Carbon::today()->toDateString(),
            'status' => 'pending',
        ]);
    }
}

