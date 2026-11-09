<?php

namespace Database\Seeders;

use App\Models\Phase;
use App\Models\Roadmap;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\Topic;
use App\Models\StudySchedule;
use App\Models\StudySession;
use App\Models\RevisionItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StarterRoadmapSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or retrieve the primary engineer user
        $user = User::firstOrCreate(
            ['email' => 'engineer@studyos.local'],
            [
                'name' => 'Ashish',
                'password' => Hash::make('password123'),
                'timezone' => 'Asia/Kolkata',
                'daily_goal_minutes' => 240,
                'target_role' => 'Senior Full-Stack Developer (₹40 LPA+)',
            ]
        );

        // 2. Primary Roadmap: Full-Stack Development Mastery
        $fullStackRoadmap = Roadmap::updateOrCreate(
            ['user_id' => $user->id, 'slug' => 'full-stack-development'],
            [
                'title' => 'Full-Stack Development Mastery',
                'track_type' => 'fullstack',
                'description' => 'Complete journey from fundamentals to production-grade React, Laravel, system architecture, and high-performance APIs.',
                'order_index' => 1,
                'status' => 'active',
            ]
        );

        // Phases 0 to 4
        $p0 = Phase::create([
            'roadmap_id' => $fullStackRoadmap->id,
            'title' => 'Phase 0 – Computer Fundamentals',
            'description' => 'Operating systems, memory model, networking basics, HTTP lifecycle, binary arithmetic.',
            'order_index' => 0,
            'status' => 'completed',
        ]);

        $s0 = Subject::create([
            'phase_id' => $p0->id,
            'title' => 'Operating Systems & Networking',
            'order_index' => 1,
            'status' => 'completed',
        ]);

        Topic::create([
            'subject_id' => $s0->id,
            'title' => 'HTTP Protocol & TCP Handshake',
            'status' => 'completed',
            'priority' => 'high',
            'estimated_minutes' => 90,
            'actual_minutes' => 85,
            'completed_at' => Carbon::now()->subMonths(3),
            'order_index' => 1,
        ]);

        $p1 = Phase::create([
            'roadmap_id' => $fullStackRoadmap->id,
            'title' => 'Phase 1 – HTML5 Semantic Architecture',
            'description' => 'Semantic tags, web accessibility (a11y), forms validation, SEO metadata.',
            'order_index' => 1,
            'status' => 'completed',
        ]);

        $s1 = Subject::create([
            'phase_id' => $p1->id,
            'title' => 'Modern HTML5 Standards',
            'order_index' => 1,
            'status' => 'completed',
        ]);

        Topic::create([
            'subject_id' => $s1->id,
            'title' => 'Semantic Elements, Accessibility & Forms',
            'status' => 'completed',
            'priority' => 'medium',
            'estimated_minutes' => 120,
            'actual_minutes' => 110,
            'completed_at' => Carbon::now()->subMonths(2),
            'order_index' => 1,
        ]);

        $p2 = Phase::create([
            'roadmap_id' => $fullStackRoadmap->id,
            'title' => 'Phase 2 – CSS3, Flexbox & Grid Systems',
            'description' => 'Responsive web design, modern layouts, CSS custom properties, transitions.',
            'order_index' => 2,
            'status' => 'completed',
        ]);

        $s2 = Subject::create([
            'phase_id' => $p2->id,
            'title' => 'Modern Layout Engines',
            'order_index' => 1,
            'status' => 'completed',
        ]);

        Topic::create([
            'subject_id' => $s2->id,
            'title' => 'Flexbox & CSS Grid Alignment',
            'status' => 'completed',
            'priority' => 'high',
            'estimated_minutes' => 180,
            'actual_minutes' => 175,
            'completed_at' => Carbon::now()->subMonth(),
            'order_index' => 1,
        ]);

        $p3 = Phase::create([
            'roadmap_id' => $fullStackRoadmap->id,
            'title' => 'Phase 3 – Bootstrap 5.3 Framework',
            'description' => '12-column grid, responsive breakpoints, utilities, component architecture.',
            'order_index' => 3,
            'status' => 'completed',
        ]);

        $s3 = Subject::create([
            'phase_id' => $p3->id,
            'title' => 'Bootstrap 5.3 Components & Theming',
            'order_index' => 1,
            'status' => 'completed',
        ]);

        Topic::create([
            'subject_id' => $s3->id,
            'title' => 'Responsive Breakpoints & SCSS Variable Customization',
            'status' => 'completed',
            'priority' => 'medium',
            'estimated_minutes' => 150,
            'actual_minutes' => 140,
            'completed_at' => Carbon::now()->subWeeks(3),
            'order_index' => 1,
        ]);

        // Phase 4 – JavaScript (Active)
        $p4 = Phase::create([
            'roadmap_id' => $fullStackRoadmap->id,
            'title' => 'Phase 4 – JavaScript Deep Dive',
            'description' => 'Execution context, closures, prototypes, DOM, event bubbling/delegation, async JS.',
            'order_index' => 4,
            'status' => 'in_progress',
        ]);

        $s4_core = Subject::create([
            'phase_id' => $p4->id,
            'title' => 'JS Fundamentals & Functions',
            'order_index' => 1,
            'status' => 'completed',
        ]);

        Topic::create([
            'subject_id' => $s4_core->id,
            'title' => 'Execution Context & Call Stack',
            'status' => 'completed',
            'priority' => 'high',
            'estimated_minutes' => 90,
            'actual_minutes' => 95,
            'completed_at' => Carbon::now()->subWeeks(2),
            'order_index' => 1,
        ]);

        $s4_dom = Subject::create([
            'phase_id' => $p4->id,
            'title' => 'DOM Learning & Node Traversal',
            'order_index' => 2,
            'status' => 'completed',
        ]);

        Topic::create([
            'subject_id' => $s4_dom->id,
            'title' => 'DOM Tree Traversal & Dynamic Element Creation',
            'status' => 'completed',
            'priority' => 'high',
            'estimated_minutes' => 120,
            'actual_minutes' => 130,
            'completed_at' => Carbon::now()->subWeek(),
            'order_index' => 1,
        ]);

        $s4_events = Subject::create([
            'phase_id' => $p4->id,
            'title' => 'Events & Event Delegation',
            'order_index' => 3,
            'status' => 'in_progress',
        ]);

        $activeTopic = Topic::create([
            'subject_id' => $s4_events->id,
            'title' => 'Event Bubbling, Capturing & Delegation',
            'description' => 'Master event propagation lifecycle, e.target vs e.currentTarget, memory efficiency of delegating to parent containers.',
            'learning_objectives' => [
                'Understand 3 phases of Event Propagation (Capture, Target, Bubble)',
                'Differentiate e.target vs e.currentTarget in practical scenarios',
                'Implement dynamic list item handling with single parent listener',
                'Handle e.stopPropagation() and e.stopImmediatePropagation() safely',
            ],
            'priority' => 'critical',
            'estimated_minutes' => 120,
            'actual_minutes' => 55,
            'status' => 'in_progress',
            'start_date' => Carbon::today(),
            'target_date' => Carbon::today()->addDays(2),
            'order_index' => 1,
            'personal_notes' => 'Continued practice needed on delegation with deeply nested child elements.',
        ]);

        Subtopic::create(['topic_id' => $activeTopic->id, 'title' => 'Capturing vs Bubbling phase execution order', 'is_completed' => true, 'order_index' => 1]);
        Subtopic::create(['topic_id' => $activeTopic->id, 'title' => 'e.target vs e.currentTarget practical differences', 'is_completed' => true, 'order_index' => 2]);
        Subtopic::create(['topic_id' => $activeTopic->id, 'title' => 'Event Delegation pattern on dynamic list items', 'is_completed' => false, 'order_index' => 3]);
        Subtopic::create(['topic_id' => $activeTopic->id, 'title' => 'CustomEvent constructor and dispatchEvent', 'is_completed' => false, 'order_index' => 4]);

        // 3. Additional Track: DSA with JavaScript
        $dsaRoadmap = Roadmap::create([
            'user_id' => $user->id,
            'title' => 'DSA with JavaScript',
            'slug' => 'dsa-with-javascript',
            'track_type' => 'dsa',
            'description' => 'Data structures and algorithms from basics to advanced patterns: Big-O, Two Pointers, Sliding Window, Trees, Graphs, DP.',
            'order_index' => 2,
            'status' => 'active',
        ]);

        $p_dsa1 = Phase::create(['roadmap_id' => $dsaRoadmap->id, 'title' => 'Phase 1 – Algorithmic Thinking & Two Pointers', 'order_index' => 1, 'status' => 'in_progress']);
        $s_dsa1 = Subject::create(['phase_id' => $p_dsa1->id, 'title' => 'Array Techniques & Pointers', 'order_index' => 1, 'status' => 'in_progress']);
        $dsaTopic = Topic::create([
            'subject_id' => $s_dsa1->id,
            'title' => 'Sliding Window & Two Pointer Optimization',
            'priority' => 'critical',
            'estimated_minutes' => 90,
            'actual_minutes' => 45,
            'status' => 'in_progress',
            'order_index' => 1,
        ]);

        // 4. Additional Track: FoodieHub System Design
        Roadmap::create([
            'user_id' => $user->id,
            'title' => 'FoodieHub System Design & Architecture',
            'slug' => 'foodiehub-system-design',
            'track_type' => 'system_design',
            'description' => 'Real-world scalable food ordering CRM & architecture: database indexing, queue processing, inventory concurrency, WebSockets.',
            'order_index' => 3,
            'status' => 'active',
        ]);

        // 5. Additional Track: Interview Preparation
        Roadmap::create([
            'user_id' => $user->id,
            'title' => 'Interview Preparation & Mock Drills',
            'slug' => 'interview-preparation',
            'track_type' => 'interview',
            'description' => 'High-impact technical interview drills for React, Laravel, MySQL indexing, JS fundamentals, and behavioral questions.',
            'order_index' => 4,
            'status' => 'active',
        ]);

        // 6. Today's Schedules (Nov 9, 2026 / current date)
        $today = Carbon::today();

        $schedule1 = StudySchedule::create([
            'user_id' => $user->id,
            'topic_id' => $activeTopic->id,
            'title' => 'Event Delegation & Dynamic Table Row Practice',
            'scheduled_date' => $today,
            'start_time' => '10:00:00',
            'end_time' => '11:30:00',
            'estimated_minutes' => 90,
            'priority' => 'critical',
            'recurrence' => 'none',
            'status' => 'completed',
            'description' => 'Implement delegation pattern on a dynamic table with action buttons without leaking event handlers.',
        ]);

        $schedule2 = StudySchedule::create([
            'user_id' => $user->id,
            'topic_id' => $dsaTopic->id,
            'title' => 'Sliding Window: Longest Substring Without Repeating Characters',
            'scheduled_date' => $today,
            'start_time' => '15:00:00',
            'end_time' => '16:30:00',
            'estimated_minutes' => 90,
            'priority' => 'high',
            'recurrence' => 'none',
            'status' => 'in_progress',
            'description' => 'Solve LeetCode #3 independently using two-pointer hash map approach.',
        ]);

        StudySchedule::create([
            'user_id' => $user->id,
            'title' => 'Laravel Sanctum Authentication & API Policies Review',
            'scheduled_date' => $today,
            'start_time' => '19:00:00',
            'end_time' => '20:30:00',
            'estimated_minutes' => 90,
            'priority' => 'high',
            'recurrence' => 'none',
            'status' => 'scheduled',
            'description' => 'Verify Bearer token expiration, route middleware, and custom authorization policies.',
        ]);

        // 7. Study Session (Completed earlier today: 55 minutes active time)
        StudySession::create([
            'user_id' => $user->id,
            'study_schedule_id' => $schedule1->id,
            'topic_id' => $activeTopic->id,
            'session_type' => 'pomodoro',
            'planned_minutes' => 90,
            'active_seconds' => 3300, // 55 mins
            'paused_seconds' => 300,  // 5 mins
            'started_at' => Carbon::now()->subHours(4),
            'ended_at' => Carbon::now()->subHours(3),
            'status' => 'completed',
            'notes' => 'Successfully implemented event delegation. Caught bug where clicking child <span> missed dataset attributes on parent <button>; fixed using e.target.closest("button").',
        ]);

        // Past sessions for 7-day consistency chart
        for ($i = 6; $i >= 1; $i--) {
            StudySession::create([
                'user_id' => $user->id,
                'session_type' => 'pomodoro',
                'planned_minutes' => 120,
                'active_seconds' => ($i % 2 === 0 ? 7200 : 5400), // 2 hours or 1.5 hours
                'paused_seconds' => 600,
                'started_at' => Carbon::today()->subDays($i)->setHour(18),
                'ended_at' => Carbon::today()->subDays($i)->setHour(20),
                'status' => 'completed',
            ]);
        }

        // 8. Revision Items (Spaced Repetition)
        // Item 1: Overdue revision
        RevisionItem::create([
            'user_id' => $user->id,
            'topic_id' => $activeTopic->id,
            'concept_prompt' => 'Explain the 3 phases of DOM Event Propagation. Why is Event Delegation memory-efficient when rendering dynamic tables?',
            'key_takeaways' => "1. Capturing Phase (window down to target), Target Phase, Bubbling Phase (target up to window).\n2. Event delegation attaches one handler to a common ancestor rather than 1000s of child buttons.\n3. Uses e.target to identify clicked element and e.target.closest('selector') to handle nested tags safely.\n4. Saves browser memory and prevents leaks on dynamic DOM mutation.",
            'confidence_score' => 3,
            'repetition_count' => 1,
            'interval_days' => 1,
            'ease_factor' => 2.50,
            'next_revision_date' => Carbon::today()->subDay(), // Overdue
            'last_revised_at' => Carbon::today()->subDays(2),
            'status' => 'overdue',
        ]);

        // Item 2: Due today
        RevisionItem::create([
            'user_id' => $user->id,
            'topic_id' => $dsaTopic->id,
            'concept_prompt' => "When should you prefer Sliding Window over nested loops? How do you maintain window validity for 'Longest Substring Without Repeating Characters'?",
            'key_takeaways' => "1. Use sliding window on contiguous sequences to find optimal subarrays with O(N) time instead of O(N^2).\n2. Expand right pointer and track character indices in a Hash Map.\n3. When encountering a duplicate inside the current window, jump left pointer to last_seen_index + 1.\n4. Space complexity is O(min(m, n)) bounded by alphabet size.",
            'confidence_score' => 4,
            'repetition_count' => 0,
            'interval_days' => 1,
            'ease_factor' => 2.50,
            'next_revision_date' => Carbon::today(), // Due Today
            'status' => 'pending',
        ]);
    }
}

