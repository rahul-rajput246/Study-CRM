<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected ReportAnalyticsService $reportService
    ) {}

    public function comprehensive(Request $request): JsonResponse
    {
        $period = $request->query('period', 'last_30_days');
        if (! in_array($period, ['last_7_days', 'last_30_days', 'all_time'])) {
            $period = 'last_30_days';
        }

        $report = $this->reportService->getComprehensiveReport($request->user(), $period);

        return response()->json([
            'status' => 'success',
            'report' => $report,
        ]);
    }
}

