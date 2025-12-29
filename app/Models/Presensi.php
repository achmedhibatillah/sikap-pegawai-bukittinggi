<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use App\Models\Pegawai;

class Presensi extends Model
{
    protected $table = 'presensi';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    // migration does not add timestamps
    public $timestamps = false;

    protected $fillable = [
        'id',
        'catatan',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
    ];

    protected $casts = [
        'id' => 'string',
        'tanggal' => 'date',
        'jam_mulai' => 'string',
        'jam_selesai' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Pegawai that belong to this presensi (pivot table pegawai_presensi)
     */
    public function pegawais(): BelongsToMany
    {
        return $this->belongsToMany(Pegawai::class, 'pegawai_presensi', 'presensi_id', 'pegawai_id')
            ->withPivot(['status', 'masuk', 'keluar', 'catatan']);
    }
}
