<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardPegawaiController extends Controller
{
    public function presensi()
    {
        return Inertia::render('dashboard/pg-presensi', [
            'sss' => session('sss'),
        ]);
    }

    public function cuti()
    {
        return Inertia::render('dashboard/pg-cuti', [
            'sss' => session('sss'),
        ]);
    }

    public function jabatan()
    {
        return Inertia::render('dashboard/pg-jabatan', [
            'sss' => session('sss'),
        ]);
    }

    public function kegiatan()
    {
        return Inertia::render('dashboard/pg-kegiatan', [
            'sss' => session('sss'),
        ]);
    }

    public function profil()
    {
        return Inertia::render('dashboard/pg-profil', [
            'sss' => session('sss'),
        ]);
    }

    public function me()
    {
        $sss = session('sss');
        if (!$sss || !$sss['usr']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $akun = Akun::find($sss['usr']);
        if (!$akun) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun tidak ditemukan'
            ], 404);
        }

        $pegawai = Pegawai::with(['fotoFile', 'ktpFile', 'npwpFile', 'akun'])->where('akun_id', $akun->id)->first();
        if (!$pegawai) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pegawai tidak ditemukan'
            ], 404);
        }

        // Get current active jabatan
        $currentJabatan = $pegawai->currentJabatan()->first();
        
        // Get jabatan history
        $jabatanHistory = $pegawai->jabatans()->get()->map(function ($j) {
            return [
                'id' => $j->id,
                'nama' => $j->nama,
                'tingkatan' => $j->tingkatan,
                'mulai' => $j->pivot->mulai,
                'selesai' => $j->pivot->selesai,
                'is_current' => ($j->pivot->selesai === null || $j->pivot->selesai >= now()->toDateString()),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                ...$pegawai->toArray(),
                'foto' => $pegawai->fotoFile?->path ?? null,
                'ktp'  => $pegawai->ktpFile?->path ?? null,
                'npwp' => $pegawai->npwpFile?->path ?? null,
                'foto_file' => $pegawai->fotoFile ? [
                    'id' => $pegawai->fotoFile->id,
                    'type' => $pegawai->fotoFile->type,
                    'path' => $pegawai->fotoFile->path,
                ] : null,
                'ktp_file' => $pegawai->ktpFile ? [
                    'id' => $pegawai->ktpFile->id,
                    'type' => $pegawai->ktpFile->type,
                    'path' => $pegawai->ktpFile->path,
                ] : null,
                'npwp_file' => $pegawai->npwpFile ? [
                    'id' => $pegawai->npwpFile->id,
                    'type' => $pegawai->npwpFile->type,
                    'path' => $pegawai->npwpFile->path,
                ] : null,
                'akun' => $pegawai->akun?->toArray() ?? null,
                'current_jabatan' => $currentJabatan ? [
                    'id' => $currentJabatan->id,
                    'nama' => $currentJabatan->nama,
                    'tingkatan' => $currentJabatan->tingkatan,
                    'mulai' => $currentJabatan->pivot->mulai,
                ] : null,
                'jabatan_history' => $jabatanHistory,
            ]
        ]);
    }
}

