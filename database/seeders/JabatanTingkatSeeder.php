<?php

namespace Database\Seeders;

use App\Models\JabatanTingkat;
use Illuminate\Database\Seeder;

class JabatanTingkatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tingkatans = [
            [
                'tingkat' => 1,
                'nama' => 'Eselon I',
                'deskripsi' => 'Jabatan Pimpinan Tinggi Utama - Menteri/Pimpinan Lembaga',
                'aktif' => true,
            ],
            [
                'tingkat' => 2,
                'nama' => 'Eselon II',
                'deskripsi' => 'Jabatan Pimpinan Tinggi Madya - Direktur Jenderal/Sekjen',
                'aktif' => true,
            ],
            [
                'tingkat' => 3,
                'nama' => 'Eselon III',
                'deskripsi' => 'Jabatan Administrator - Kepala Biro/Direktur',
                'aktif' => true,
            ],
            [
                'tingkat' => 4,
                'nama' => 'Eselon IV',
                'deskripsi' => 'Jabatan Pengawas - Kepala Bidang/Seksi',
                'aktif' => true,
            ],
            [
                'tingkat' => 5,
                'nama' => 'Staf',
                'deskripsi' => 'Jabatan Fungsional dan pelaksana',
                'aktif' => true,
            ],
        ];

        foreach ($tingkatans as $tingkat) {
            JabatanTingkat::create($tingkat);
        }
    }
}

