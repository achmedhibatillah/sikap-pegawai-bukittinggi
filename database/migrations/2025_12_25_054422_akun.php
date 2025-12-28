<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        Schema::create('akun', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255)->unique();
            $table->string('telp', 14)->unique();
            $table->string('password', 255);
            $table->enum('role', ['admin', 'kepala', 'pegawai']);
            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('akun')->insert([
            'id' => Str::uuid(),
            'email' => 'a',
            'password' => Hash::make('a'),
            'telp' => '+6281388324884',
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('akun');
    }
};
