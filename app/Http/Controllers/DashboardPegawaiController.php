<?php

namespace App\Http\Controllers;

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
}
