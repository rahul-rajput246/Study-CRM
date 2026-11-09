<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'timezone' => $this->timezone,
            'daily_goal_minutes' => $this->daily_goal_minutes,
            'target_role' => $this->target_role,
            'avatar' => $this->avatar,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

