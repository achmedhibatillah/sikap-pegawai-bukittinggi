<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pegawai;
use App\Models\Cuti;
use App\Models\JabatanAjuan;
use App\Models\Kegiatan;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/index', [
            'sss' => session('sss')
        ]);
    }

    public function stats()
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        // Total Pegawai
        $totalPegawai = Pegawai::count();

        // Cuti Menunggu (acc = false/belum diapprove)
        $cutiPending = Cuti::where('acc', false)->count();

        // Ajuan Jabatan Pending
        $jabatanAjuanPending = JabatanAjuan::where('status', 'pending')->count();

        // Kegiatan Aktif (sedang berlangsung - berdasarkan tanggal tunggal)
        $kegiatanAktif = Kegiatan::whereDate('tanggal', now()->toDateString())->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_pegawai' => $totalPegawai,
                'total_cuti_pending' => $cutiPending,
                'total_jabatan_ajuan' => $jabatanAjuanPending,
                'total_kegiatan_aktif' => $kegiatanAktif,
            ]
        ]);
    }

    public function pegawai()
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return redirect('/dashboard');
        }
        return Inertia::render('dashboard/pegawai', [
            'sss' => session('sss')
        ]);
    }

    public function pegawai_detail($id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return redirect('/dashboard');
        }
        return Inertia::render('dashboard/pegawai-detail', [
            'sss' => session('sss'),
            'id' => $id
        ]);
    }

    public function cuti()
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return redirect('/dashboard');
        }
        return Inertia::render('dashboard/cuti', [
            'sss' => session('sss')
        ]);
    }

    public function kegiatan()
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return redirect('/dashboard');
        }
        return Inertia::render('dashboard/kegiatan', [
            'sss' => session('sss')
        ]);
    }
}
