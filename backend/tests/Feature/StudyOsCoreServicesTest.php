<?php

namespace Tests\Feature;

use App\Models\Phase;
use App\Models\ProblemLog;
use App\Models\RevisionItem;
use App\Models\Roadmap;
use App\Models\StudySchedule;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use App\Services\ProblemAnalyticsService;
use App\Services\ScheduleConflictService;
use App\Services\SpacedRepetitionService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudyOsCoreServicesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test Health Check Endpoint.
     */
    public function test_health_check_returns_healthy_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'healthy',
                'app_name' => 'StudyOS',
                'timezone' => 'Asia/Kolkata',
            ]);
    }

    /**
     * Test Schedule Conflict Detection interval math.
     * Overlap formula: (existing.start < new.end) AND (existing.end > new.start)
     */
    public function test_schedule_conflict_service_detects_interval_overlaps(): void
    {
        $user = User::factory()->create();
        $date = Carbon::today()->toDateString();

        // Create an existing schedule: 10:00 to 11:30
        StudySchedule::create([
            'user_id' => $user->id,
            'title' => 'DSA Practice Block',
            'scheduled_date' => $date,
            'start_time' => '10:00',
            'end_time' => '11:30',
            'priority' => 'high',
            'status' => 'scheduled',
        ]);

        $service = new ScheduleConflictService();

        // 1. Partial overlap: 10:30 to 12:00 -> MUST CONFLICT
        $conflict1 = $service->detectConflict($user, $date, '10:30', '12:00');
        $this->assertNotNull($conflict1);
        $this->assertTrue($conflict1['has_conflict']);

        // 2. Enclosing overlap: 09:30 to 12:00 -> MUST CONFLICT
        $conflict2 = $service->detectConflict($user, $date, '09:30', '12:00');
        $this->assertNotNull($conflict2);
        $this->assertTrue($conflict2['has_conflict']);

        // 3. Contained overlap: 10:15 to 11:00 -> MUST CONFLICT
        $conflict3 = $service->detectConflict($user, $date, '10:15', '11:00');
        $this->assertNotNull($conflict3);
        $this->assertTrue($conflict3['has_conflict']);

        // 4. Non-overlapping before: 08:30 to 10:00 -> NO CONFLICT
        $conflict4 = $service->detectConflict($user, $date, '08:30', '10:00');
        $this->assertNull($conflict4);

        // 5. Non-overlapping after: 11:30 to 13:00 -> NO CONFLICT
        $conflict5 = $service->detectConflict($user, $date, '11:30', '13:00');
        $this->assertNull($conflict5);
    }

    /**
     * Test Spaced Repetition (SuperMemo SM-2) algorithm.
     */
    public function test_spaced_repetition_service_calculates_sm2_intervals(): void
    {
        $user = User::factory()->create();

        $roadmap = Roadmap::create([
            'user_id' => $user->id,
            'title' => 'Test Track',
            'slug' => 'test-track-' . uniqid(),
            'status' => 'active',
        ]);

        $phase = Phase::create([
            'roadmap_id' => $roadmap->id,
            'title' => 'Phase 1',
            'order_index' => 1,
            'status' => 'in_progress',
        ]);

        $subject = Subject::create([
            'phase_id' => $phase->id,
            'title' => 'JavaScript Core',
            'order_index' => 1,
            'status' => 'in_progress',
        ]);

        $topic = Topic::create([
            'subject_id' => $subject->id,
            'title' => 'Closures and Lexical Scope',
            'priority' => 'critical',
            'estimated_duration_minutes' => 90,
            'status' => 'in_progress',
        ]);

        $item = RevisionItem::create([
            'user_id' => $user->id,
            'topic_id' => $topic->id,
            'next_revision_date' => Carbon::today()->toDateString(),
            'interval_days' => 3,
            'ease_factor' => 2.50,
            'repetition_count' => 2,
            'concept_prompt' => 'Explain closures without using the word "function".',
        ]);

        $service = new SpacedRepetitionService();

        // 1. Review with "Again" -> Reset repetitions to 0, interval to 1
        $resAgain = $service->reviewItem($user, $item->id, 'again');
        $this->assertEquals(0, $resAgain['item']['repetition_count']);
        $this->assertEquals(1, $resAgain['item']['interval_days']);
        $this->assertLessThan(2.50, (float) $resAgain['item']['ease_factor']);

        // 2. Review with "Good" -> Advance repetitions and scale interval
        $resGood = $service->reviewItem($user, $item->id, 'good');
        $this->assertEquals(1, $resGood['item']['repetition_count']);
        $this->assertEquals(1, $resGood['item']['interval_days']);

        // Second consecutive "Good"
        $resGood2 = $service->reviewItem($user, $item->id, 'good');
        $this->assertEquals(2, $resGood2['item']['repetition_count']);
        $this->assertEquals(3, $resGood2['item']['interval_days']);

        // 3. Review with "Easy" -> Bonus interval and increased ease factor
        $resEasy = $service->reviewItem($user, $item->id, 'easy');
        $this->assertEquals(3, $resEasy['item']['repetition_count']);
        $this->assertGreaterThan(3, $resEasy['item']['interval_days']);
        $this->assertGreaterThan(2.30, (float) $resEasy['item']['ease_factor']);
    }

    /**
     * Test Problem Solving Independence Ratio & Benchmark Scoring.
     */
    public function test_problem_analytics_service_calculates_independence_ratio(): void
    {
        $user = User::factory()->create();

        // Problem 1: Solved Independently (Solo)
        ProblemLog::create([
            'user_id' => $user->id,
            'title' => 'Longest Substring Without Repeating Characters',
            'platform' => 'leetcode',
            'difficulty' => 'medium',
            'independence_level' => 'independent',
            'initial_understanding' => 'Need to find the longest substring of unique characters.',
            'approach' => 'Sliding window technique with hash set tracking character positions.',
            'code_solution' => 'function lengthOfLongestSubstring(s) { let set = new Set(); return s.length; }',
            'key_learnings' => 'Sliding window optimizes O(N^2) to O(N).',
            'time_spent_minutes' => 35,
            'solved_at' => Carbon::now(),
        ]);

        // Problem 2: Solved Independently (Solo)
        ProblemLog::create([
            'user_id' => $user->id,
            'title' => 'Two Sum',
            'platform' => 'leetcode',
            'difficulty' => 'easy',
            'independence_level' => 'independent',
            'initial_understanding' => 'Find indices of two numbers that add up to target.',
            'approach' => 'Single pass hash table storing complement.',
            'code_solution' => 'function twoSum(nums, target) { let map = new Map(); }',
            'key_learnings' => 'Hash lookup is O(1).',
            'time_spent_minutes' => 15,
            'solved_at' => Carbon::now(),
        ]);

        // Problem 3: Solved with Small Hint
        ProblemLog::create([
            'user_id' => $user->id,
            'title' => 'LRU Cache Design',
            'platform' => 'leetcode',
            'difficulty' => 'hard',
            'independence_level' => 'small_hint',
            'initial_understanding' => 'Design an O(1) get and put cache with LRU eviction.',
            'approach' => 'Doubly linked list paired with hash map.',
            'code_solution' => 'class LRUCache { constructor(capacity) {} }',
            'key_learnings' => 'DLL pointers enable O(1) removals and node promotions.',
            'time_spent_minutes' => 50,
            'solved_at' => Carbon::now(),
        ]);

        $service = new ProblemAnalyticsService();
        $analytics = $service->getAnalytics($user);

        // Total problems = 3
        $this->assertEquals(3, $analytics['total_solved']);
        // Solo problems = 2
        $this->assertEquals(2, $analytics['independence']['independent']);
        // Small hint = 1
        $this->assertEquals(1, $analytics['independence']['small_hint']);
        // Independence ratio = round((2 / 3) * 100) = 67%
        $this->assertEquals(67, $analytics['independence_ratio_pct']);
        // Benchmark requires >= 70% for elite, 67% is in proficient
        $this->assertEquals('proficient', $analytics['benchmark']['tier']);
    }

    /**
     * Test Settings Module API Endpoints.
     */
    public function test_settings_module_endpoints(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('oldpassword123'),
        ]);

        // 1. Get settings
        $response = $this->actingAs($user)->getJson('/api/v1/settings');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'timezone', 'daily_goal_minutes', 'target_role'],
                'notification_preferences',
                'workspace_stats',
                'system',
            ]);

        // 2. Update Profile
        $updateRes = $this->actingAs($user)->putJson('/api/v1/settings/profile', [
            'name' => 'Ashish Senior',
            'target_role' => 'Principal Full-Stack Engineer (₹50 LPA+)',
            'daily_goal_minutes' => 300,
            'timezone' => 'Asia/Kolkata',
            'bio' => 'Focusing on distributed systems and advanced DSA.',
        ]);
        $updateRes->assertStatus(200);
        $this->assertEquals('Ashish Senior', $user->fresh()->name);

        // 3. Update Study Preferences
        $prefRes = $this->actingAs($user)->putJson('/api/v1/settings/study-preferences', [
            'pomodoro_minutes' => 50,
            'short_break_minutes' => 10,
            'long_break_minutes' => 20,
            'sound_alerts' => true,
            'auto_start_breaks' => true,
            'sm2_default_ease' => 2.60,
            'sm2_daily_limit' => 25,
        ]);
        $prefRes->assertStatus(200);
        $this->assertEquals(50, $user->fresh()->custom_settings['pomodoro_minutes']);

        // 4. Update Password
        $pwdRes = $this->actingAs($user)->putJson('/api/v1/settings/password', [
            'current_password' => 'oldpassword123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);
        $pwdRes->assertStatus(200);

        // 5. Export Data
        $exportRes = $this->actingAs($user)->getJson('/api/v1/settings/export');
        $exportRes->assertStatus(200)
            ->assertJsonStructure([
                'meta',
                'user',
                'roadmaps',
                'schedules',
                'sessions',
                'revisions',
                'problems',
                'notes',
                'journals',
            ]);
    }
}
