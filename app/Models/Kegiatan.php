<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'jadwal';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'nama',
        'deskripsi',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'is_fullday',
        'warna'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_mulai' => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
        'is_fullday' => 'boolean'
    ];

    /**
     * Get the color display for the kegiatan
     */
    public function getWarnaDisplayAttribute(): string
    {
        return match ($this->warna) {
            'merah' => 'bg-red-500',
            'kuning' => 'bg-yellow-500',
            'hijau' => 'bg-green-500',
            'biru' => 'bg-blue-500',
            default => 'bg-gray-500'
        };
    }

    /**
     * Get the border color for the kegiatan
     */
    public function getWarnaBorderAttribute(): string
    {
        return match ($this->warna) {
            'merah' => 'border-red-500 text-red-700 bg-red-50',
            'kuning' => 'border-yellow-500 text-yellow-700 bg-yellow-50',
            'hijau' => 'border-green-500 text-green-700 bg-green-50',
            'biru' => 'border-blue-500 text-blue-700 bg-blue-50',
            default => 'border-gray-500 text-gray-700 bg-gray-50'
        };
    }

    /**
     * Get the text color for the kegiatan
     */
    public function getWarnaTextAttribute(): string
    {
        return match ($this->warna) {
            'merah' => 'text-red-700',
            'kuning' => 'text-yellow-700',
            'hijau' => 'text-green-700',
            'biru' => 'text-blue-700',
            default => 'text-gray-700'
        };
    }

    /**
     * Get the time display string
     */
    public function getTimeDisplayAttribute(): string
    {
        if ($this->is_fullday) {
            return 'Seharian';
        }
        
        $mulai = $this->jam_mulai ? \Carbon\Carbon::parse($this->jam_mulai)->format('H:i') : '-';
        $selesai = $this->jam_selesai ? \Carbon\Carbon::parse($this->jam_selesai)->format('H:i') : '-';
        
        return "{$mulai} - {$selesai}";
    }
}


