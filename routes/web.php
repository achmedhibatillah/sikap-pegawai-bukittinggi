<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardPegawaiController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PresensiController;
use App\Http\Middleware\AuthAdminMiddleware;
use App\Http\Middleware\GuestMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index']);

Route::middleware([GuestMiddleware::class])->group(function () {
    Route::get('/login', [AuthController::class, 'page_login']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware([AuthAdminMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/pegawai', [DashboardController::class, 'pegawai']);
    Route::get('/presensi', [\App\Http\Controllers\PresensiController::class, 'index']);
    Route::get('/presensi/{id}', [\App\Http\Controllers\PresensiController::class, 'detail']);
    Route::get('/pegawai/{id}', [DashboardController::class, 'pegawai_detail']);

    Route::get('/presensi', [PresensiController::class, 'index']);

    Route::get('/api/pegawai', [PegawaiController::class, 'index']);
    Route::get('/api/pegawai/{id}', [PegawaiController::class, 'detail']);
    Route::get('/api/pegawai-by-akun/{id}', [PegawaiController::class, 'get_id_by_akun']);
    Route::post('/api/presensi/add', [\App\Http\Controllers\PresensiController::class, 'add']);
    Route::post('/api/presensi/{id}/attendance', [\App\Http\Controllers\PresensiController::class, 'addAttendance']);
    Route::get('/api/presensi', [\App\Http\Controllers\PresensiController::class, 'list']);
    Route::get('/api/presensi/{id}', [\App\Http\Controllers\PresensiController::class, 'detailApi']);
    Route::post('/api/presensi/{id}/pegawai/{pegawai_id}/update', [\App\Http\Controllers\PresensiController::class, 'updatePegawaiPresensi']);
    Route::post('/api/pegawai/add', [PegawaiController::class, 'add']);
    Route::post('/api/pegawai/{id}/update', [PegawaiController::class, 'update']);
    Route::post('/api/pegawai/{id}/photo', [PegawaiController::class, 'uploadPhoto']);
    Route::post('/api/pegawai/{id}/ktp', [PegawaiController::class, 'uploadKtp']);
    Route::post('/api/pegawai/{id}/npwp', [PegawaiController::class, 'uploadNpwp']);

    Route::get('/api/akun/{id}', [\App\Http\Controllers\AkunController::class, 'detail']);
    Route::post('/api/akun/{id}/update', [\App\Http\Controllers\AkunController::class, 'update']);

    Route::prefix('/pg')->group(function () {
        Route::get('/dashboard', [DashboardPegawaiController::class, 'index']);
        Route::get('/presensi', [DashboardPegawaiController::class, 'presensi']);
    });
});


Route::get('/s', function () {
    return response()->json([
        'session_id' => session()->getId(),
        'all' => session()->all(),
    ]);
});

Route::get('/d', function () {
    session()->flush();
    return redirect()->to('s');
});

// Pegawai helper endpoints (no admin middleware) -------------------------------------------------
Route::get('/api/presensi/current', [\App\Http\Controllers\PresensiController::class, 'currentApi']);
// Dev helper: create today's presensi if none exists (only active in local/dev env)
Route::post('/api/presensi/dev-create-today', [\App\Http\Controllers\PresensiController::class, 'devCreateToday']);

