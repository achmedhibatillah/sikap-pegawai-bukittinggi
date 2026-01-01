<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CutiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardPegawaiController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JabatanController;
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

Route::get('/api/presensi/current', [PresensiController::class, 'currentApi']);

Route::middleware([AuthAdminMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/pegawai', [DashboardController::class, 'pegawai']);
    Route::get('/presensi', [\App\Http\Controllers\PresensiController::class, 'index']);
    Route::get('/presensi/{id}', [\App\Http\Controllers\PresensiController::class, 'detail']);
    Route::get('/pegawai/{id}', [DashboardController::class, 'pegawai_detail']);

    Route::get('/presensi', [PresensiController::class, 'index']);

    Route::get('/cuti', [DashboardController::class, 'cuti']);

    // Jabatan routes (admin)
    Route::get('/jabatan', [JabatanController::class, 'index']);
    Route::get('/jabatan-ajuan', [JabatanController::class, 'ajuanIndex']);

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

    Route::get('/api/cuti', [CutiController::class, 'list']);
    Route::post('/api/cuti/{id}/approve', [CutiController::class, 'approve']);

    // Jabatan API routes (admin)
    Route::get('/api/jabatan', [JabatanController::class, 'list']);
    Route::get('/api/jabatan/all-active', [JabatanController::class, 'allActive']);
    Route::post('/api/jabatan/add', [JabatanController::class, 'store']);
    Route::post('/api/jabatan/{id}/update', [JabatanController::class, 'update']);
    Route::delete('/api/jabatan/{id}', [JabatanController::class, 'destroy']);
    Route::post('/api/jabatan/{id}/restore', [JabatanController::class, 'restore']);

    // Jabatan Ajuan API routes
    Route::get('/api/jabatan-ajuan', [JabatanController::class, 'ajuanList']);
    Route::get('/api/jabatan-ajuan/pending-count', [JabatanController::class, 'pendingCount']);
    Route::post('/api/jabatan-ajuan/{id}/approve', [JabatanController::class, 'ajuanApprove']);
    Route::post('/api/jabatan-ajuan/{id}/reject', [JabatanController::class, 'ajuanReject']);
});

Route::prefix('/pg')->group(function () {
    Route::get('/dashboard', [DashboardPegawaiController::class, 'index']);
    Route::get('/presensi', [DashboardPegawaiController::class, 'presensi']);
    Route::get('/cuti', [DashboardPegawaiController::class, 'cuti']);
    Route::get('/jabatan', [DashboardPegawaiController::class, 'jabatan']);
    Route::get('/api/presensi/riwayat', [PresensiController::class, 'riwayatPegawai']);
    Route::get('/api/cuti/my', [CutiController::class, 'myList']);
    Route::post('/api/cuti/add', [CutiController::class, 'add']);

    // Jabatan untuk pegawai
    Route::get('/api/jabatan/my-ajuan', [JabatanController::class, 'myAjuan']);
    Route::get('/api/jabatan/all-active', [JabatanController::class, 'allActive']);
    Route::post('/api/jabatan/ajuan', [JabatanController::class, 'ajuanStore']);
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


Route::post('/api/presensi/dev-create-today', [\App\Http\Controllers\PresensiController::class, 'devCreateToday']);
