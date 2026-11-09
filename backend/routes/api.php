<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DailyJournalController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ProblemLogController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RevisionController;
use App\Http\Controllers\Api\V1\RoadmapController;
use App\Http\Controllers\Api\V1\ScheduleController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\StudyNoteController;
use App\Http\Controllers\Api\V1\StudySessionController;
use App\Http\Controllers\Api\V1\SubtopicController;
use App\Http\Controllers\Api\V1\TopicController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health Check Diagnostic Route
    Route::get('/health', function () {
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
            $dbName = DB::connection()->getDatabaseName();
        } catch (\Exception $e) {
            $dbStatus = 'error: ' . $e->getMessage();
            $dbName = null;
        }

        return response()->json([
            'status' => 'healthy',
            'app_name' => config('app.name'),
            'environment' => config('app.env'),
            'timezone' => config('app.timezone'),
            'server_time' => now()->toIso8601String(),
            'database' => [
                'status' => $dbStatus,
                'name' => $dbName,
            ],
            'version' => '1.0.0',
        ]);
    });

    // Public Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated Auth Management
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
        });

        // Main Command Center Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/overview', [DashboardController::class, 'overview']);
            Route::get('/today-schedule', [DashboardController::class, 'todaySchedule']);
            Route::patch('/schedules/{id}/status', [DashboardController::class, 'updateStatus']);
        });

        // Roadmap Management
        Route::apiResource('roadmaps', RoadmapController::class);
        Route::post('/roadmaps/{id}/phases', [RoadmapController::class, 'storePhase']);
        Route::post('/phases/{id}/subjects', [RoadmapController::class, 'storeSubject']);

        // Topics & Subtopics Management
        Route::post('/topics', [TopicController::class, 'store']);
        Route::get('/topics/{id}', [TopicController::class, 'show']);
        Route::put('/topics/{id}', [TopicController::class, 'update']);
        Route::patch('/topics/{id}/status', [TopicController::class, 'updateStatus']);
        Route::delete('/topics/{id}', [TopicController::class, 'destroy']);

        Route::post('/subtopics', [SubtopicController::class, 'store']);
        Route::patch('/subtopics/{id}/toggle', [SubtopicController::class, 'toggle']);
        Route::delete('/subtopics/{id}', [SubtopicController::class, 'destroy']);

        // Smart Daily Study Scheduler & Calendar
        Route::get('/schedules/calendar/{view}', [ScheduleController::class, 'calendarView']);
        Route::post('/schedules/check-conflicts', [ScheduleController::class, 'checkConflicts']);
        Route::patch('/schedules/{id}/reschedule', [ScheduleController::class, 'reschedule']);
        Route::apiResource('schedules', ScheduleController::class);

        // Notification & Reminder Engine
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('/sync', [NotificationController::class, 'syncAlerts']);
            Route::patch('/mark-all-read', [NotificationController::class, 'markAllRead']);
            Route::delete('/clear-read', [NotificationController::class, 'clearRead']);
            Route::patch('/{id}/read', [NotificationController::class, 'markRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
            Route::get('/preferences', [NotificationController::class, 'getPreferences']);
            Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
        });

        // Spaced Repetition & Revision Center
        Route::prefix('revisions')->group(function () {
            Route::get('/', [RevisionController::class, 'index']);
            Route::get('/due', [RevisionController::class, 'dueQueue']);
            Route::get('/upcoming', [RevisionController::class, 'upcoming']);
            Route::get('/analytics', [RevisionController::class, 'analytics']);
            Route::post('/', [RevisionController::class, 'store']);
            Route::get('/{id}', [RevisionController::class, 'show']);
            Route::post('/{id}/review', [RevisionController::class, 'review']);
            Route::delete('/{id}', [RevisionController::class, 'destroy']);
        });

        // Problem-Solving Development Tracker
        Route::prefix('problems')->group(function () {
            Route::get('/', [ProblemLogController::class, 'index']);
            Route::get('/analytics', [ProblemLogController::class, 'analytics']);
            Route::post('/', [ProblemLogController::class, 'store']);
            Route::get('/{id}', [ProblemLogController::class, 'show']);
            Route::put('/{id}', [ProblemLogController::class, 'update']);
            Route::delete('/{id}', [ProblemLogController::class, 'destroy']);
        });

        // Study Sessions (Focus Timer)
        Route::prefix('sessions')->group(function () {
            Route::get('/active', [StudySessionController::class, 'active']);
            Route::post('/start', [StudySessionController::class, 'start']);
            Route::patch('/{id}/heartbeat', [StudySessionController::class, 'heartbeat']);
            Route::post('/{id}/complete', [StudySessionController::class, 'complete']);
            Route::post('/{id}/abandon', [StudySessionController::class, 'abandon']);
            Route::get('/history', [StudySessionController::class, 'history']);
        });

        // Study Notes
        Route::apiResource('notes', StudyNoteController::class);

        // Daily Engineering Journal
        Route::prefix('journals')->group(function () {
            Route::get('/today', [DailyJournalController::class, 'today']);
            Route::get('/history', [DailyJournalController::class, 'history']);
            Route::get('/{date}', [DailyJournalController::class, 'showByDate']);
            Route::post('/', [DailyJournalController::class, 'save']);
        });

        // Quantitative Analytics & Performance Reports
        Route::prefix('reports')->group(function () {
            Route::get('/comprehensive', [ReportController::class, 'comprehensive']);
        });

        // Settings, Profile & Preferences
        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingController::class, 'index']);
            Route::put('/profile', [SettingController::class, 'updateProfile']);
            Route::put('/study-preferences', [SettingController::class, 'updateStudyPreferences']);
            Route::put('/password', [SettingController::class, 'updatePassword']);
            Route::get('/export', [SettingController::class, 'exportData']);
        });
    });
});
