<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topic_id' => ['nullable', 'exists:topics,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'scheduled_date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i', 'after:start_time'],
            'estimated_minutes' => ['nullable', 'integer', 'min:10'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'status' => ['sometimes', 'in:scheduled,in_progress,completed,missed,rescheduled'],
            'reminder_enabled' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
            'force' => ['nullable', 'boolean'],
        ];
    }
}

