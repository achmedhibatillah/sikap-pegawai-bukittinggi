<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\StorageFile;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Akun;

class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'agama',
        'pendidikan',
        'foto',
        'ktp',
        'npwp',
        'akun_id'
    ];

    protected $casts = [
        'id' => 'string',
        'tanggal_lahir' => 'date',
        'foto' => 'string',
        'ktp' => 'string',
        'npwp' => 'string',
    ];

    /**
     * Auto-generate UUID when creating a new model
     */
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
     * Relations to storage files
     */
    public function fotoFile(): BelongsTo
    {
        return $this->belongsTo(StorageFile::class, 'foto');
    }

    public function ktpFile(): BelongsTo
    {
        return $this->belongsTo(StorageFile::class, 'ktp');
    }

    public function npwpFile(): BelongsTo
    {
        return $this->belongsTo(StorageFile::class, 'npwp');
    }

    /**
     * Relation to akun
     */
    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'akun_id');
    }
}
