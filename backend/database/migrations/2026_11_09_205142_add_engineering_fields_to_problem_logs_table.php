<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('problem_logs', function (Blueprint $table) {
            $table->string('problem_url')->nullable()->after('platform');
            $table->string('pattern', 100)->nullable()->after('difficulty'); // Sliding Window, Two Pointers, DP, etc.
            $table->string('time_complexity', 50)->nullable()->after('language'); // O(N), O(N log N)
            $table->string('space_complexity', 50)->nullable()->after('time_complexity'); // O(1), O(K)
            $table->enum('status', ['solved', 'attempted', 'needs_revisit'])->default('solved')->after('time_spent_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('problem_logs', function (Blueprint $table) {
            $table->dropColumn([
                'problem_url',
                'pattern',
                'time_complexity',
                'space_complexity',
                'status',
            ]);
        });
    }
};
