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
        return Inertia::render('dashboard/pegawai', [
            'sss' => session('sss')
        ]);
    }

    public function pegawai_detail($id)
    {
        return Inertia::render('dashboard/pegawai-detail', [
            'sss' => session('sss'),
            'id' => $id
        ]);
    }
}
