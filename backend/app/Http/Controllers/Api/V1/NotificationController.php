<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filter = $request->query('filter', 'all');
        $perPage = (int) $request->query('per_page', 25);

        $result = $this->notificationService->getNotifications($request->user(), $filter, $perPage);
        $prefs = $this->notificationService->getPreferences($request->user());

        return response()->json([
            'status' => 'success',
            'unread_count' => $result['unread_count'],
            'notifications' => $result['notifications'],
            'pagination' => $result['pagination'],
            'preferences' => $prefs,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->notificationService->generateLiveAlerts($user);
        $count = $this->notificationService->getUnreadCount($user);

        return response()->json([
            'status' => 'success',
            'unread_count' => $count,
        ]);
    }

    public function syncAlerts(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->notificationService->generateLiveAlerts($user);
        $count = $this->notificationService->getUnreadCount($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Notifications synchronized.',
            'unread_count' => $count,
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $notification = $this->notificationService->markAsRead($request->user(), $id);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read.',
            'notification' => $notification,
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'status' => 'success',
            'message' => "All notifications marked as read ({$count} updated).",
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->notificationService->deleteNotification($request->user(), $id);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification deleted.',
        ]);
    }

    public function clearRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->clearRead($request->user());

        return response()->json([
            'status' => 'success',
            'message' => "Cleared {$count} read notifications.",
        ]);
    }

    public function getPreferences(Request $request): JsonResponse
    {
        $prefs = $this->notificationService->getPreferences($request->user());

        return response()->json([
            'status' => 'success',
            'preferences' => $prefs,
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'in_app_enabled' => ['sometimes', 'boolean'],
            'browser_enabled' => ['sometimes', 'boolean'],
            'lead_time_minutes' => ['sometimes', 'integer', 'min:1', 'max:120'],
            'notify_upcoming_sessions' => ['sometimes', 'boolean'],
            'notify_overdue_tasks' => ['sometimes', 'boolean'],
            'notify_revision_due' => ['sometimes', 'boolean'],
            'sound_enabled' => ['sometimes', 'boolean'],
        ]);

        $prefs = $this->notificationService->updatePreferences($request->user(), $validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification preferences updated.',
            'preferences' => $prefs,
        ]);
    }
}

