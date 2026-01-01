<?php

namespace App\Http\Controllers;

use App\Models\Cuti;
use App\Models\Pegawai;
use Illuminate\Http\Request;

class CutiController extends Controller
{
    /**
     * Get list of cuti for current logged in employee
     */
    public function myList()
    {
        try {
            $akun = session('sss')['usr'];
            
            if (!$akun) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $pegawai = Pegawai::where('akun_id', $akun)->first();

            if (!$pegawai) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pegawai tidak ditemukan'
                ], 404);
            }

            $cutis = Cuti::where('pegawai_id', $pegawai->id)
                ->orderBy('tanggal_mulai', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'cutis' => $cutis,
                    'pegawai' => $pegawai
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
     * Add new cuti request for current logged in employee
     */
    public function add(Request $request)
    {
        try {
            $akunId = session('sss.usr');
            
            if (!$akunId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $pegawai = Pegawai::where('akun_id', $akunId)->first();

            if (!$pegawai) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pegawai tidak ditemukan'
                ], 404);
            }

            $validated = $request->validate([
                'tanggal_mulai' => 'required|date',
                'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
                'catatan' => 'nullable|string|max:255'
            ]);

            $cuti = Cuti::create([
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'],
                'catatan' => $validated['catatan'] ?? null,
                'acc' => false,
                'pegawai_id' => $pegawai->id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengajuan cuti berhasil dikirim',
                'data' => $cuti
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

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

            $type = $request->get('type', 'upcoming');
            $filter = $request->get('filter', 'all');
            $page = $request->get('page', 1);
            $perPage = 10;

            $query = Cuti::with('pegawai')->with('pegawai.akun')->orderBy('created_at', 'desc');

            if ($type === 'upcoming') {
                $query->where('tanggal_mulai', '>', now()->toDateString());
                
                if ($filter === 'waiting') {
                    $query->whereRaw('created_at = updated_at');
                } else if ($filter === 'processed') {
                    $query->whereRaw('created_at != updated_at');
                }
                
                $cutis = $query->orderBy('tanggal_mulai', 'asc')->get();
                
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'cutis' => $cutis,
                        'type' => 'upcoming',
                        'total' => $cutis->count()
                    ]
                ]);
            } elseif ($type === 'active') {
                $query->where('tanggal_mulai', '<=', now()->toDateString())
                      ->where('tanggal_selesai', '>=', now()->toDateString());
                
                $cutis = $query->orderBy('tanggal_mulai', 'asc')->get();
                
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'cutis' => $cutis,
                        'type' => 'active',
                        'total' => $cutis->count()
                    ]
                ]);
            } else {
                $query->where('tanggal_selesai', '<', now()->toDateString());

                $cutis = $query->orderBy('tanggal_mulai', 'desc')
                    ->paginate($perPage, ['*'], 'page', $page);

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'cutis' => $cutis->items(),
                        'type' => 'past',
                        'total' => $cutis->total(),
                        'current_page' => $cutis->currentPage(),
                        'last_page' => $cutis->lastPage(),
                        'per_page' => $cutis->perPage()
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        try {
            $sss = session('sss');
            if (($sss['acs'] ?? '') !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            $cuti = Cuti::findOrFail($id);
            
            $validated = $request->validate([
                'acc' => 'required|boolean'
            ]);

            $cuti->update([
                'acc' => $validated['acc'],
                'updated_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => $validated['acc'] ? 'Cuti disetujui' : 'Cuti ditolak',
                'data' => $cuti
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

