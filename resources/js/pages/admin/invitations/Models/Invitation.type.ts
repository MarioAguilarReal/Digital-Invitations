type Invitation = {
  id: number;
  slug: string;
  event_name: string;
  host_name: string;
  venue_name: string;
  event_date: string;
  event_time: any;
  capacity: number;
  rsvp_deadline_at?: string | null;
};

export type { Invitation };
