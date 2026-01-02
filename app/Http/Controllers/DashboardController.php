<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/index', [
            'sss' => session('sss')
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
