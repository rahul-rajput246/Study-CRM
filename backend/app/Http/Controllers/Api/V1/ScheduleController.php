<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RescheduleRequest;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Services\ScheduleConflictService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        protected ScheduleConflictService $conflictService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $startDate = $request->query('start_date', Carbon::today()->startOfWeek()->toDateString());
        $endDate = $request->query('end_date', Carbon::today()->endOfWeek()->toDateString());
        $status = $request->query('status');
        $priority = $request->query('priority');

        $query = StudySchedule::with(['topic.subject.phase', 'studySessions'])
            ->where('user_id', $request->user()->id)
            ->whereBetween('scheduled_date', [$startDate, $endDate]);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($priority && $priority !== 'all') {
            $query->where('priority', $priority);
        }

        $schedules = $query->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $schedules,
        ]);
    }

    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // 1. Check for overlapping session conflict
        $force = $request->boolean('force');
        $conflict = $this->conflictService->detectConflict(
            $user,
            $validated['scheduled_date'],
            $validated['start_time'],
            $validated['end_time']
        );

        if ($conflict && ! $force) {
            return response()->json([
                'status' => 'conflict',
                'message' => "Schedule overlaps with an existing activity: '{$conflict['conflicting_session']['title']}' ({$conflict['conflicting_session']['start_time']} - {$conflict['conflicting_session']['end_time']}).",
                'conflict' => $conflict,
            ], 409);
        }

        // 2. Compute estimated duration if not provided
        $start = Carbon::parse("{$validated['scheduled_date']} {$validated['start_time']}");
        $end = Carbon::parse("{$validated['scheduled_date']} {$validated['end_time']}");
        $duration = $validated['estimated_minutes'] ?? $start->diffInMinutes($end);

        // 3. Create primary schedule
        $schedule = StudySchedule::create([
            'user_id' => $user->id,
            'topic_id' => $validated['topic_id'] ?? null,
            'title' => $validated['title'],
            'scheduled_date' => $validated['scheduled_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'estimated_minutes' => $duration,
            'priority' => $validated['priority'],
            'recurrence' => $validated['recurrence'] ?? 'none',
            'status' => 'scheduled',
            'reminder_enabled' => $validated['reminder_enabled'] ?? true,
            'description' => $validated['description'] ?? null,
        ]);

        // 4. Handle repeating schedules (daily: 6 more days, weekly: 3 more weeks)
        if (($validated['recurrence'] ?? 'none') === 'daily') {
            for ($i = 1; $i <= 6; $i++) {
                $nextDate = Carbon::parse($validated['scheduled_date'])->addDays($i)->toDateString();
                StudySchedule::create([
                    'user_id' => $user->id,
                    'topic_id' => $validated['topic_id'] ?? null,
                    'title' => $validated['title'],
                    'scheduled_date' => $nextDate,
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'estimated_minutes' => $duration,
                    'priority' => $validated['priority'],
                    'recurrence' => 'daily',
                    'status' => 'scheduled',
                    'reminder_enabled' => $validated['reminder_enabled'] ?? true,
                    'description' => $validated['description'] ?? null,
                ]);
            }
        } elseif (($validated['recurrence'] ?? 'none') === 'weekly') {
            for ($i = 1; $i <= 3; $i++) {
                $nextDate = Carbon::parse($validated['scheduled_date'])->addWeeks($i)->toDateString();
                StudySchedule::create([
                    'user_id' => $user->id,
                    'topic_id' => $validated['topic_id'] ?? null,
                    'title' => $validated['title'],
                    'scheduled_date' => $nextDate,
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'estimated_minutes' => $duration,
                    'priority' => $validated['priority'],
                    'recurrence' => 'weekly',
                    'status' => 'scheduled',
                    'reminder_enabled' => $validated['reminder_enabled'] ?? true,
                    'description' => $validated['description'] ?? null,
                ]);
            }
        }

        return response()->json([
            'message' => 'Study activity scheduled successfully.',
            'data' => $schedule->load('topic'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $schedule = StudySchedule::with(['topic.subject.phase', 'studySessions'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $schedule,
        ]);
    }

    public function update(UpdateScheduleRequest $request, int $id): JsonResponse
    {
        $schedule = StudySchedule::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validated();

        // If time changed, check conflict
        $newDate = $validated['scheduled_date'] ?? $schedule->scheduled_date->toDateString();
        $newStart = $validated['start_time'] ?? substr($schedule->start_time, 0, 5);
        $newEnd = $validated['end_time'] ?? substr($schedule->end_time, 0, 5);

        if (isset($validated['start_time']) || isset($validated['end_time']) || isset($validated['scheduled_date'])) {
            $force = $request->boolean('force');
            $conflict = $this->conflictService->detectConflict(
                $request->user(),
                $newDate,
                $newStart,
                $newEnd,
                $schedule->id
            );

            if ($conflict && ! $force) {
                return response()->json([
                    'status' => 'conflict',
                    'message' => "Updated time collides with '{$conflict['conflicting_session']['title']}' ({$conflict['conflicting_session']['start_time']} - {$conflict['conflicting_session']['end_time']}).",
                    'conflict' => $conflict,
                ], 409);
            }
        }

        $schedule->update($validated);

        return response()->json([
            'message' => 'Study activity updated.',
            'data' => $schedule->load('topic'),
        ]);
    }

    public function reschedule(RescheduleRequest $request, int $id): JsonResponse
    {
        $schedule = StudySchedule::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validated();

        $force = $request->boolean('force');
        $conflict = $this->conflictService->detectConflict(
            $request->user(),
            $validated['scheduled_date'],
            $validated['start_time'],
            $validated['end_time'],
            $schedule->id
        );

        if ($conflict && ! $force) {
            return response()->json([
                'status' => 'conflict',
                'message' => "Rescheduled slot collides with '{$conflict['conflicting_session']['title']}' ({$conflict['conflicting_session']['start_time']} - {$conflict['conflicting_session']['end_time']}).",
                'conflict' => $conflict,
            ], 409);
        }

        $oldDate = $schedule->scheduled_date->toDateString();

        $schedule->update([
            'scheduled_date' => $validated['scheduled_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'rescheduled',
            'description' => ($schedule->description ? $schedule->description . "\n" : '') .
                "Rescheduled from {$oldDate}. Reason: " . ($validated['reschedule_reason'] ?? 'Shifted to maintain realistic pace.'),
        ]);

        return response()->json([
            'message' => 'Study session rescheduled successfully.',
            'data' => $schedule->load('topic'),
        ]);
    }

    public function checkConflicts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'ignore_id' => ['nullable', 'integer'],
        ]);

        $conflict = $this->conflictService->detectConflict(
            $request->user(),
            $validated['scheduled_date'],
            $validated['start_time'],
            $validated['end_time'],
            $validated['ignore_id'] ?? null
        );

        return response()->json([
            'has_conflict' => ! is_null($conflict),
            'conflict' => $conflict,
        ]);
    }

    public function calendarView(Request $request, string $view): JsonResponse
    {
        $user = $request->user();
        $dateParam = $request->query('date', Carbon::today()->toDateString());
        $currentDate = Carbon::parse($dateParam);

        if ($view === 'day') {
            $schedules = StudySchedule::with(['topic.subject', 'studySessions'])
                ->where('user_id', $user->id)
                ->whereDate('scheduled_date', $currentDate->toDateString())
                ->orderBy('start_time')
                ->get();

            // Planned vs actual for this specific day
            $plannedMins = $schedules->sum('estimated_minutes');
            $actualSecs = StudySession::where('user_id', $user->id)
                ->whereDate('started_at', $currentDate->toDateString())
                ->where('status', 'completed')
                ->sum('active_seconds');

            return response()->json([
                'status' => 'success',
                'view' => 'day',
                'date' => $currentDate->toDateString(),
                'formatted_date' => $currentDate->format('D, d M Y'),
                'planned_hours' => round($plannedMins / 60, 1),
                'actual_hours' => round($actualSecs / 3600, 1),
                'schedules' => $schedules,
            ]);
        }

        if ($view === 'week') {
            $startOfWeek = $currentDate->copy()->startOfWeek();
            $days = [];

            for ($i = 0; $i < 7; $i++) {
                $day = $startOfWeek->copy()->addDays($i);
                $dayStr = $day->toDateString();

                $daySchedules = StudySchedule::with(['topic.subject', 'studySessions'])
                    ->where('user_id', $user->id)
                    ->whereDate('scheduled_date', $dayStr)
                    ->orderBy('start_time')
                    ->get();

                $plannedMins = $daySchedules->sum('estimated_minutes');
                $actualSecs = StudySession::where('user_id', $user->id)
                    ->whereDate('started_at', $dayStr)
                    ->where('status', 'completed')
                    ->sum('active_seconds');

                $days[] = [
                    'date' => $dayStr,
                    'day_name' => $day->format('D'),
                    'day_number' => $day->format('d'),
                    'is_today' => $day->isToday(),
                    'planned_hours' => round($plannedMins / 60, 1),
                    'actual_hours' => round($actualSecs / 3600, 1),
                    'schedules' => $daySchedules,
                ];
            }

            return response()->json([
                'status' => 'success',
                'view' => 'week',
                'week_range' => "{$startOfWeek->format('d M')} - {$startOfWeek->copy()->addDays(6)->format('d M Y')}",
                'days' => $days,
            ]);
        }

        if ($view === 'month') {
            $startOfMonth = $currentDate->copy()->startOfMonth();
            $endOfMonth = $currentDate->copy()->endOfMonth();

            $schedules = StudySchedule::with('topic')
                ->where('user_id', $user->id)
                ->whereBetween('scheduled_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
                ->get()
                ->groupBy(fn ($s) => $s->scheduled_date->toDateString());

            return response()->json([
                'status' => 'success',
                'view' => 'month',
                'month_name' => $currentDate->format('F Y'),
                'month_number' => $currentDate->month,
                'year' => $currentDate->year,
                'days_in_month' => $currentDate->daysInMonth,
                'start_day_of_week' => $startOfMonth->dayOfWeek, // 0 = Sunday, 1 = Monday
                'schedules_by_date' => $schedules,
            ]);
        }

        if ($view === 'overdue') {
            $overdue = $this->conflictService->getOverdueSchedules($user);

            return response()->json([
                'status' => 'success',
                'view' => 'overdue',
                'count' => $overdue->count(),
                'data' => $overdue,
            ]);
        }

        return response()->json(['message' => 'Invalid view type.'], 400);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $schedule = StudySchedule::where('user_id', $request->user()->id)->findOrFail($id);
        $schedule->delete();

        return response()->json([
            'message' => 'Study activity deleted.',
        ]);
    }
}

