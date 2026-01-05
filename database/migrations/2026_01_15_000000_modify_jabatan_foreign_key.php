<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Mengubah tabel jabatan untuk berelasi M-1 ke jabatan_tingkatan
     */
    public function up(): void
    {
        // Tambah kolom foreign key baru (nullable dulu, unsignedBigInteger untuk cocok dengan id auto-increment)
        Schema::table('jabatan', function (Blueprint $table) {
            $table->unsignedBigInteger('jabatan_tingkatan_id')
                ->after('id')
                ->nullable();
        });

        // Tambah foreign key constraint
        Schema::table('jabatan', function (Blueprint $table) {
            $table->foreign('jabatan_tingkatan_id')
                ->references('id')
                ->on('jabatan_tingkatan')
                ->onDelete('restrict');
        });

        // Update data yang ada dengan random jabatan_tingkatan_id
        // Ini diperlukan agar tidak ada NULL values
        DB::statement("
            UPDATE jabatan j
            SET j.jabatan_tingkatan_id = (
                SELECT jt.id FROM jabatan_tingkatan jt
                WHERE jt.tingkat = j.tingkatan
                LIMIT 1
            )
            WHERE j.tingkatan IS NOT NULL
        ");

        // Drop foreign key dulu sebelum drop column
        Schema::table('jabatan', function (Blueprint $table) {
            $table->dropForeign(['jabatan_tingkatan_id']);
        });

        // Drop kolom tingkatan lama
        Schema::table('jabatan', function (Blueprint $table) {
            $table->dropColumn('tingkatan');
        });

        // Tambah kembali foreign key
        Schema::table('jabatan', function (Blueprint $table) {
            $table->foreign('jabatan_tingkatan_id')
                ->references('id')
                ->on('jabatan_tingkatan')
                ->onDelete('restrict');
        });

        // Update NOT NULL constraint
        Schema::table('jabatan', function (Blueprint $table) {
            $table->unsignedBigInteger('jabatan_tingkatan_id')
                ->nullable(false)
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus foreign key dan kolom
        Schema::table('jabatan', function (Blueprint $table) {
            $table->dropForeign(['jabatan_tingkatan_id']);
            $table->dropColumn('jabatan_tingkatan_id');
        });

        // Tambah kembali kolom tingkatan lama
        Schema::table('jabatan', function (Blueprint $table) {
            $table->integer('tingkatan')->after('id');
        });
    }
};

