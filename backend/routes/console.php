<?php

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('studyos:sync-alerts', function (NotificationService $notificationService) {
    $this->info('Starting StudyOS background reminder & alert synchronization...');
    $users = User::all();
    $processed = 0;

    foreach ($users as $user) {
        $notificationService->generateLiveAlerts($user);
        $processed++;
    }

    $this->info("Completed synchronization for {$processed} user(s).");
})->purpose('Scan study schedules and generate upcoming session reminders and overdue alerts');

// Register in Laravel Scheduler to run every minute in background
Schedule::command('studyos:sync-alerts')->everyMinute();

