<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KegiatanController extends Controller
{
    /**
     * Display the kegiatan page
     */
    public function index()
    {
        return inertia('dashboard/kegiatan');
    }

    /**
     * Get list of kegiatan for calendar
     */
    public function list(Request $request)
    {
        try {
            $sss = session('sss');
            if (($sss['acs'] ?? '') !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $bulan = $request->get('bulan');
            $tahun = $request->get('tahun');

            if (!$bulan || !$tahun) {
                $now = now();
                $bulan = $now->month;
                $tahun = $now->year;
            }

            $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();

            $kegiatans = Kegiatan::whereBetween('tanggal', [$startDate, $endDate])
                ->orderBy('tanggal')
                ->orderBy('jam_mulai')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'kegiatans' => $kegiatans,
                    'bulan' => $bulan,
                    'tahun' => $tahun
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single kegiatan details
     */
    public function detail($id)
    {
        try {
            $sss = session('sss');
            if (($sss['acs'] ?? '') !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $kegiatan = Kegiatan::findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $kegiatan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new kegiatan
     */
    public function store(Request $request)
    {
        try {
            $sss = session('sss');
            if (($sss['acs'] ?? '') !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'tanggal' => 'required|date',
                'jam_mulai' => 'nullable|date_format:H:i',
                'jam_selesai' => 'nullable|date_format:H:i|after_or_equal:jam_mulai',
                'is_fullday' => 'nullable|boolean',
                'warna' => 'required|in:merah,kuning,hijau,biru'
            ]);

            $kegiatan = Kegiatan::create([
                'id' => (string) Str::uuid(),
                'nama' => $validated['nama'],
                'tanggal' => $validated['tanggal'],
                'jam_mulai' => $validated['jam_mulai'] ?? null,
                'jam_selesai' => $validated['jam_selesai'] ?? null,
                'is_fullday' => $validated['is_fullday'] ?? true,
                'warna' => $validated['warna']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Kegiatan berhasil ditambahkan',
                'data' => $kegiatan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update kegiatan
     */
    public function update(Request $request, $id)
    {
        try {
            $sss = session('sss');
            if (($sss['acs'] ?? '') !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $kegiatan = Kegiatan::findOrFail($id);

            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'tanggal' => 'required|date',
                'jam_mulai' => 'nullable|date_format:H:i',
                'jam_selesai' => 'nullable|date_format:H:i|after_or_equal:jam_mulai',
                'is_fullday' => 'nullable|boolean',
                'warna' => 'required|in:merah,kuning,hijau,biru'
            ]);

            $kegiatan->update([
                'nama' => $validated['nama'],
                'tanggal' => $validated['tanggal'],
                'jam_mulai' => $validated['jam_mulai'] ?? null,
                'jam_selesai' => $validated['jam_selesai'] ?? null,
                'is_fullday' => $validated['is_fullday'] ?? true,
                'warna' => $validated['warna']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Kegiatan berhasil diperbarui',
                'data' => $kegiatan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete kegiatan
     */
    public function destroy($id)
    {
        try {
            $sss = session('sss');
            if (($sss['acs'] ?? '') !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $kegiatan = Kegiatan::findOrFail($id);
            $kegiatan->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Kegiatan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

