<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invitation;
use Inertia\Inertia;

class PublicInvitationController extends Controller
{
    public function show(string $slug) {
        $invitation = Invitation::with('template')
            ->where('slug', $slug)
            ->firstOrFail();

        if ($invitation->status !== 'published' && !auth()->check()) {
            abort(404);
        }

        return Inertia::render('public/invitation/show', [
            'invitation' => [
                'id' => $invitation->id,
                'slug' => $invitation->slug,
                'template_key' => $invitation->template->key,
                'event_name' => $invitation->event_name,
                'host_name' => $invitation->host_name,
                'venue_name'=> $invitation->venue_name,
                'venue_address' => $invitation->venue_address,
                'event_date' => $invitation->event_date?->format('Y-m-d'),
                'event_time' => is_string($invitation->event_time)
                    ? $invitation->event_time
                    : (string) $invitation->event_time,
                'gift_type' => $invitation->gift_type,
                'dress_code' => $invitation->dress_code,
                'complementary_text_1' => $invitation->complementary_text_1,
                'complementary_text_2' => $invitation->complementary_text_2,
                'complementary_text_3' => $invitation->complementary_text_3,
                'settings' => $invitation->settings ?? [],
            ],
        ]);
    }
}
