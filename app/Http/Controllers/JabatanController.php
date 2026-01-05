<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Jabatan;
use App\Models\JabatanAjuan;
use App\Models\JabatanTingkat;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class JabatanController extends Controller
{
    /**
     * Render jabatan management page (admin only)
     */
    public function index()
    {
        return Inertia::render('dashboard/jabatan', [
            'sss' => session('sss')
        ]);
    }

    /**
     * API: list all active positions with pagination
     */
    public function list(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $search = $request->input('search', '');
        $aktif = $request->input('aktif');

        $query = Jabatan::with('tingkat');

        if ($search) {
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
        }

        if ($aktif !== null && $aktif !== '') {
            $query->where('aktif', (bool) $aktif);
        }

        $paginated = $query->with('tingkat')
                          ->orderBy('jabatan_tingkatan_id', 'asc')
                          ->orderBy('nama', 'asc')
                          ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ],
            ],
        ]);
    }

    /**
     * API: get all active positions (dropdown)
     */
    public function allActive()
    {
        $jabatans = Jabatan::with('tingkat')->aktif()
                          ->ordered()
                          ->get();

        return response()->json([
            'status' => 'success',
            'data' => $jabatans,
        ]);
    }

    /**
     * Create a new position
     */
    public function store(Request $request)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $request->validate([
            'nama' => 'required|string|max:50|unique:jabatan,nama',
            'jabatan_tingkatan_id' => 'required|exists:jabatan_tingkatan,id',
            'deskripsi' => 'nullable|string|max:255',
        ]);

        $jabatan = Jabatan::create([
            'id' => (string) Str::uuid(),
            'nama' => $request->nama,
            'jabatan_tingkatan_id' => $request->jabatan_tingkatan_id,
            'deskripsi' => $request->deskripsi ?? '',
            'aktif' => true,
        ]);

        return response()->json(['status' => 'success', 'data' => $jabatan], 201);
    }

    /**
     * Update a position
     */
    public function update(Request $request, $id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $request->validate([
            'nama' => 'required|string|max:50|unique:jabatan,nama,' . $id,
            'jabatan_tingkatan_id' => 'required|exists:jabatan_tingkatan,id',
            'deskripsi' => 'nullable|string|max:255',
            'aktif' => 'nullable|boolean',
        ]);

        $jabatan->update([
            'nama' => $request->nama,
            'jabatan_tingkatan_id' => $request->jabatan_tingkatan_id,
            'deskripsi' => $request->deskripsi ?? $jabatan->deskripsi,
            'aktif' => $request->aktif ?? $jabatan->aktif,
        ]);

        return response()->json(['status' => 'success', 'data' => $jabatan]);
    }

    /**
     * Soft delete (deactivate) a position
     */
    public function destroy($id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            return response()->json(['status' => 'not-found'], 404);
        }

        // Soft delete by setting aktif = false
        $jabatan->update(['aktif' => false]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Restore a deactivated position
     */
    public function restore($id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $jabatan->update(['aktif' => true]);

        return response()->json(['status' => 'success']);
    }

    // ==================== PENGAJUAN JABATAN ====================

    /**
     * Render ajuan jabatan page
     */
    public function ajuanIndex()
    {
        return Inertia::render('dashboard/jabatan-ajuan', [
            'sss' => session('sss')
        ]);
    }

    /**
     * API: list all ajuan with filters
     */
    public function ajuanList(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $status = $request->input('status');
        $pegawaiId = $request->input('pegawai_id');

        $query = JabatanAjuan::with(['pegawai', 'jabatanLama', 'jabatanBaru', 'accBy']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($pegawaiId) {
            $query->where('pegawai_id', $pegawaiId);
        }

        $paginated = $query->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ],
            ],
        ]);
    }

    /**
     * API: get my ajuan (for logged in employee)
     */
    public function myAjuan(Request $request)
    {
        $sss = session('sss');
        $akunId = $sss['usr'] ?? null;

        if (!$akunId) {
            return response()->json(['status' => 'unauthorized'], 401);
        }

        $pegawai = DB::table('pegawai')->where('akun_id', $akunId)->first();
        if (!$pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $ajuan = JabatanAjuan::with(['jabatanLama', 'jabatanBaru', 'accBy'])
            ->where('pegawai_id', $pegawai->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $ajuan,
        ]);
    }

    /**
     * API: get pending ajuan count (for kepala)
     */
    public function pendingCount()
    {
        $count = JabatanAjuan::pending()->count();

        return response()->json([
            'status' => 'success',
            'data' => ['count' => $count],
        ]);
    }

    /**
     * Submit a new position change request
     */
    public function ajuanStore(Request $request)
    {
        $sss = session('sss');
        $akunId = $sss['usr'] ?? null;

        if (!$akunId) {
            return response()->json(['status' => 'unauthorized'], 401);
        }

        // Get employee
        $pegawai = DB::table('pegawai')->where('akun_id', $akunId)->first();
        if (!$pegawai) {
            return response()->json(['status' => 'not-found', 'message' => 'Pegawai tidak ditemukan'], 404);
        }

        $request->validate([
            'jabatan_baru_id' => 'required|exists:jabatan,id',
            'alasan' => 'nullable|string|max:500',
        ]);

        // Get current active position
        $currentJabatan = DB::table('pegawai_jabatan')
            ->where('pegawai_id', $pegawai->id)
            ->whereNull('selesai')
            ->first();

        $jabatanLamaId = $currentJabatan->jabatan_id ?? null;

        // Check if same position
        if ($jabatanLamaId === $request->jabatan_baru_id) {
            return response()->json(['status' => 'error', 'message' => 'Jabatan baru sama dengan jabatan saat ini'], 400);
        }

        // Check for pending ajuan
        $pendingExists = JabatanAjuan::where('pegawai_id', $pegawai->id)
            ->where('status', 'pending')
            ->exists();

        if ($pendingExists) {
            return response()->json(['status' => 'error', 'message' => 'Anda sudah memiliki pengajuan yang pending'], 400);
        }

        $ajuan = JabatanAjuan::create([
            'id' => (string) Str::uuid(),
            'pegawai_id' => $pegawai->id,
            'jabatan_lama_id' => $jabatanLamaId,
            'jabatan_baru_id' => $request->jabatan_baru_id,
            'alasan' => $request->alasan,
            'status' => 'pending',
        ]);

        return response()->json(['status' => 'success', 'data' => $ajuan], 201);
    }

    /**
     * Approve a position change request (kepala only)
     */
    public function ajuanApprove(Request $request, $id)
    {
        $sss = session('sss');
        $akunId = $sss['usr'] ?? null;

        // Check if user is kepala (you may need to adjust this based on your role system)
        $isKepala = ($sss['acs'] ?? '') === 'kepala' || ($sss['acs'] ?? '') === 'admin';
        
        if (!$akunId || !$isKepala) {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $ajuan = JabatanAjuan::with(['pegawai', 'jabatanLama', 'jabatanBaru'])->find($id);
        if (!$ajuan) {
            return response()->json(['status' => 'not-found'], 404);
        }

        if (!$ajuan->isPending()) {
            return response()->json(['status' => 'error', 'message' => 'Pengajuan sudah diproses'], 400);
        }

        $request->validate([
            'catatan_acc' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($ajuan, $akunId, $request) {
            // Update ajuan status
            $ajuan->update([
                'status' => 'diterima',
                'acc_by' => $akunId,
                'acc_at' => now(),
                'catatan_acc' => $request->catatan_acc,
            ]);

            // Close old position
            if ($ajuan->jabatan_lama_id) {
                DB::table('pegawai_jabatan')
                    ->where('pegawai_id', $ajuan->pegawai_id)
                    ->where('jabatan_id', $ajuan->jabatan_lama_id)
                    ->whereNull('selesai')
                    ->update(['selesai' => date('Y-m-d')]);
            }

            // Add new position
            DB::table('pegawai_jabatan')->insert([
                'pegawai_id' => $ajuan->pegawai_id,
                'jabatan_id' => $ajuan->jabatan_baru_id,
                'mulai' => date('Y-m-d'),
                'selesai' => null,
            ]);
        });

        return response()->json(['status' => 'success', 'data' => $ajuan]);
    }

    /**
     * Reject a position change request (kepala only)
     */
    public function ajuanReject(Request $request, $id)
    {
        $sss = session('sss');
        $akunId = $sss['usr'] ?? null;

        $isKepala = ($sss['acs'] ?? '') === 'kepala' || ($sss['acs'] ?? '') === 'admin';
        
        if (!$akunId || !$isKepala) {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $ajuan = JabatanAjuan::find($id);
        if (!$ajuan) {
            return response()->json(['status' => 'not-found'], 404);
        }

        if (!$ajuan->isPending()) {
            return response()->json(['status' => 'error', 'message' => 'Pengajuan sudah diproses'], 400);
        }

        $request->validate([
            'catatan_acc' => 'nullable|string|max:500',
        ]);

        $ajuan->update([
            'status' => 'ditolak',
            'acc_by' => $akunId,
            'acc_at' => now(),
            'catatan_acc' => $request->catatan_acc,
        ]);

        return response()->json(['status' => 'success', 'data' => $ajuan]);
    }

    // ==================== JABATAN TINGKATAN CRUD ====================

    /**
     * API: list all tingkat with pagination
     */
    public function tingkatList(Request $request)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $perPage = (int) $request->input('per_page', 10);
        $search = $request->input('search', '');
        $aktif = $request->input('aktif');

        $query = JabatanTingkat::query();

        if ($search) {
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('tingkat', 'like', "%{$search}%");
        }

        if ($aktif !== null && $aktif !== '') {
            $query->where('aktif', (bool) $aktif);
        }

        $paginated = $query->orderBy('tingkat', 'asc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ],
            ],
        ]);
    }

    /**
     * API: get all active tingkat (for dropdown)
     */
    public function tingkatAllActive()
    {
        $tingkatans = JabatanTingkat::aktif()->ordered()->get();

        return response()->json([
            'status' => 'success',
            'data' => $tingkatans,
        ]);
    }

    /**
     * Create a new tingkat
     */
    public function tingkatStore(Request $request)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $request->validate([
            'tingkat' => 'required|string|min:1|unique:jabatan_tingkatan,tingkat',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string|max:255',
        ]);

        $tingkat = JabatanTingkat::create([
            'tingkat' => (string) $request->tingkat,
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi ?? '',
            'aktif' => true,
        ]);

        return response()->json(['status' => 'success', 'data' => $tingkat], 201);
    }

    /**
     * Update a tingkat
     */
    public function tingkatUpdate(Request $request, $id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $tingkat = JabatanTingkat::find($id);
        if (!$tingkat) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $request->validate([
            'tingkat' => 'required|string|min:1|unique:jabatan_tingkatan,tingkat,' . $id,
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string|max:255',
            'aktif' => 'nullable|boolean',
        ]);

        $tingkat->update([
            'tingkat' => (string) $request->tingkat,
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi ?? $tingkat->deskripsi,
            'aktif' => $request->aktif ?? $tingkat->aktif,
        ]);

        return response()->json(['status' => 'success', 'data' => $tingkat]);
    }

    /**
     * Soft delete (deactivate) a tingkat
     */
    public function tingkatDestroy($id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $tingkat = JabatanTingkat::find($id);
        if (!$tingkat) {
            return response()->json(['status' => 'not-found'], 404);
        }

        // Check if there are any jabatans using this tingkat
        $jabatanCount = DB::table('jabatan')
            ->where('jabatan_tingkatan_id', $id)
            ->where('aktif', true)
            ->count();

        if ($jabatanCount > 0) {
            return response()->json([
                'status' => 'error',
                'message' => "Tidak dapat menonaktifkan tingkat ini karena masih digunakan oleh {$jabatanCount} jabatan aktif"
            ], 400);
        }

        $tingkat->update(['aktif' => false]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Restore a deactivated tingkat
     */
    public function tingkatRestore($id)
    {
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $tingkat = JabatanTingkat::find($id);
        if (!$tingkat) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $tingkat->update(['aktif' => true]);

        return response()->json(['status' => 'success']);
    }
}

