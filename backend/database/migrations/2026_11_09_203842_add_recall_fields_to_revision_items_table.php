<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('revision_items', function (Blueprint $table) {
            $table->text('concept_prompt')->nullable()->after('topic_id');
            $table->text('key_takeaways')->nullable()->after('concept_prompt');
            $table->tinyInteger('confidence_score')->default(3)->after('key_takeaways'); // 1 to 5
        });
    }

    public function down(): void
    {
        Schema::table('revision_items', function (Blueprint $table) {
            $table->dropColumn(['concept_prompt', 'key_takeaways', 'confidence_score']);
        });
    }
};
