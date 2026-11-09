<?php

namespace Database\Seeders;

use App\Models\RevisionItem;
use Illuminate\Database\Seeder;

class UpdateRevisionSeeder extends Seeder
{
    public function run(): void
    {
        RevisionItem::where('id', 1)->update([
            'concept_prompt' => 'Explain the 3 phases of DOM Event Propagation. Why is Event Delegation memory-efficient when rendering dynamic tables?',
            'key_takeaways' => "1. Capturing Phase (window down to target), Target Phase, Bubbling Phase (target up to window).\n2. Event delegation attaches one handler to a common ancestor rather than 1000s of child buttons.\n3. Uses e.target to identify clicked element and e.target.closest('selector') to handle nested tags safely.\n4. Saves browser memory and prevents leaks on dynamic DOM mutation.",
            'confidence_score' => 3,
        ]);

        RevisionItem::where('id', 2)->update([
            'concept_prompt' => "When should you prefer Sliding Window over nested loops? How do you maintain window validity for 'Longest Substring Without Repeating Characters'?",
            'key_takeaways' => "1. Use sliding window on contiguous sequences to find optimal subarrays with O(N) time instead of O(N^2).\n2. Expand right pointer and track character indices in a Hash Map.\n3. When encountering a duplicate inside the current window, jump left pointer to last_seen_index + 1.\n4. Space complexity is O(min(m, n)) bounded by alphabet size.",
            'confidence_score' => 4,
        ]);
    }
}

