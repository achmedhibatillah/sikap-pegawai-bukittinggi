<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function page_login()
    {
        return Inertia::render('auth/login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password'  => 'required'
        ]);
    
        $user = Akun::where('email', $request->email)->first();
    
        if (!$user) {
            return response()->json(['status' => 'error']);
        }
    
        if (Hash::check($request->password, $user->password)) {
            session([
                'sss' => [
                    'usr' => $user->id,
                    'acs' => $user->role
                ]
            ]);
    
            if ($request->boolean('login_keepsession')) {
                config(['session.lifetime' => 60 * 24 * 30]);
            } else {
                config(['session.lifetime' => config('session.lifetime')]);
            }
    
            return response()->json(['status' => 'success']);
        }
    
        return response()->json(['status' => 'error']);
    }    
}
