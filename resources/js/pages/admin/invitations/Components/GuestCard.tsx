import { Button } from "@/components/ui/button"
import { Guest } from "../Models/Guest.type"
import { Invitation } from "../Models/Invitation.type";
import { copy, formatDateEsMX, formatTimeEsMX } from "../helpers";
import { toWhatsAppUrl } from "@/lib/whatsapp";
import { Pencil, Trash } from "lucide-react";

type GuestCardProps = {
    guest: Guest,
    invitation: Invitation,
    setEditingGuest: (guest: Guest | null) => void,
    setDeletingGuest: (guest: Guest | null) => void
}

export function GuestCard({ guest, invitation, setEditingGuest, setDeletingGuest }: GuestCardProps){
  function buildWhatsAppMessage(guest: Guest) {
    const date = formatDateEsMX(invitation.event_date) || '';
    const time = invitation.event_time ? `a las ${formatTimeEsMX(invitation.event_time.slice(-16))}` : '';
    const venue = invitation.venue_name ? ` en ${invitation.venue_name}` : '';

    const invitationUrl = `${location.origin}/i/${invitation.slug}?g=${guest.id}&s=${guest.public_token}`;

    if (guest.type == "group") {
      return `Hola ${guest.display_name}, están invitad@s a *${invitation.event_name}* 🎉\n` +
        `Tienen ${guest.seats_reserved} lugares reservados.\n` +
        `📍 ${venue}\n` +
        `🗓️ ${date} ⏰ ${time}\n\n` +
        `Confirmen aquí: ${invitationUrl}`;
    }

    return `Hola ${guest.display_name}, estás invitad@ a *${invitation.event_name}* 🎉\n` +
    `📍 ${venue}\n` +
    `🗓️ ${date} ⏰ ${time}\n\n` +
    `Confirma aquí: ${invitationUrl}`;
  }

  const sendMessage = (guest: Guest) => {
    const message = buildWhatsAppMessage(guest);
    const whatsURL = toWhatsAppUrl(message, guest.contact_phone);
    window.open(whatsURL, '_blank');
  }

  return (
    <div
        key={guest.id}
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground sm:flex-col sm:items-center sm:justify-between min-w-full"
    >
        <div
          className="flex flex-col gap-1 align-middle w-full"
        >
            <div className="font-semibold">
                {guest.display_name}{' '}
                <span className="text-xs font-medium text-muted-foreground">
                    ({guest.type}
                    {guest.type === 'individual' ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                            {guest.allow_plus_one
                                ? 'con +1'
                                : 'sin +1'}
                        </span>
                    ) : null}
                    )
                </span>
            </div>
            <div
                className="text-[14px] text-muted-foreground flex gap-4"
            >
                <p>
                  Reserveds: {guest.seats_reserved}
                </p>
                <p
                  style={{
                    color: `${guest.seats_reserved === guest.seats_confirmed ? 'green' : guest.status === 'declined' ? 'red' : guest.seats_reserved > guest.seats_confirmed ? 'orange' : 'inherit'}`,
                  }}
                >
                  Confirmed: {guest.seats_confirmed}
                </p>
                <p
                  style={{
                    color: `${guest.status === 'confirmed' ? 'green' : guest.status === 'pending'? 'orange' : 'red' }`,
                  }}
                >
                  Status: {guest.status}
                </p>
                <p
                  style={{
                    color: `${guest.viewed ? 'green' : 'red'}`,
                  }}
                >
                  Viewed: {guest.viewed ? 'Yes' : 'No'}
                </p>
            </div>
            {Array.isArray(guest.member_names) &&
            guest.member_names.length ? (
                <div className="mt-1 text-xs text-muted-foreground">
                    Nombres:{' '}
                    {guest.member_names
                        .filter(Boolean)
                        .join(', ')}
                </div>
            ) : null}
        </div>
        <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            <Button
                variant="outline"
                size="sm"
                onClick={() => copy(guest.rsvp_url)}
                className="w-full sm:w-auto"
            >
                Copy RSVP Link
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage(guest)}
                className="w-full sm:w-auto"
            >
                Send WhatsApp
            </Button>
            <Button
                variant="outline"
                onClick={() => copy(buildWhatsAppMessage(guest))}
                className="w-full sm:w-auto"
            >
                Copy Message
            </Button>
            <Button
                variant="outline"
                size="default"
                onClick={() => setEditingGuest(guest)}
                className="w-full sm:w-auto"
            >
                <Pencil />
            </Button>
            <Button
                variant="outline"
                size="default"
                onClick={() => setDeletingGuest(guest)}
                className="w-full sm:w-auto"
            >
                <Trash />
            </Button>
        </div>
    </div>
  )
}
