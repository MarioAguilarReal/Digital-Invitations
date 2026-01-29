<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class PublicRsvpController extends Controller
{
    public function show(Request $request, Guest $guest) {
        $guest->load('invitation.template');

        $invitation = $guest->invitation;
        $expiresAt = $invitation->rsvp_deadline_at ?? now()->addDays(30);
        $storeUrl = URL::temporarySignedRoute(
            'public.rsvp.store',
            $expiresAt,
            ['guest' => $guest->id]
        );

        $deadline = $invitation->rsvp_deadline_at
            ? $invitation->rsvp_deadline_at->copy()->endOfDay()
            : null;

        $isClosed = $deadline
            ? now()->greaterThan($deadline)
            : false;

        return Inertia::render('public/rsvp/show', [
            'invitation' => [
                'event_name' => $invitation->event_name,
                'host_name' => $invitation->host_name,
                'event_date' => optional($invitation->event_date)->format('Y-m-d'),
                'event_time' => optional($invitation->event_time)->format('H:i'),
                'venue_name' => $invitation->venue_name,
                'venue_address' => $invitation->venue_address,
                'rsvp_deadline_at' => optional($invitation->rsvp_deadline_at)->toIso8601String(),
            ],
            'guest' => [
                'id' => $guest -> id,
                'type' => $guest -> type,
                'display_name' => $guest -> display_name,
                'seats_reserved' => $guest -> seats_reserved,
                'seats_confirmed' => $guest -> seats_confirmed,
                'status' => $guest -> status,
                'allow_plus_one' => $guest->allow_plus_one,
                'member_names' => $guest->member_names,
            ],
            'isClosed' => $isClosed,
            'storeUrl' => $storeUrl,
        ]);
    }

    public function store(Request $request, Guest $guest) {
        $guest->load('invitation');

        $invitation = $guest->invitation;

        // Cierre por deadline (aunque el link sea valido)
        if ($invitation->rsvp_deadline_at) {
            $deadline = $invitation->rsvp_deadline_at->copy()->endOfDay();
            if (now()->greaterThan($deadline)) {
            abort(403, 'El periodo de confirmación ha finalizado.');
            }
        }

        if($guest->type === 'individual') {
            $data = $request->validate([
                'attending' => ['required', 'boolean'],
                'plus_one' => ['nullable', 'boolean'],
                'plus_one_name' => ['nullable', 'string', 'max:255'],
            ]);

            if($data['attending']) {
                $plusOne = $guest->allow_plus_one ? ($data['plus_one'] ?? false) : false;
                if ($plusOne && empty($data['plus_one_name'])) {
                    return back()->withErrors([
                        'plus_one_name' => 'Ingresa el nombre del acompañante.',
                    ]);
                }

                $guest->status = 'confirmed';
                $guest->seats_confirmed = $plusOne ? 2 : 1;
                $guest->member_names = $plusOne ? [$data['plus_one_name']] : null;
            } else {
                $guest->status = 'declined';
                $guest->seats_confirmed = 0;
                $guest->member_names = null;
            }
        } else {
            $data = $request->validate([
                'seats_confirmed' => ['required', 'integer', 'min:0'],
            ]);

            $seats = min($guest->seats_reserved, $data['seats_confirmed']);

            $guest->seats_confirmed = $seats;

            if($seats <= 0) {
                $guest->status = 'declined';
            } else {
                $guest->status = 'confirmed';
            }
        }
        $guest->save();

        return redirect()->route('public.rsvp.confirmation', ['invitation_url' => $invitation->slug]);
    }

    public function confirmation(Request $request, string $invitation_url) {
        return Inertia::render('public/rsvp/confirmation/show', [
            'invitation_url' => $invitation_url,
        ]);
    }
}
