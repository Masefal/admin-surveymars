<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Pemakaian di route: ->middleware('role:guru') atau 'role:guru,orang_tua'.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles, true)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke fitur ini.'], 403);
        }

        return $next($request);
    }
}
