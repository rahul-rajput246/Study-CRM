<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'learning_objectives' => ['nullable', 'array'],
            'learning_objectives.*' => ['string'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'estimated_minutes' => ['required', 'integer', 'min:10', 'max:1440'],
            'status' => ['nullable', 'in:not_started,in_progress,completed,needs_revision'],
            'start_date' => ['nullable', 'date'],
            'target_date' => ['nullable', 'date'],
            'personal_notes' => ['nullable', 'string'],
            'subtopics' => ['nullable', 'array'],
            'subtopics.*' => ['string'],
        ];
    }
}

