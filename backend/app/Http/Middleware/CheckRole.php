<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:admin,manager') or ->middleware('role:super_admin')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$request->user()->hasAnyRole($roles)) {
            return response()->json(['message' => 'Unauthorized. Required role: ' . implode(' or ', $roles)], 403);
        }

        return $next($request);
    }
}
