<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        Schema::create('pegawai', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama', 255)->nullable();
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->default('Laki-laki');
            $table->string('tempat_lahir', 20)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('alamat', 255)->nullable();
            $table->string('agama', 20)->nullable();
            $table->enum('pendidikan', ['SD', 'SMP', 'SMA/SMK', 'S1', 'S2', 'S3', 'Lainnya']);
            $table->uuid('foto')->nullable();
            $table->uuid('ktp')->nullable();
            $table->uuid('npwp')->nullable();
            $table->uuid('akun_id');
            

            $table->foreign('foto')->references('id')->on('storage')->onDelete('cascade');
            $table->foreign('ktp')->references('id')->on('storage')->onDelete('cascade');
            $table->foreign('npwp')->references('id')->on('storage')->onDelete('cascade');
            $table->foreign('akun_id')->references('id')->on('akun')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('pegawai');
    }
};
