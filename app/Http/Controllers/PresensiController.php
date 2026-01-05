<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Presensi;
use App\Models\PegawaiPresensi;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Models\Pegawai;
use App\Models\Cuti;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class PresensiController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/presensi', [
            'sss' => session('sss')
        ]);
    }

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
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

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

            $tanggalPresensi = $request->tanggal;
            $pegawaiIds = Pegawai::pluck('id')->toArray();

            // Get all approved leaves for this date (optimized: single query)
            $cutiIds = Cuti::where('acc', true)
                ->whereDate('tanggal_mulai', '<=', $tanggalPresensi)
                ->whereDate('tanggal_selesai', '>=', $tanggalPresensi)
                ->pluck('pegawai_id')
                ->toArray();

            $rows = [];
            foreach ($pegawaiIds as $pid) {
                // Check if employee is in the leave list
                $status = in_array($pid, $cutiIds) ? 'Cuti' : 'Alpa';

                $rows[] = [
                    'pegawai_id' => $pid,
                    'presensi_id' => $p->id,
                    'status' => $status,
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
        $sss = session('sss');
        if (($sss['acs'] ?? '') !== 'admin') {
            return response()->json(['status' => 'forbidden'], 403);
        }

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

    public function currentApi(Request $request)
    {
        $pegawaiId = $request->input('pegawai_id');


        $presensis = Presensi::orderBy('jam_mulai', 'desc')->get();

        if ($presensis->isEmpty()) {
            return response()->json(['status' => 'not-found', 'data' => []], 200);
        }

        $result = $presensis->map(function ($presensi) use ($pegawaiId) {
            $pivot = null;
            if ($pegawaiId) {
                $row = DB::table('pegawai_presensi')
                    ->where('presensi_id', $presensi->id)
                    ->where('pegawai_id', $pegawaiId)
                    ->first();

                if ($row) {
                    $pivot = [
                        'status' => $row->status,
                        'masuk' => $row->masuk,
                        'keluar' => $row->keluar,
                        'catatan' => $row->catatan,
                    ];
                }
            }

            $withinNow = false;
            $isOpen = false;
            try {
                // Get the presensi date from the record itself
                $tanggalStr = $presensi->tanggal instanceof \DateTime 
                    ? $presensi->tanggal->format('Y-m-d') 
                    : (string) $presensi->tanggal;
                
                $today = date('Y-m-d');
                
                // Check if presensi date is today
                $isToday = ($tanggalStr === $today);
                
                // For presensi on other dates, only show open if someone has clocked in
                if (!$isToday) {
                    // Check if any employee clocked in during the early window
                    $hasAnyMasuk = DB::table('pegawai_presensi')
                        ->where('presensi_id', $presensi->id)
                        ->whereNotNull('masuk')
                        ->exists();
                    
                    // For past/future dates, is_open only if someone clocked in
                    $isOpen = $hasAnyMasuk;
                    $withinNow = false;
                } else {
                    // For today's presensi, use normal time window calculation
                    $now = new \DateTime();
                    $start = new \DateTime($tanggalStr . ' ' . $presensi->jam_mulai);
                    $start->modify('-30 minutes'); // 30 menit sebelum jam_mulai
                    $end = new \DateTime($tanggalStr . ' ' . $presensi->jam_selesai);
                    $end->modify('+30 minutes'); // 30 menit setelah jam_selesai
                    $withinNow = ($now >= $start && $now <= $end);
                    
                    // Session is open if:
                    // - Within the normal window (30 min before jam_mulai to 30 min after jam_selesai)
                    // - OR if employee has already clocked IN but not yet clocked OUT (can still clock out)
                    $hasMasuk = $pivot && !empty($pivot['masuk']);
                    $hasKeluar = $pivot && !empty($pivot['keluar']);
                    
                    // Also check if someone clocked in during the early window (30 min before jam_mulai)
                    $hasAnyMasuk = false;
                    if (!$hasMasuk) {
                        // Check if any employee clocked in during the open window
                        $anyMasuk = DB::table('pegawai_presensi')
                            ->where('presensi_id', $presensi->id)
                            ->whereNotNull('masuk')
                            ->where('masuk', '>=', $start->format('H:i:s'))
                            ->where('masuk', '<=', $presensi->jam_mulai)
                            ->exists();
                        $hasAnyMasuk = $anyMasuk;
                    }
                    
                    $isOpen = ($now >= $start && $now < $end) || ($hasMasuk && !$hasKeluar) || $hasAnyMasuk;
                }
            } catch (\Exception $e) {
                $withinNow = false;
                $isOpen = false;
            }

            return [
                'presensi' => [
                    'id' => $presensi->id,
                    'tanggal' => $presensi->tanggal instanceof \DateTime 
                        ? $presensi->tanggal->format('Y-m-d') 
                        : $presensi->tanggal,
                    'jam_mulai' => $presensi->jam_mulai,
                    'jam_selesai' => $presensi->jam_selesai,
                    'catatan' => $presensi->catatan,
                ],
                'pivot' => $pivot,
                'within_now' => $withinNow,
                'is_open' => $isOpen,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ]);
    }

    /**
     * Dev helper: create a presensi session for today if none exists.
     * This endpoint is intended for local/dev only and will return 403 outside local env.
     */
    public function devCreateToday(Request $request)
    {
        if (env('APP_ENV') !== 'local' && env('APP_ENV') !== 'development') {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $today = date('Y-m-d');
        $exists = Presensi::where('tanggal', $today)->first();
        if ($exists) {
            return response()->json(['status' => 'success', 'data' => ['presensi' => [
                'id' => $exists->id,
                'tanggal' => $exists->tanggal?->toDateString(),
                'jam_mulai' => $exists->jam_mulai,
                'jam_selesai' => $exists->jam_selesai,
                'catatan' => $exists->catatan,
            ]]], 200);
        }

        $jam_mulai = $request->input('jam_mulai', '08:00:00');
        $jam_selesai = $request->input('jam_selesai', '17:00:00');
        $catatan = $request->input('catatan', 'Auto-created for dev');

        $presensi = DB::transaction(function () use ($today, $jam_mulai, $jam_selesai, $catatan) {
            $p = Presensi::create([
                'id' => (string) Str::uuid(),
                'tanggal' => $today,
                'jam_mulai' => $jam_mulai,
                'jam_selesai' => $jam_selesai,
                'catatan' => $catatan,
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

        return response()->json(['status' => 'success', 'data' => ['presensi' => [
            'id' => $presensi->id,
            'tanggal' => $presensi->tanggal?->toDateString(),
            'jam_mulai' => $presensi->jam_mulai,
            'jam_selesai' => $presensi->jam_selesai,
            'catatan' => $presensi->catatan,
        ]]], 201);
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
        
        // Auto-calculate late status if status is Hadir and masuk time is provided
        if ($request->has('status') && $request->has('masuk')) {
            $presensi = Presensi::find($id);
            if ($presensi && $request->input('status') === 'Hadir') {
                // Get just the date portion from tanggal
                $tanggal = $presensi->tanggal instanceof \DateTime 
                    ? $presensi->tanggal->format('Y-m-d') 
                    : $presensi->tanggal;
                
                $scheduledStart = new \DateTime($tanggal . ' ' . $presensi->jam_mulai);
                $actualMasuk = new \DateTime($tanggal . ' ' . $request->input('masuk'));
                
                // If actual masuk time is after scheduled start time, mark as late
                if ($actualMasuk > $scheduledStart) {
                    $update['status'] = 'Hadir (Telat)';
                } else {
                    $update['status'] = 'Hadir';
                }
            } else {
                $update['status'] = $request->input('status');
            }
        } elseif ($request->has('status')) {
            $update['status'] = $request->input('status');
        }
        
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

    /**
     * API: Get riwayat presensi for logged in employee with monthly pagination/filter
     */
    public function riwayatPegawai(Request $request)
    {
        $sss = session('sss');
        $akunId = $sss['usr'] ?? null;
        
        if (!$akunId) {
            return response()->json(['status' => 'unauthorized', 'data' => []], 401);
        }

        // Get employee ID from akun
        $pegawai = DB::table('pegawai')
            ->where('akun_id', $akunId)
            ->first();

        if (!$pegawai) {
            return response()->json(['status' => 'not-found', 'data' => []], 404);
        }

        $pegawaiId = $pegawai->id;
        $bulan = $request->input('bulan'); // Format: YYYY-MM
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);

        $query = Presensi::query();

        // Filter by month if provided
        if ($bulan) {
            $query->whereYear('tanggal', substr($bulan, 0, 4))
                  ->whereMonth('tanggal', substr($bulan, 5, 2));
        } else {
            // Default: current month
            $query->whereYear('tanggal', date('Y'))
                  ->whereMonth('tanggal', date('m'));
        }

        $paginated = $query->orderBy('tanggal', 'desc')->paginate($perPage, ['*'], 'page', $page);

        $ids = $paginated->pluck('id')->toArray();

        // Get attendance data for this employee
        $presensiData = [];
        if (!empty($ids)) {
            $rows = DB::table('pegawai_presensi')
                ->where('pegawai_id', $pegawaiId)
                ->whereIn('presensi_id', $ids)
                ->get();

            foreach ($rows as $row) {
                $presensiData[$row->presensi_id] = [
                    'status' => $row->status,
                    'masuk' => $row->masuk,
                    'keluar' => $row->keluar,
                    'catatan' => $row->catatan,
                ];
            }
        }

        $collection = $paginated->getCollection()->map(function ($p) use ($presensiData) {
            $data = $presensiData[$p->id] ?? null;
            return [
                'id' => $p->id,
                'tanggal' => $p->tanggal?->toDateString(),
                'tanggal_formatted' => $p->tanggal?->translatedFormat('l, d F Y'),
                'jam_mulai' => $p->jam_mulai,
                'jam_selesai' => $p->jam_selesai,
                'catatan' => $p->catatan,
                'pivot' => $data ? [
                    'status' => $data['status'],
                    'masuk' => $data['masuk'],
                    'keluar' => $data['keluar'],
                    'catatan' => $data['catatan'],
                ] : null,
            ];
        });

        $paginated->setCollection($collection);

        // Calculate statistics for the month
        $statsQuery = DB::table('pegawai_presensi as pp')
            ->join('presensi as p', 'pp.presensi_id', '=', 'p.id')
            ->where('pp.pegawai_id', $pegawaiId);

        if ($bulan) {
            $statsQuery->whereYear('p.tanggal', substr($bulan, 0, 4))
                       ->whereMonth('p.tanggal', substr($bulan, 5, 2));
        } else {
            $statsQuery->whereYear('p.tanggal', date('Y'))
                       ->whereMonth('p.tanggal', date('m'));
        }

        $stats = $statsQuery->select(
            DB::raw('COUNT(*) as total'),
            DB::raw("SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir"),
            DB::raw("SUM(CASE WHEN status = 'Hadir (Telat)' THEN 1 ELSE 0 END) as telat"),
            DB::raw("SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin"),
            DB::raw("SUM(CASE WHEN status = 'Cuti' THEN 1 ELSE 0 END) as cuti"),
            DB::raw("SUM(CASE WHEN status = 'Alpa' THEN 1 ELSE 0 END) as alpa")
        )->first();

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
                'stats' => [
                    'total' => $stats->total ?? 0,
                    'hadir' => $stats->hadir ?? 0,
                    'telat' => $stats->telat ?? 0,
                    'izin' => $stats->izin ?? 0,
                    'cuti' => $stats->cuti ?? 0,
                    'alpa' => $stats->alpa ?? 0,
                ],
                'bulan' => $bulan ?? date('Y-m'),
            ],
        ]);
    }


    public function downloadLaporan(Request $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');

        if (!$from) {
            $from = date('Y-m-01');
        }
        if (!$to) {
            $to = date('Y-m-t');
        }

        $presensiQuery = Presensi::whereBetween('tanggal', [$from, $to]);
        $presensiIds = $presensiQuery->pluck('id')->toArray();
        $totalHariKerja = count($presensiIds);

        $periode = Carbon::parse($from)->translatedFormat('l, d F Y') . 
                   ' - ' . 
                   Carbon::parse($to)->translatedFormat('l, d F Y');

        $spreadsheet = new Spreadsheet();
        
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Rekap Presensi');

        $headerStyle = [
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE8F5E9']],
        ];

        $bodyStyle = [
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];

        $sheet1->setCellValue('A1', 'LAPORAN REKAP PRESENSI');
        $sheet1->mergeCells('A1:G1');
        $sheet1->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet1->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet1->setCellValue('A2', 'Periode: ' . $periode);
        $sheet1->mergeCells('A2:G2');
        $sheet1->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $headers1 = ['No', 'Nama Pegawai', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Total Hari Kerja'];
        $col = 'A';
        foreach ($headers1 as $header) {
            $sheet1->setCellValue($col . '4', $header);
            $col++;
        }
        $sheet1->getStyle('A4:G4')->applyFromArray($headerStyle);

        $sheet1->getColumnDimension('A')->setWidth(6);
        $sheet1->getColumnDimension('B')->setWidth(25);
        $sheet1->getColumnDimension('C')->setWidth(10);
        $sheet1->getColumnDimension('D')->setWidth(10);
        $sheet1->getColumnDimension('E')->setWidth(10);
        $sheet1->getColumnDimension('F')->setWidth(10);
        $sheet1->getColumnDimension('G')->setWidth(15);

        $pegawais = Pegawai::orderBy('nama', 'asc')->get();

        $row = 5;
        $no = 1;
        foreach ($pegawais as $pegawai) {
            $stats = DB::table('pegawai_presensi')
                ->where('pegawai_id', $pegawai->id)
                ->whereIn('presensi_id', $presensiIds)
                ->select(
                    DB::raw("SUM(CASE WHEN status IN ('Hadir', 'Hadir (Telat)') THEN 1 ELSE 0 END) as hadir"),
                    DB::raw("SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin"),
                    DB::raw("SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit"),
                    DB::raw("SUM(CASE WHEN status = 'Alpa' THEN 1 ELSE 0 END) as alpha")
                )
                ->first();

            $sheet1->setCellValue('A' . $row, $no);
            $sheet1->setCellValue('B' . $row, $pegawai->nama);
            $sheet1->setCellValue('C' . $row, $stats->hadir ?? 0);
            $sheet1->setCellValue('D' . $row, $stats->izin ?? 0);
            $sheet1->setCellValue('E' . $row, $stats->sakit ?? 0);
            $sheet1->setCellValue('F' . $row, $stats->alpha ?? 0);
            $sheet1->setCellValue('G' . $row, $totalHariKerja);

            $sheet1->getStyle('A' . $row . ':G' . $row)->applyFromArray($bodyStyle);
            $sheet1->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle('C' . $row . ':G' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row++;
            $no++;
        }

        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Data Pegawai');

        $sheet2->setCellValue('A1', 'DATA PEGAWAI');
        $sheet2->mergeCells('A1:E1');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet2->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $headers2 = ['NIP', 'Nama Pegawai', 'Jabatan', 'Unit Kerja', 'Status'];
        $col = 'A';
        foreach ($headers2 as $header) {
            $sheet2->setCellValue($col . '3', $header);
            $col++;
        }
        $sheet2->getStyle('A3:E3')->applyFromArray($headerStyle);

        $sheet2->getColumnDimension('A')->setWidth(15);
        $sheet2->getColumnDimension('B')->setWidth(25);
        $sheet2->getColumnDimension('C')->setWidth(20);
        $sheet2->getColumnDimension('D')->setWidth(20);
        $sheet2->getColumnDimension('E')->setWidth(12);

        $row = 4;
        foreach ($pegawais as $pegawai) {
            $currentJabatan = $pegawai->currentJabatan()->first();
            $jabatanName = $currentJabatan ? $currentJabatan->nama : '-';

            $sheet2->setCellValue('A' . $row, '-');
            $sheet2->setCellValue('B' . $row, $pegawai->nama);
            $sheet2->setCellValue('C' . $row, $jabatanName);
            $sheet2->setCellValue('D' . $row, 'Puskesmas Tanah Tinggi');
            $sheet2->setCellValue('E' . $row, 'Aktif');

            $sheet2->getStyle('A' . $row . ':E' . $row)->applyFromArray($bodyStyle);
            $sheet2->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet2->getStyle('E' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row++;
        }

        $spreadsheet->setActiveSheetIndex(0);

        $filename = 'laporan_presensi_' . date('Y-m-d_H-i-s') . '.xlsx';

        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Download laporan presensi untuk pegawai (single sheet)
     */
    public function downloadLaporanPegawai(Request $request)
    {
        $sss = session('sss');
        $akunId = $sss['usr'] ?? null;
        
        if (!$akunId) {
            return response()->json(['status' => 'unauthorized'], 401);
        }

        // Get employee ID from akun
        $pegawai = DB::table('pegawai')
            ->where('akun_id', $akunId)
            ->first();

        if (!$pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $pegawaiId = $pegawai->id;
        $bulan = $request->input('bulan', date('Y-m'));

        // Get presensi data for this employee in the month
        $query = Presensi::query()
            ->whereYear('tanggal', substr($bulan, 0, 4))
            ->whereMonth('tanggal', substr($bulan, 5, 2))
            ->orderBy('tanggal', 'asc');

        $presensis = $query->get();

        // Get attendance data
        $presensiIds = $presensis->pluck('id')->toArray();
        $presensiData = [];
        
        if (!empty($presensiIds)) {
            $rows = DB::table('pegawai_presensi')
                ->where('pegawai_id', $pegawaiId)
                ->whereIn('presensi_id', $presensiIds)
                ->get();

            foreach ($rows as $row) {
                $presensiData[$row->presensi_id] = [
                    'status' => $row->status,
                    'masuk' => $row->masuk,
                    'keluar' => $row->keluar,
                    'catatan' => $row->catatan,
                ];
            }
        }

        // Format periode
        $periode = Carbon::parse($bulan . '-01')->translatedFormat('l, d F Y') . 
                   ' - ' . 
                   Carbon::parse($bulan . '-01')->endOfMonth()->translatedFormat('l, d F Y');

        // Create new Spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Style headers
        $headerStyle = [
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE8F5E9']],
        ];

        $bodyStyle = [
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];

        $centerStyle = [
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];

        // Title
        $sheet->setCellValue('A1', 'LAPORAN REKAP PRESENSI');
        $sheet->mergeCells('A1:E1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Periode
        $sheet->setCellValue('A2', 'Periode: ' . $periode);
        $sheet->mergeCells('A2:E2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Pegawai
        $sheet->setCellValue('A3', 'Pegawai: ' . $pegawai->nama);
        $sheet->mergeCells('A3:E3');
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Headers
        $headers = ['Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Keterangan'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '5', $header);
            $col++;
        }
        $sheet->getStyle('A5:E5')->applyFromArray($headerStyle);

        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(12);
        $sheet->getColumnDimension('C')->setWidth(12);
        $sheet->getColumnDimension('D')->setWidth(15);
        $sheet->getColumnDimension('E')->setWidth(25);

        // Fill data
        $row = 6;
        foreach ($presensis as $presensi) {
            $data = $presensiData[$presensi->id] ?? null;
            
            // Format tanggal
            $tanggal = $presensi->tanggal instanceof \DateTime 
                ? $presensi->tanggal->format('Y-m-d')
                : (string) $presensi->tanggal;

            // Format waktu
            $jamMasuk = $data['masuk'] ?? null;
            $jamPulang = $data['keluar'] ?? null;
            $status = $data['status'] ?? 'Alpa';
            $keterangan = $data['catatan'] ?? '';

            $sheet->setCellValue('A' . $row, $tanggal);
            $sheet->setCellValue('B' . $row, $jamMasuk ? substr($jamMasuk, 0, 5) : '-');
            $sheet->setCellValue('C' . $row, $jamPulang ? substr($jamPulang, 0, 5) : '-');
            $sheet->setCellValue('D' . $row, $status);
            $sheet->setCellValue('E' . $row, $keterangan);

            $sheet->getStyle('A' . $row)->applyFromArray($centerStyle);
            $sheet->getStyle('B' . $row)->applyFromArray($centerStyle);
            $sheet->getStyle('C' . $row)->applyFromArray($centerStyle);
            $sheet->getStyle('D' . $row)->applyFromArray($centerStyle);
            $sheet->getStyle('E' . $row)->applyFromArray($bodyStyle);

            $row++;
        }

        // Generate filename
        $filename = 'laporan_presensi_' . $bulan . '_' . date('Y-m-d_H-i-s') . '.xlsx';

        // Create response
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
