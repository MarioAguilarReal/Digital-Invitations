import { templateRegistry } from "@/templates/registry";

type Props = {
  invitation: {
    template_key: string;
    [k: string]: any;
  };
};

export default function PublicInvitationShow({ invitation }: Props) {
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

  return <Template invitation={invitation} />;
}
