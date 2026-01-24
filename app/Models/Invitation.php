<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = [
        'template_id',
        'event_name',
        'host_name',
        'host_color',
        'venue_name',
        'venue_address',
        'event_date',
        'event_time',
        'capacity',
        'rsvp_deadline_at',
        'gift_type',
        'dress_code',
        'complementary_text_1',
        'complementary_text_2',
        'complementary_text_3',
        'settings',
        'slug',
        'status',
    ];

    protected $casts = [
        'event_date' => 'date',
        'event_time' => 'datetime:H:i',
        'rsvp_deadline_at' => 'datetime',
        'published_at' => 'datetime',
        'settings' => 'array',
    ];

    public function template(){
        return $this->belongsTo(\App\Models\Template::class);
    }

    public function guests() {
        return $this->hasMany(\App\Models\Guest::class);
    }
}
