<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Roadmaps
        Schema::create('roadmaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->enum('track_type', ['foundation', 'dsa', 'fullstack', 'system_design', 'interview'])->default('fullstack');
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->enum('status', ['active', 'paused', 'completed'])->default('active');
            $table->timestamps();
        });

        // 2. Phases
        Schema::create('phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('roadmap_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->timestamps();
        });

        // 3. Subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phase_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('icon')->nullable();
            $table->integer('order_index')->default(0);
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->timestamps();
        });

        // 4. Topics
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('learning_objectives')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->integer('estimated_minutes')->default(60);
            $table->integer('actual_minutes')->default(0);
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'needs_revision'])->default('not_started');
            $table->date('start_date')->nullable();
            $table->date('target_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('order_index')->default(0);
            $table->text('personal_notes')->nullable();
            $table->timestamps();

            $table->index(['subject_id', 'status']);
        });

        // 5. Subtopics
        Schema::create('subtopics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->boolean('is_completed')->default(false);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 6. Study Schedules
        Schema::create('study_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->date('scheduled_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('estimated_minutes')->default(60);
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('recurrence', ['none', 'daily', 'weekly', 'custom'])->default('none');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'missed', 'rescheduled'])->default('scheduled');
            $table->boolean('reminder_enabled')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'scheduled_date', 'status']);
        });

        // 7. Study Sessions (Active Timers)
        Schema::create('study_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('study_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('session_type', ['pomodoro', 'custom', 'free_flow'])->default('pomodoro');
            $table->integer('planned_minutes')->default(25);
            $table->integer('active_seconds')->default(0);
            $table->integer('paused_seconds')->default(0);
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'abandoned', 'paused'])->default('in_progress');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'started_at']);
        });

        // 8. Revision Items (Spaced Repetition)
        Schema::create('revision_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->integer('repetition_count')->default(0);
            $table->integer('interval_days')->default(1);
            $table->decimal('ease_factor', 4, 2)->default(2.50);
            $table->date('next_revision_date');
            $table->date('last_revised_at')->nullable();
            $table->enum('status', ['pending', 'completed', 'overdue'])->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'next_revision_date', 'status']);
        });

        // 9. Revision Logs
        Schema::create('revision_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('revision_item_id')->constrained()->cascadeOnDelete();
            $table->enum('rating', ['again', 'hard', 'good', 'easy']);
            $table->tinyInteger('rating_score'); // 1, 2, 3, 4
            $table->integer('interval_applied');
            $table->text('review_notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 10. Problem Logs (Independence Tracker)
        Schema::create('problem_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->enum('platform', ['leetcode', 'hackerrank', 'gfg', 'project_feature', 'interview', 'other'])->default('leetcode');
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->string('language', 50)->default('JavaScript');
            $table->text('initial_understanding');
            $table->text('approach');
            $table->text('pseudocode')->nullable();
            $table->longText('code_solution');
            $table->text('test_cases')->nullable();
            $table->text('mistakes_made')->nullable();
            $table->text('key_learnings');
            $table->enum('independence_level', ['independent', 'small_hint', 'significant_guidance', 'solution_memorized'])->default('independent');
            $table->integer('time_spent_minutes')->default(30);
            $table->timestamps();

            $table->index(['user_id', 'independence_level', 'difficulty']);
        });

        // 11. Study Notes
        Schema::create('study_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('study_session_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->longText('content_markdown');
            $table->enum('note_type', ['concept', 'snippet', 'mistake_log', 'interview_qa', 'deep_dive'])->default('concept');
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        // 12. Daily Journals
        Schema::create('daily_journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('journal_date');
            $table->text('what_learned')->nullable();
            $table->text('what_understood')->nullable();
            $table->text('what_was_difficult')->nullable();
            $table->text('solved_independently')->nullable();
            $table->text('needs_revision')->nullable();
            $table->text('tomorrow_focus')->nullable();
            $table->tinyInteger('daily_rating')->default(4); // 1 to 5
            $table->timestamps();

            $table->unique(['user_id', 'journal_date']);
        });

        // 13. Notification Preferences
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('in_app_enabled')->default(true);
            $table->boolean('browser_enabled')->default(true);
            $table->integer('lead_time_minutes')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('daily_journals');
        Schema::dropIfExists('study_notes');
        Schema::dropIfExists('problem_logs');
        Schema::dropIfExists('revision_logs');
        Schema::dropIfExists('revision_items');
        Schema::dropIfExists('study_sessions');
        Schema::dropIfExists('study_schedules');
        Schema::dropIfExists('subtopics');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('phases');
        Schema::dropIfExists('roadmaps');
    }
};
