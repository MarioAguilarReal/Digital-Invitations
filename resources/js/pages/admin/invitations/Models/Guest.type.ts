type Guest = {
  id: number;
  type: "individual" | "group";
  display_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  seats_reserved: number;
  seats_confirmed: number;
  status: "pending" | "confirmed" | "declined";
  viewed: boolean;
  rsvp_url: string;
  public_token: string;
  allow_plus_one?: boolean;
  member_names?: string[] | null;
};

export type { Guest };
