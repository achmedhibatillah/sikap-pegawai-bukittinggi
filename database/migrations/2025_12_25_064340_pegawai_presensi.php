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
        Schema::create('pegawai_presensi', function (Blueprint $table) {
            $table->uuid('pegawai_id');
            $table->uuid('presensi_id');
            $table->enum('status', ['Hadir', 'Hadir (Telat)', 'Izin', 'Cuti', 'Alpa']);
            $table->time('masuk')->nullable();
            $table->time('keluar')->nullable();
            $table->string('catatan', 255)->nullable();

            $table->foreign('pegawai_id')->references('id')->on('pegawai')->onDelete('cascade');
            $table->foreign('presensi_id')->references('id')->on('presensi')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('pegawai_presensi');
    }
};
