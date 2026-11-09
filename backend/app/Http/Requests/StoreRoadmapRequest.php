<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoadmapRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'track_type' => ['required', 'in:foundation,dsa,fullstack,system_design,interview'],
            'description' => ['nullable', 'string'],
        ];
    }
}

