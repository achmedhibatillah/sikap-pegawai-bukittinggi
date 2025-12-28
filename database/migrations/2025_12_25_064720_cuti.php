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
        Schema::create('cuti', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('catatan', 255)->nullable();
            $table->boolean('acc')->default(false);
            $table->uuid('bukti')->nullable();
            $table->uuid('pegawai_id');

            $table->foreign('bukti')->references('id')->on('storage')->onDelete('cascade');
            $table->foreign('pegawai_id')->references('id')->on('pegawai')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('cuti');
    }
};
