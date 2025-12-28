<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PegawaiController;
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
    Route::get('/pegawai/{id}', [DashboardController::class, 'pegawai_detail']);

    Route::get('/api/pegawai/{id}', [PegawaiController::class, 'detail']);
    Route::post('/api/pegawai/add', [PegawaiController::class, 'add']);
    Route::post('/api/pegawai/{id}/update', [PegawaiController::class, 'update']);
    Route::post('/api/pegawai/{id}/photo', [PegawaiController::class, 'uploadPhoto']);
    Route::post('/api/pegawai/{id}/ktp', [PegawaiController::class, 'uploadKtp']);
    Route::post('/api/pegawai/{id}/npwp', [PegawaiController::class, 'uploadNpwp']);
    // Akun routes
    Route::get('/api/akun/{id}', [\App\Http\Controllers\AkunController::class, 'detail']);
    Route::post('/api/akun/{id}/update', [\App\Http\Controllers\AkunController::class, 'update']);
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
