<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardPegawaiController extends Controller
{
    public function presensi()
    {
        return Inertia::render('dashboard/pg-presensi', [
            'sss' => session('sss')
        ]);
    }
}
