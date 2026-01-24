<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    public function store(Request $request, Invitation $invitation)
    {
        $data = $request->validate([
            'type' => ['required', 'in:individual,group'],
            'display_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'allow_plus_one' => ['nullable', 'boolean'],
            'member_names' => ['nullable', 'array'],
            'member_names.*' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
        ]);

        if ($data['type'] === 'group') {
            $data['seats_reserved'] = $request->validate([
                'seats_reserved' => ['required', 'integer', 'min:1'],
            ])['seats_reserved'];
            $data['allow_plus_one'] = false;
        } else {
            $data['allow_plus_one'] = (bool) ($data['allow_plus_one'] ?? false);
            $data['seats_reserved'] = $data['allow_plus_one'] ? 2 : 1;
            $data['member_names'] = null;
        }

        $reservedSeats = $invitation->guests()->sum('seats_reserved');
        $remainingSeats = max(0, $invitation->capacity - $reservedSeats);
        if ($data['seats_reserved'] > $remainingSeats) {
            return back()->withErrors([
                'seats_reserved' => 'Capacidad alcanzada. No hay lugares suficientes.',
            ]);
        }

        $data['public_token'] = Str::random(40);
        $data['seats_confirmed'] = 0;
        $data['status'] = 'pending';

        $invitation->guests()->create($data);

        return back();
    }

    public function update(Request $request, Guest $guest)
    {
        $data = $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'allow_plus_one' => ['nullable', 'boolean'],
            'member_names' => ['nullable', 'array'],
            'member_names.*' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
        ]);

        if ($guest->type === 'group') {
            $data['seats_reserved'] = $request->validate([
                'seats_reserved' => ['required', 'integer', 'min:1'],
            ])['seats_reserved'];
            $data['allow_plus_one'] = false;

            $invitation = $guest->invitation;
            $reservedSeats = $invitation->guests()->sum('seats_reserved') - $guest->seats_reserved;
            $remainingSeats = max(0, $invitation->capacity - $reservedSeats);
            if ($data['seats_reserved'] > $remainingSeats) {
                return back()->withErrors([
                    'seats_reserved' => 'Capacidad alcanzada. No hay lugares suficientes.',
                ]);
            }
        } else {
            $data['allow_plus_one'] = (bool) ($data['allow_plus_one'] ?? false);
            $data['seats_reserved'] = $data['allow_plus_one'] ? 2 : 1;
            $data['member_names'] = null;
        }

        $guest->update($data);

        return back();
    }

    public function destroy(Guest $guest)
    {
        $guest->delete();

        return back();
    }
}
