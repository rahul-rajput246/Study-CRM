<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\DailyJournal;
use App\Models\NotificationPreference;
use App\Models\ProblemLog;
use App\Models\RevisionItem;
use App\Models\Roadmap;
use App\Models\StudyNote;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Models\Topic;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SettingController extends Controller
{
    /**
     * Get complete settings overview, profile, preferences, and data counts.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $preferences = NotificationPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'in_app_study_reminder' => true,
                'in_app_daily_summary' => true,
                'in_app_streak_alert' => true,
                'browser_enabled' => false,
                'lead_time_minutes' => 15,
            ]
        );

        $stats = [
            'total_tracks' => Roadmap::where('user_id', $user->id)->count(),
            'total_topics' => Topic::whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $user->id))->count(),
            'completed_topics' => Topic::whereHas('subject.phase.roadmap', fn ($q) => $q->where('user_id', $user->id))
                ->where('status', 'completed')->count(),
            'total_schedules' => StudySchedule::where('user_id', $user->id)->count(),
            'total_sessions' => StudySession::where('user_id', $user->id)->count(),
            'total_revision_items' => RevisionItem::where('user_id', $user->id)->count(),
            'total_problem_logs' => ProblemLog::where('user_id', $user->id)->count(),
            'total_study_notes' => StudyNote::where('user_id', $user->id)->count(),
            'total_journals' => DailyJournal::where('user_id', $user->id)->count(),
        ];

        return response()->json([
            'user' => new UserResource($user),
            'notification_preferences' => $preferences,
            'workspace_stats' => $stats,
            'system' => [
                'timezone' => $user->timezone ?: config('app.timezone'),
                'server_time' => Carbon::now($user->timezone ?: 'Asia/Kolkata')->toIso8601String(),
                'version' => '1.0.0',
                'target_lpa' => '₹40 LPA+',
            ],
        ]);
    }

    /**
     * Update user profile information.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_role' => ['required', 'string', 'max:255'],
            'daily_goal_minutes' => ['required', 'integer', 'min:30', 'max:1440'],
            'timezone' => ['required', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Engineering profile successfully updated.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Update focus timer and algorithm study preferences.
     */
    public function updateStudyPreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'pomodoro_minutes' => ['required', 'integer', 'min:10', 'max:120'],
            'short_break_minutes' => ['required', 'integer', 'min:1', 'max:30'],
            'long_break_minutes' => ['required', 'integer', 'min:5', 'max:60'],
            'sound_alerts' => ['required', 'boolean'],
            'auto_start_breaks' => ['required', 'boolean'],
            'sm2_default_ease' => ['required', 'numeric', 'min:1.30', 'max:3.50'],
            'sm2_daily_limit' => ['required', 'integer', 'min:5', 'max:100'],
        ]);

        $existing = $user->custom_settings ?: [];
        $merged = array_merge($existing, $validated);

        $user->update(['custom_settings' => $merged]);

        return response()->json([
            'message' => 'Study & algorithm preferences saved.',
            'custom_settings' => $merged,
        ]);
    }

    /**
     * Change account password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided current password does not match our records.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Security password successfully updated.',
        ]);
    }

    /**
     * Full portfolio export as structured JSON.
     */
    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user();

        $roadmaps = Roadmap::where('user_id', $user->id)
            ->with(['phases.subjects.topics.subtopics'])
            ->get();

        $schedules = StudySchedule::where('user_id', $user->id)->get();
        $sessions = StudySession::where('user_id', $user->id)->get();
        $revisions = RevisionItem::where('user_id', $user->id)->with('logs')->get();
        $problems = ProblemLog::where('user_id', $user->id)->get();
        $notes = StudyNote::where('user_id', $user->id)->get();
        $journals = DailyJournal::where('user_id', $user->id)->get();

        return response()->json([
            'meta' => [
                'exported_at' => Carbon::now()->toIso8601String(),
                'application' => 'StudyOS - Personal Study Management CRM',
                'target_role' => $user->target_role,
                'version' => '1.0.0',
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'timezone' => $user->timezone,
                'daily_goal_minutes' => $user->daily_goal_minutes,
                'bio' => $user->bio,
            ],
            'roadmaps' => $roadmaps,
            'schedules' => $schedules,
            'sessions' => $sessions,
            'revisions' => $revisions,
            'problems' => $problems,
            'notes' => $notes,
            'journals' => $journals,
        ]);
    }
}
