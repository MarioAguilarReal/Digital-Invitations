<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invitation;
use App\Models\Template;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;

class InvitationController extends Controller
{
    public function index() {
        $invitations = Invitation::with('template')
            ->latest()
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'slug' => $i->slug,
                'template_name' => $i->template->name,
                'event_name' => $i->event_name,
                'host_name' => $i->host_name,
                'event_date' => optional($i->event_date)->format('Y-m-d'),
                'status' => $i->status,
                'created_at' => $i->created_at->toDateTimeString(),
            ]);

        return Inertia::render('admin/invitations/index', [
            'invitations' => $invitations,
        ]);
    }

    public function create() {
        return Inertia::render('admin/invitations/create', [
            'templates' => Template::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'key', 'name', 'description', 'preview_image_url']),
        ]);
    }

    public function edit(Invitation $invitation) {
        return Inertia::render('admin/invitations/edit', [
            'invitation' => [
                'id' => $invitation->id,
                'slug' => $invitation->slug,
                'template_id' => $invitation->template_id,
                'event_name' => $invitation->event_name,
                'host_name' => $invitation->host_name,
                'host_color' => $invitation->host_color,
                'venue_name' => $invitation->venue_name,
                'venue_address' => $invitation->venue_address,
                'event_date' => $invitation->event_date?->format('Y-m-d'),
                'event_time' => is_string($invitation->event_time)
                    ? substr($invitation->event_time, 0, 5)
                    : (string) $invitation->event_time,
                'capacity' => $invitation->capacity,
                'rsvp_deadline_at' => $invitation->rsvp_deadline_at?->format('Y-m-d'),
                'gift_type' => $invitation->gift_type,
                'dress_code' => $invitation->dress_code,
                'complementary_text_1' => $invitation->complementary_text_1,
                'complementary_text_2' => $invitation->complementary_text_2,
                'complementary_text_3' => $invitation->complementary_text_3,
                'settings' => $invitation->settings ?? [],
            ],
            'templates' => Template::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'key', 'name', 'description', 'preview_image_url']),
        ]);
    }

    public function store(Request $request) {

        $data = $request->validate([
            'template_id' => ['required', 'exists:templates,id'],
            'event_name' => ['required', 'string', 'max:255'],
            'host_name' => ['required', 'string', 'max:255'],
            'host_color' => ['nullable', 'string', 'max:20'],
            'venue_name' => ['required', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'event_time' => ['required'],
            'capacity' => ['required', 'integer', 'min:0'],
            'rsvp_deadline_at' => ['nullable', 'date'],
            'gift_type' => ['nullable', 'string', 'max:255'],
            'dress_code'=> ['nullable', 'string', 'max:255'],
            'complementary_text_1' => ['nullable', 'string', 'max:255'],
            'complementary_text_2' => ['nullable', 'string', 'max:255'],
            'complementary_text_3' => ['nullable', 'string', 'max:255'],
            'settings' => ['nullable'],
            'hero_image' => ['nullable', 'image', 'max:5120'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['image', 'max:5120'],
        ]);

        $settings = $this->normalizeSettings($request->input('settings'));
        if ($settings === null) {
            return back()->withErrors([
                'settings' => 'JSON inválido en settings.',
            ]);
        }

        // friendly slug
        $baseSlug = Str::slug($data['event_name'] . '-' . $data['host_name']);
        $slug = $baseSlug;
        $i = 2;
        while (Invitation::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i++;
        }

        $invitation = Invitation::create([
            ...$data,
            'slug' => $slug,
            'status' => 'draft',
            'settings' => $settings,
        ]);

        $settingsChanged = false;
        $heroFile = $request->file('hero_image');
        if ($heroFile) {
            $settings['hero_image'] = $this->storeInvitationImage($heroFile, $slug, 'hero');
            $settingsChanged = true;
        }

        $galleryFiles = $request->file('gallery_images', []);
        if (is_array($galleryFiles) && count($galleryFiles)) {
            $galleryUrls = [];
            foreach ($galleryFiles as $file) {
                $galleryUrls[] = $this->storeInvitationImage($file, $slug, 'gallery');
            }
            $settings['gallery_images'] = array_merge($settings['gallery_images'] ?? [], $galleryUrls);
            $settingsChanged = true;
        }

        if ($settingsChanged) {
            $invitation->settings = $settings;
            $invitation->save();
        }

        return redirect()->route('admin.invitations.show', ['invitation' => $invitation->id]);
    }

    private function normalizeSettings($raw): ?array
    {
        if (is_array($raw)) {
            return $raw;
        }

        if (is_string($raw) && strlen(trim($raw)) > 0) {
            $decoded = json_decode($raw, true);
            return is_array($decoded) ? $decoded : null;
        }

        return [];
    }

    private function storeInvitationImage($file, string $slug, string $category): string
    {
        $directory = "invitations/{$slug}/{$category}";
        $original = $file->getClientOriginalName();
        $ext = pathinfo($original, PATHINFO_EXTENSION);
        $base = pathinfo($original, PATHINFO_FILENAME);
        $safeBase = Str::slug($base);
        $filename = $safeBase ? "{$safeBase}.{$ext}" : Str::random(12).".{$ext}";

        $disk = Storage::disk('public');
        $counter = 1;
        while ($disk->exists("{$directory}/{$filename}")) {
            $filename = ($safeBase ? "{$safeBase}-{$counter}" : Str::random(12)).".{$ext}";
            $counter++;
        }

        $path = $file->storePubliclyAs($directory, $filename, 'public');
        return asset('storage/'.$path);
    }

    public function update(Request $request, Invitation $invitation) {
        $data = $request->validate([
            'template_id' => ['required', 'exists:templates,id'],
            'event_name' => ['required', 'string', 'max:255'],
            'host_name' => ['required', 'string', 'max:255'],
            'host_color' => ['nullable', 'string', 'max:20'],
            'venue_name' => ['required', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'event_time' => ['required'],
            'capacity' => ['required', 'integer', 'min:0'],
            'rsvp_deadline_at' => ['nullable', 'date'],
            'gift_type' => ['nullable', 'string', 'max:255'],
            'dress_code'=> ['nullable', 'string', 'max:255'],
            'complementary_text_1' => ['nullable', 'string', 'max:255'],
            'complementary_text_2' => ['nullable', 'string', 'max:255'],
            'complementary_text_3' => ['nullable', 'string', 'max:255'],
            'settings' => ['nullable', 'array'],
        ]);

        $invitation->update($data);

        return redirect()->route('admin.invitations.show', ['invitation' => $invitation->id]);
    }

    public function show(Invitation $invitation) {
        if($invitation->status === 'draft' && !auth()->check()) {
            abort(404);
        }

        $invitation->load(['template', 'guests' => fn ($q) => $q->latest()]);

        $reservedSeats = $invitation->guests->sum('seats_reserved');
        $confirmedSeats = $invitation->guests->sum('seats_confirmed');

        $stats = [
            'capacity' => $invitation->capacity,
            'reservedSeats' => $reservedSeats,
            'confirmedSeats' => $confirmedSeats,
            'remainingSeats' => max(0, $invitation->capacity - $reservedSeats),
            'pendingGuests' => $invitation->guests->where('status', 'pending')->count(),
            'confirmedGuests' => $invitation->guests->where('status', 'confirmed')->count(),
            'declinedGuests' => $invitation->guests->where('status', 'declined')->count(),
        ];

        return Inertia::render('admin/invitations/show', [
            'invitation' => [
                'id' => $invitation->id,
                'slug' => $invitation->slug,
                'template_key' => $invitation->template->key,
                'event_name' => $invitation->event_name,
                'host_name' => $invitation->host_name,
                'host_color' => $invitation->host_color,
                'venue_name' => $invitation->venue_name,
                'event_date' => $invitation->event_date?->format("Y-m-d"),
                'event_time' => $invitation->event_time,
                'capacity' => $invitation->capacity,
                'rscp_deadline_at' => $invitation->rsvp_deadline_at?->toIso8601String(),
            ],
            'guests' => $invitation->guests->map(fn ($g) => [
                'id' => $g->id,
                'type' => $g->type,
                'allow_plus_one' => $g->allow_plus_one,
                'display_name' => $g->display_name,
                'contact_phone' => $g->contact_phone,
                'contact_email' => $g->contact_email,
                'seats_reserved' => $g->seats_reserved,
                'seats_confirmed' => $g->seats_confirmed,
                'status' => $g->status,
                'member_names' => $g->member_names,
                'public_token' => $g->public_token,
                'rsvp_url' => URL::temporarySignedRoute(
                    'public.rsvp.show',
                    $invitation->rsvp_deadline_at ?? now()->addDays(30),
                    ['guest' => $g->id]
                )
            ]),
            'stats' => $stats,
        ]);
    }

    public function publish(Invitation $invitation) {
        $invitation->status = 'published';
        $invitation->published_at = now();
        $invitation->save();

        return back();
    }

    public function unpublish(Invitation $invitation) {
        $invitation->status = 'draft';
        $invitation->published_at = null;
        $invitation->save();

        return back();
    }

    public function destroy(Invitation $invitation)
    {
        $invitation->delete();

        return redirect()->route('admin.invitations.index');
    }
}
