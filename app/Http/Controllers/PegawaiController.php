<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage as StorageFacade;
use App\Models\StorageFile;
use Illuminate\Support\Facades\DB;

class PegawaiController extends Controller
{
    public function detail($id)
    {
    $pegawai = Pegawai::with(['fotoFile', 'ktpFile', 'npwpFile', 'akun'])->find($id);

        if (! $pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                ...$pegawai->toArray(),
                'foto' => $pegawai->fotoFile?->path ?? null,
                'ktp'  => $pegawai->ktpFile?->path ?? null,
                'npwp' => $pegawai->npwpFile?->path ?? null,
                'akun' => $pegawai->akun?->toArray() ?? null,
            ]
        ]);
    }

    /**
     * List pegawai with pagination and optional search by nama
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $q = $request->input('q');

        $query = Pegawai::with(['fotoFile', 'ktpFile', 'npwpFile', 'akun']);

        if ($q) {
            $query->where('nama', 'like', "%{$q}%");
        }

        $paginated = $query->orderBy('nama')->paginate($perPage);

        // transform collection to include file paths and akun summary
        $collection = $paginated->getCollection()->map(function ($p) {
            return [
                'id' => $p->id,
                'nama' => $p->nama,
                'jenis_kelamin' => $p->jenis_kelamin,
                'pendidikan' => $p->pendidikan,
                'foto' => $p->fotoFile?->path ?? null,
                'ktp' => $p->ktpFile?->path ?? null,
                'npwp' => $p->npwpFile?->path ?? null,
                'akun' => $p->akun ? [
                    'id' => $p->akun->id,
                    'email' => $p->akun->email,
                    'telp' => $p->akun->telp,
                ] : null,
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

    public function get_id_by_akun($akun_id)
    {
        $pegawai = Pegawai::where('akun_id', $akun_id)->first();
        $pegawai_id = $pegawai->id;

        return response()->json([
            'pegawai_id' => $pegawai_id
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'telp' => 'required',
            'password' => 'required|min:6',
            'nama' => 'required|string',
            'jenis_kelamin' => 'required|string',
            'pendidikan' => 'required|string',
        ]);

        $result = DB::transaction(function () use ($request) {
            $akun = Akun::create([
                'id' => (string) Str::uuid(),
                'email' => $request->email,
                'telp' => '+62' . $request->telp,
                'password' => Hash::make($request->password),
                'role' => 'pegawai'
            ]);

            $pegawai = Pegawai::create([
                'id' => (string) Str::uuid(),
                'nama' => $request->nama,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'alamat' => $request->alamat,
                'agama' => $request->agama,
                'pendidikan' => $request->pendidikan,
                'akun_id' => $akun->id,
            ]);

            return $pegawai;
        });

        return response()->json([
            'status' => 'success',
            'id' => $result->id
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string',
            'jenis_kelamin' => 'required|string',
            'pendidikan' => 'required|string',
        ]);

        $pegawai = Pegawai::find($id);
        if (! $pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $pegawai->nama = $request->nama;
        $pegawai->jenis_kelamin = $request->jenis_kelamin;
        $pegawai->tempat_lahir = $request->tempat_lahir;
        $pegawai->tanggal_lahir = $request->tanggal_lahir;
        $pegawai->alamat = $request->alamat;
        $pegawai->agama = $request->agama;
        $pegawai->pendidikan = $request->pendidikan;

        $pegawai->save();

        return response()->json(['status' => 'success', 'data' => $pegawai], 200);
    }

    public function uploadPhoto(Request $request, $id)
    {
        $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        $pegawai = Pegawai::find($id);
        if (! $pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $file = $request->file('photo');
        $path = $file->store('image', 'public');

        $oldStorage = null;
        if ($pegawai->foto) {
            $oldStorage = StorageFile::find($pegawai->foto);
        }
        $oldPath = $oldStorage?->path;

        $newStorage = null;

        DB::transaction(function () use ($path, $pegawai, &$newStorage, $oldStorage) {
            $newStorage = StorageFile::create([
                'type' => 'image',
                'path' => $path,
            ]);

            $pegawai->foto = $newStorage->id;
            $pegawai->save();

            if ($oldStorage) {
                StorageFile::where('id', $oldStorage->id)->delete();
            }
        });

        if ($oldPath && StorageFacade::disk('public')->exists($oldPath)) {
            StorageFacade::disk('public')->delete($oldPath);
        }

        $pegawai->refresh();

        return response()->json(['status' => 'success', 'data' => $pegawai, 'storage' => $newStorage], 200);
    }

    public function uploadKtp(Request $request, $id)
    {
        $request->validate([
            'ktp' => 'required|image|max:5120',
        ]);

        $pegawai = Pegawai::find($id);
        if (! $pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $file = $request->file('ktp');
        $path = $file->store('pegawai/ktp', 'public');

        $oldStorage = null;
        if ($pegawai->ktp) {
            $oldStorage = StorageFile::find($pegawai->ktp);
        }
        $oldPath = $oldStorage?->path;

        $newStorage = null;
        DB::transaction(function () use ($path, $pegawai, &$newStorage, $oldStorage) {
            $newStorage = StorageFile::create([
                'type' => 'image',
                'path' => $path,
            ]);

            $pegawai->ktp = $newStorage->id;
            $pegawai->save();

            if ($oldStorage) {
                StorageFile::where('id', $oldStorage->id)->delete();
            }
        });

        if ($oldPath && StorageFacade::disk('public')->exists($oldPath)) {
            StorageFacade::disk('public')->delete($oldPath);
        }

        $pegawai->refresh();
        return response()->json(['status' => 'success', 'data' => $pegawai, 'storage' => $newStorage], 200);
    }

    public function uploadNpwp(Request $request, $id)
    {
        $request->validate([
            'npwp' => 'required|image|max:5120',
        ]);

        $pegawai = Pegawai::find($id);
        if (! $pegawai) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $file = $request->file('npwp');
        $path = $file->store('pegawai/npwp', 'public');

        $oldStorage = null;
        if ($pegawai->npwp) {
            $oldStorage = StorageFile::find($pegawai->npwp);
        }
        $oldPath = $oldStorage?->path;

        $newStorage = null;
        DB::transaction(function () use ($path, $pegawai, &$newStorage, $oldStorage) {
            $newStorage = StorageFile::create([
                'type' => 'image',
                'path' => $path,
            ]);

            $pegawai->npwp = $newStorage->id;
            $pegawai->save();

            if ($oldStorage) {
                StorageFile::where('id', $oldStorage->id)->delete();
            }
        });

        if ($oldPath && StorageFacade::disk('public')->exists($oldPath)) {
            StorageFacade::disk('public')->delete($oldPath);
        }

        $pegawai->refresh();
        return response()->json(['status' => 'success', 'data' => $pegawai, 'storage' => $newStorage], 200);
    }
}
