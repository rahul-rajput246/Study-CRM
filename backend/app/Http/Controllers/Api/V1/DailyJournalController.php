<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DailyJournal;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyJournalController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $todayStr = Carbon::today()->toDateString();
        $journal = DailyJournal::where('user_id', $request->user()->id)
            ->whereDate('journal_date', $todayStr)
            ->first();

        return response()->json([
            'status' => 'success',
            'journal_date' => $todayStr,
            'journal' => $journal,
        ]);
    }

    public function showByDate(Request $request, string $date): JsonResponse
    {
        $parsedDate = Carbon::parse($date)->toDateString();
        $journal = DailyJournal::where('user_id', $request->user()->id)
            ->whereDate('journal_date', $parsedDate)
            ->first();

        return response()->json([
            'status' => 'success',
            'journal_date' => $parsedDate,
            'journal' => $journal,
        ]);
    }

    public function save(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'journal_date' => ['nullable', 'date'],
            'what_learned' => ['nullable', 'string', 'max:5000'],
            'what_understood' => ['nullable', 'string', 'max:5000'],
            'what_was_difficult' => ['nullable', 'string', 'max:5000'],
            'solved_independently' => ['nullable', 'string', 'max:5000'],
            'needs_revision' => ['nullable', 'string', 'max:5000'],
            'tomorrow_focus' => ['nullable', 'string', 'max:5000'],
            'daily_rating' => ['nullable', 'integer', 'between:1,5'],
        ]);

        $date = $validated['journal_date'] ?? Carbon::today()->toDateString();

        $journal = DailyJournal::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'journal_date' => $date,
            ],
            [
                'what_learned' => $validated['what_learned'] ?? null,
                'what_understood' => $validated['what_understood'] ?? null,
                'what_was_difficult' => $validated['what_was_difficult'] ?? null,
                'solved_independently' => $validated['solved_independently'] ?? null,
                'needs_revision' => $validated['needs_revision'] ?? null,
                'tomorrow_focus' => $validated['tomorrow_focus'] ?? null,
                'daily_rating' => $validated['daily_rating'] ?? 4,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Daily engineering journal saved successfully.',
            'journal' => $journal,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $journals = DailyJournal::where('user_id', $request->user()->id)
            ->orderByDesc('journal_date')
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $journals->items(),
            'pagination' => [
                'current_page' => $journals->currentPage(),
                'last_page' => $journals->lastPage(),
                'per_page' => $journals->perPage(),
                'total' => $journals->total(),
            ],
        ]);
    }
}

