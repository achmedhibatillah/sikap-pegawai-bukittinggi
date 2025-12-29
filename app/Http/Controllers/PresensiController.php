<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Presensi;
use App\Models\PegawaiPresensi;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

use App\Models\Pegawai;

class PresensiController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/presensi', [
            'sss' => session('sss')
        ]);
    }

    /**
     * API: list presensi sessions with pagination and optional date range filter
     * Returns per-row aggregated attendance counts
     */
    public function list(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Presensi::query();

        if ($from && $to) {
            $query->whereBetween('tanggal', [$from, $to]);
        } elseif ($from) {
            $query->where('tanggal', '>=', $from);
        } elseif ($to) {
            $query->where('tanggal', '<=', $to);
        }

        $paginated = $query->orderBy('tanggal', 'desc')->paginate($perPage);

        $ids = $paginated->pluck('id')->toArray();

        $counts = [];
        if (! empty($ids)) {
            $rows = DB::table('pegawai_presensi')
                ->select(
                    'presensi_id',
                    DB::raw('count(*) as total'),
                    DB::raw("SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir"),
                    DB::raw("SUM(CASE WHEN status = 'Hadir (Telat)' THEN 1 ELSE 0 END) as telat"),
                    DB::raw("SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin"),
                    DB::raw("SUM(CASE WHEN status = 'Cuti' THEN 1 ELSE 0 END) as cuti"),
                    DB::raw("SUM(CASE WHEN status = 'Alpa' THEN 1 ELSE 0 END) as alpa")
                )
                ->whereIn('presensi_id', $ids)
                ->groupBy('presensi_id')
                ->get()
                ->keyBy('presensi_id');

            foreach ($rows as $k => $v) {
                $counts[$k] = (array) $v;
            }
        }

        $collection = $paginated->getCollection()->map(function ($p) use ($counts) {
            $c = $counts[$p->id] ?? null;
            return [
                'id' => $p->id,
                'tanggal' => $p->tanggal?->toDateString(),
                'jam_mulai' => $p->jam_mulai,
                'jam_selesai' => $p->jam_selesai,
                'catatan' => $p->catatan,
                'totals' => [
                    'total' => $c['total'] ?? 0,
                    'hadir' => $c['hadir'] ?? 0,
                    'telat' => $c['telat'] ?? 0,
                    'izin' => $c['izin'] ?? 0,
                    'cuti' => $c['cuti'] ?? 0,
                    'alpa' => $c['alpa'] ?? 0,
                ],
            ];
        });

        $paginated->setCollection($collection);

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
     * Create a presensi session and optional attendee list
     */
    public function add(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
            'catatan' => 'nullable|string|max:255',
        ]);

        $presensi = DB::transaction(function () use ($request) {
            $p = Presensi::create([
                'id' => (string) Str::uuid(),
                'tanggal' => $request->tanggal,
                'jam_mulai' => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai,
                'catatan' => $request->catatan ?? null,
            ]);

            $pegawaiIds = Pegawai::pluck('id')->toArray();
            $rows = [];
            foreach ($pegawaiIds as $pid) {
                $rows[] = [
                    'pegawai_id' => $pid,
                    'presensi_id' => $p->id,
                    'status' => 'Alpa',
                    'masuk' => $p->jam_mulai,
                    'keluar' => $p->jam_selesai,
                    'catatan' => '',
                ];
            }
            if (! empty($rows)) {
                DB::table('pegawai_presensi')->insert($rows);
            }

            return $p;
        });

        return response()->json(['status' => 'success', 'data' => $presensi], 201);
    }

    public function addAttendance(Request $request, $id)
    {
        $request->validate([
            'pegawai_ids' => 'required|array|min:1',
            'pegawai_ids.*' => 'uuid|exists:pegawai,id',
            'status' => 'nullable|string',
        ]);

        $presensi = Presensi::find($id);
        if (! $presensi) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $rows = [];
        foreach ($request->pegawai_ids as $pid) {
            $rows[] = [
                'pegawai_id' => $pid,
                'presensi_id' => $presensi->id,
                'status' => $request->status ?? 'Hadir',
                'masuk' => $request->masuk ?? $presensi->jam_mulai,
                'keluar' => $request->keluar ?? $presensi->jam_selesai,
                'catatan' => $request->catatan ?? '',
            ];
        }

        DB::table('pegawai_presensi')->insert($rows);

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Render presensi detail Inertia page
     */
    public function detail($id)
    {
        return Inertia::render('dashboard/presensi-detail', [
            'id' => $id,
            'sss' => session('sss')
        ]);
    }

    /**
     * API: get presensi detail including pegawai and pivot data
     */
    public function detailApi($id)
    {
        $presensi = Presensi::with(['pegawais.fotoFile'])->find($id);
        if (! $presensi) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $pegawais = $presensi->pegawais->map(function ($pg) {
            $fotoUrl = null;
            if ($pg->fotoFile) {
                $fotoUrl = '/storage/' . ltrim($pg->fotoFile->path, '/');
            }

            return [
                'id' => $pg->id,
                'nama' => $pg->nama,
                'foto' => $fotoUrl,
                'pivot' => [
                    'status' => $pg->pivot->status ?? null,
                    'masuk' => $pg->pivot->masuk ?? null,
                    'keluar' => $pg->pivot->keluar ?? null,
                    'catatan' => $pg->pivot->catatan ?? null,
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'presensi' => [
                    'id' => $presensi->id,
                    'tanggal' => $presensi->tanggal?->toDateString(),
                    'jam_mulai' => $presensi->jam_mulai,
                    'jam_selesai' => $presensi->jam_selesai,
                    'catatan' => $presensi->catatan,
                ],
                'pegawais' => $pegawais,
            ],
        ]);
    }

    /**
     * Update a pegawai_presensi pivot row for a given presensi and pegawai
     */
    public function updatePegawaiPresensi(Request $request, $id, $pegawai_id)
    {
        $request->validate([
            'status' => 'nullable|string',
            'masuk' => 'nullable|string',
            'keluar' => 'nullable|string',
            'catatan' => 'nullable|string|max:255',
        ]);

        $exists = DB::table('pegawai_presensi')
            ->where('presensi_id', $id)
            ->where('pegawai_id', $pegawai_id)
            ->exists();

        if (! $exists) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $update = [];
        if ($request->has('status')) $update['status'] = $request->input('status');
        if ($request->has('masuk')) $update['masuk'] = $request->input('masuk');
        if ($request->has('keluar')) $update['keluar'] = $request->input('keluar');
        if ($request->has('catatan')) $update['catatan'] = $request->input('catatan');

        if (! empty($update)) {
            DB::table('pegawai_presensi')
                ->where('presensi_id', $id)
                ->where('pegawai_id', $pegawai_id)
                ->update($update);
        }

        return response()->json(['status' => 'success'], 200);
    }
}
