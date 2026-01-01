<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Session disimpan sebagai session('sss.usr') dan session('sss.acs')
        $sss = session('sss');
        $userId = $sss['usr'] ?? null;
        $role = $sss['acs'] ?? null;
        
        // Redirect ke login jika belum login sama sekali
        if (!$userId) {
            return redirect('/login');
        }
        // Untuk route yang memerlukan admin, periksa role admin
        // Middleware ini sekarang berfungsi sebagai "auth check" untuk semua authenticated users
        // Route spesifik admin harus ditangani di dalam controller atau dengan middleware tambahan

        return $next($request);
    }
}
