<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Akun extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'akun';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'email',
        'telp',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'deleted_at',
    ];

    protected $casts = [
        'id' => 'string',
    ];

    /**
     * Auto-generate UUID ketika create
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
}
