<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\InvitationController;
use App\Http\Controllers\Admin\GuestController;
use App\Http\Controllers\PublicInvitationController;
use App\Http\Controllers\PublicRsvpController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// PUBLIC (no auth)

Route::get('/i/{slug}', [PublicInvitationController::class, 'show'])->name('public.invitation.show');

Route::get('/rsvp/confirmation', [PublicRsvpController::class, 'confirmation'])
    ->name('public.rsvp.confirmation');

Route::get('/rsvp/{guest}', [PublicRsvpController::class, 'show'])
    ->middleware('signed')
    ->whereNumber('guest')
    ->name('public.rsvp.show');

Route::post('/rsvp/{guest}', [PublicRsvpController::class, 'store'])
    ->middleware('signed')
    ->whereNumber('guest')
    ->name('public.rsvp.store');

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('admin/dashboard'))->name('admin.dashboard');

    Route::get('/invitations', [InvitationController::class, 'index'])->name('admin.invitations.index');
    Route::get('/invitations/create', [InvitationController::class, 'create'])->name('admin.invitations.create');
    Route::post('/invitations', [InvitationController::class, 'store'])->name('admin.invitations.store');

    Route::get('/invitations/{invitation}', [InvitationController::class, 'show'])->name('admin.invitations.show');
    Route::get('/invitations/{invitation}/edit', [InvitationController::class, 'edit'])->name('admin.invitations.edit');
    Route::put('/invitations/{invitation}', [InvitationController::class, 'update'])->name('admin.invitations.update');
    Route::post('/invitations/{invitation}/publish', [InvitationController::class, 'publish'])->name('admin.invitations.publish');
    Route::post('/invitations/{invitation}/unpublish', [InvitationController::class, 'unpublish'])->name('admin.invitations.unpublish');


    // Guests in the dashboard
    Route::post('/invitations/{invitation}/guests', [GuestController::class, 'store'])->name('admin.guests.store');
    Route::put('/guests/{guest}', [GuestController::class, 'update'])->name('admin.guests.update');
});

require __DIR__.'/settings.php';
