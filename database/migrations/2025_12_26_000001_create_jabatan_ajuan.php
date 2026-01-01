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
        Schema::create('jabatan_ajuan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pegawai_id');
            $table->uuid('jabatan_lama_id')->nullable();
            $table->uuid('jabatan_baru_id');
            $table->string('alasan', 500)->nullable();
            $table->enum('status', ['pending', 'diterima', 'ditolak'])->default('pending');
            $table->uuid('acc_by')->nullable();
            $table->timestamp('acc_at')->nullable();
            $table->string('catatan_acc', 500)->nullable();
            $table->timestamps();

            $table->foreign('pegawai_id')->references('id')->on('pegawai')->onDelete('cascade');
            $table->foreign('jabatan_lama_id')->references('id')->on('jabatan')->onDelete('set null');
            $table->foreign('jabatan_baru_id')->references('id')->on('jabatan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jabatan_ajuan');
    }
};

