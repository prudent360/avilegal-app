<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('permission:manage_users') or ->middleware('permission:manage_users,view_reports')
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Super admin bypasses all permission checks
        if ($request->user()->isSuperAdmin()) {
            return $next($request);
        }

        if (!$request->user()->hasAnyPermission($permissions)) {
            return response()->json(['message' => 'Unauthorized. Required permission: ' . implode(' or ', $permissions)], 403);
        }

        return $next($request);
    }
}
