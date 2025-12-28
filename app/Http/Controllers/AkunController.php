<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AkunController extends Controller
{
    public function detail($id)
    {
        $akun = Akun::find($id);
        if (! $akun) {
            return response()->json(['status' => 'not-found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $akun], 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email',
            'telp' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        $akun = Akun::find($id);
        if (! $akun) {
            return response()->json(['status' => 'not-found'], 404);
        }

        $akun->email = $request->email;
        $akun->telp = $request->telp;
        if ($request->filled('password')) {
            $akun->password = Hash::make($request->password);
        }

        $akun->save();

        return response()->json(['status' => 'success', 'data' => $akun], 200);
    }
}
