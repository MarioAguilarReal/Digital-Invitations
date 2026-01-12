import { templateRegistry } from "@/templates/registry";

type Props = {
  invitation: {
    template_key: string;
    [k: string]: any;
  };
  guest: null | {
    guest_id: number;
    display_name: string;
    type: "individual" | "group";
    seats_reserved: number;
    status: string;
    seats_confirmed: number;
  };
  rsvpUrl: string | null;
};

export default function PublicInvitationShow({ invitation, guest, rsvpUrl }: Props) {
  const Template = templateRegistry[invitation.template_key];

  if (!Template) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Template not found</h1>
        <p style={{ opacity: 0.7 }}>
          Missing template key: <code>{invitation.template_key}</code>
        </p>
      </div>
    );
  }

  return (
    <>
      <Template invitation={invitation} />;
      {rsvpUrl && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center px-4">
          <a
            href={rsvpUrl}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg"
          >
            Confirmar asistencia
          </a>
        </div>
      )}
    </>
  )
}
