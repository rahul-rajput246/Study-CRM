<?php

namespace Database\Seeders;

use App\Models\ProblemLog;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProblemLogSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (! $user) return;

        $dsaTopic = Topic::where('title', 'like', '%Sliding Window%')->first();

        ProblemLog::firstOrCreate(
            ['title' => 'LeetCode #3: Longest Substring Without Repeating Characters'],
            [
                'user_id' => $user->id,
                'topic_id' => $dsaTopic?->id,
                'platform' => 'leetcode',
                'problem_url' => 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
                'difficulty' => 'medium',
                'pattern' => 'Sliding Window',
                'language' => 'JavaScript',
                'time_complexity' => 'O(N)',
                'space_complexity' => 'O(min(m, n))',
                'initial_understanding' => 'Find the length of the longest contiguous substring containing no duplicate characters.',
                'approach' => 'Maintain a sliding window [left, right] and a Map of character last seen indices. As right expands, if the character was already seen inside current window, jump left pointer to lastSeenIndex + 1. Update max length at each step.',
                'pseudocode' => "left = 0, max = 0, map = {}\nfor right in 0..len:\n  if char in map and map[char] >= left:\n    left = map[char] + 1\n  map[char] = right\n  max = Math.max(max, right - left + 1)",
                'code_solution' => "function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let left = 0;\n  const map = new Map();\n\n  for (let right = 0; right < s.length; right++) {\n    const char = s[right];\n    if (map.has(char) && map.get(char) >= left) {\n      left = map.get(char) + 1;\n    }\n    map.set(char, right);\n    maxLength = Math.max(maxLength, right - left + 1);\n  }\n\n  return maxLength;\n}",
                'test_cases' => "Input: 'abcabcbb' -> Output: 3 ('abc')\nInput: 'bbbbb' -> Output: 1 ('b')\nInput: 'pwwkew' -> Output: 3 ('wke')",
                'mistakes_made' => 'Initially used a Set and shifted left pointer one-by-one with a while loop. Jumping left directly with Map index reduced unnecessary iterations.',
                'key_learnings' => 'When jumping the left pointer, always verify map.get(char) >= left to avoid pulling the left pointer backward for characters seen outside the current window.',
                'independence_level' => 'independent',
                'time_spent_minutes' => 35,
                'status' => 'solved',
            ]
        );

        ProblemLog::firstOrCreate(
            ['title' => 'FoodieHub System Design: MySQL Composite Index for Order Feeds'],
            [
                'user_id' => $user->id,
                'topic_id' => null,
                'platform' => 'project_feature',
                'problem_url' => 'https://github.com/studyos/foodiehub',
                'difficulty' => 'hard',
                'pattern' => 'System Design / SQL',
                'language' => 'SQL',
                'time_complexity' => 'O(log N)',
                'space_complexity' => 'O(1)',
                'initial_understanding' => 'FoodieHub restaurant dashboard queries filtering orders by restaurant_id and status, ordered by created_at DESC, took ~450ms under 500k simulated rows.',
                'approach' => 'Applied MySQL Leftmost Prefix Rule. Created a composite B-Tree index (restaurant_id, status, created_at) allowing MySQL to seek equality columns and retrieve sorted rows without filesort.',
                'pseudocode' => "CREATE INDEX idx_orders_restaurant_status_created ON orders (restaurant_id, status, created_at DESC);",
                'code_solution' => "-- In Laravel Migration:\nSchema::table('orders', function (Blueprint \$table) {\n    \$table->index(['restaurant_id', 'status', 'created_at']);\n});\n\n-- Verified with EXPLAIN:\nEXPLAIN SELECT * FROM orders \nWHERE restaurant_id = 42 AND status = 'confirmed' \nORDER BY created_at DESC LIMIT 20;\n-- Result: type = ref, key = idx_orders_restaurant_status_created, Extra = Using index condition",
                'test_cases' => "1. Single restaurant query with 200k rows: 450ms -> 3.2ms\n2. Order status filter: no filesort in EXPLAIN",
                'mistakes_made' => 'Initially created two separate indexes on restaurant_id and status. Index merge still required expensive temporary table sorting for created_at.',
                'key_learnings' => 'Equality columns must always precede range/sort columns in composite index definitions to prevent filesort.',
                'independence_level' => 'small_hint',
                'time_spent_minutes' => 50,
                'status' => 'solved',
            ]
        );
    }
}

