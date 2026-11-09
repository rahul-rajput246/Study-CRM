<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('timezone', 50)->default('Asia/Kolkata')->after('password');
            $table->integer('daily_goal_minutes')->default(240)->after('timezone');
            $table->string('target_role', 255)->default('Senior Full-Stack Developer (₹40 LPA+)')->after('daily_goal_minutes');
            $table->string('avatar')->nullable()->after('target_role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['timezone', 'daily_goal_minutes', 'target_role', 'avatar']);
        });
    }
};
