<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{

    protected $fillable = [
        'invitation_id',
        'type',
        'allow_plus_one',
        'display_name',
        'contact_name',
        'contact_phone',
        'contact_email',
        'seats_reserved',
        'seats_confirmed',
        'status',
        'member_names',
        'note',
        'public_token',
    ];

    protected $casts = [
        'member_names' => 'array',
    ];

    public function invitation()
    {
        return $this->belongsTo(\App\Models\Invitation::class);
    }
}
