import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

type InvitationRow = {
  id: number;
  event_name: string;
  slug: string;
  template_name: string;
  event_date: string | null;
  status: string;
  created_at: string;
};

export default function InvitationsIndex({ invitations }: { invitations: InvitationRow[] }) {
  const [deleteInvitation, setDeleteInvitation] = useState<InvitationRow | null>(null);

  const handleChangeStatus = (invitation: InvitationRow) => {
    if (invitation.status === 'published') {
      router.post(`/admin/invitations/${invitation.id}/unpublish`);
    } else {
      router.post(`/admin/invitations/${invitation.id}/publish`);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Invitations", href: '/admin/invitations' }]}>
      <Head title="Invitaciones" />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Invitations</h1>
            <p className="text-sm text-muted-foreground">Manage your event invitations.</p>
          </div>

          <Link
            href="/admin/invitations/create"
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Create invitation
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{inv.event_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.template_name}</td>
                  <td className="px-4 py-3">{inv.event_date ?? '—'}</td>
                  <td className="px-4 py-3">{inv.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link className="underline" href={`/admin/invitations/${inv.id}`}>
                        Open
                      </Link>
                      <Link className="underline" href={`/admin/invitations/${inv.id}/edit`}>
                        Edit
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(inv)}
                      >
                        {inv.status === 'published' ? 'Move to Drafts' : 'Publish Invitation'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteInvitation(inv)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {invitations.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                    No invitations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={!!deleteInvitation} onOpenChange={(open) => !open && setDeleteInvitation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar invitacion</DialogTitle>
            <DialogDescription>
              Esta accion eliminara la invitacion y todos los invitados asociados. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInvitation(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteInvitation) return;
                router.delete(`/admin/invitations/${deleteInvitation.id}`, {
                  onSuccess: () => setDeleteInvitation(null),
                });
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
