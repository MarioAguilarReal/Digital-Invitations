<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    public function store(Request $request, Invitation $invitation) {
        $data = $request->validate([
            'type' => ['required', 'in:individual,group'],
            'display_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'seats_reserved' => ['required', 'integer', 'min:1'],
            'member_names' => ['nullable', 'array'],
            'note' => ['nullable', 'string'],
        ]);
        $data['public_token'] = Str::random(40);
        $data['seats_confirmed'] = 0;
        $data['status'] = 'pending';


        $invitation->guests()->create($data);

        return back();
    }
}
