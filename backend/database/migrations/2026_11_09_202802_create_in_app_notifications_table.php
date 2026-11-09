<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('in_app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // session_reminder, overdue_alert, revision_due, streak_milestone, goal_progress, system
            $table->string('title');
            $table->text('message');
            $table->string('action_tab')->default('dashboard'); // schedule, revision, roadmap, dashboard
            $table->unsignedBigInteger('action_id')->nullable();
            $table->json('data')->nullable();
            $table->boolean('is_read')->default(false)->index();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_read', 'created_at']);
        });

        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->boolean('notify_upcoming_sessions')->default(true)->after('lead_time_minutes');
            $table->boolean('notify_overdue_tasks')->default(true)->after('notify_upcoming_sessions');
            $table->boolean('notify_revision_due')->default(true)->after('notify_overdue_tasks');
            $table->boolean('sound_enabled')->default(true)->after('notify_revision_due');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('in_app_notifications');

        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'notify_upcoming_sessions',
                'notify_overdue_tasks',
                'notify_revision_due',
                'sound_enabled',
            ]);
        });
    }
};
