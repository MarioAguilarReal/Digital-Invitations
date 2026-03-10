import { Guest } from "../Models/Guest.type";
import { Invitation } from "../Models/Invitation.type";
import { useState } from "react";
import { GuestCard } from "./GuestCard";

export function GuestTable ({
  guests,
  invitation,
  setEditingGuest,
  setDeletingGuest
}: {
  guests: Guest[],
  invitation: Invitation,
  setEditingGuest: (guest: Guest | null) => void,
  setDeletingGuest: (guest: Guest | null) => void
}) {
  const [page, setPage] = useState(1);
  const guestsPerPage = 5;
  const [searchedGuest, setSearchedGuest] = useState<string>('');
  const filteredGuests = guests.filter(g => g.display_name.toLowerCase().includes(searchedGuest.toLowerCase()));
  const paginatedGuests = filteredGuests.slice((page - 1) * guestsPerPage, page * guestsPerPage);
  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);


  const handleSearchGuest = (query: string) => {
    setSearchedGuest(query);
    setPage(1); // Reset to first page on new search
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };


  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
                    <div className='flex items-center justify-between'>
                      <h2 className="text-sm font-semibold">Guests</h2>
                        <span className='px-2 py-1'>Total: {guests.length} guest{guests.length !== 1 ? 's' : ''}</span>
                        </div>
                    <div className='flex items-center justify-between sm:flex-row flex-col gap-2 mt-2'>
                      <input
                          type="text"
                          placeholder="Search guests..."
                          className="h-9 w-[60%] max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          onChange={(e) => handleSearchGuest(e.target.value)}
                      />

                      <div className='pagination text-xs text-muted-foreground flex items-center gap-1'>
                        <button className='px-2 py-1 rounded border border-input' disabled={page === 1} onClick={handlePrevPage} >Previous</button>
                        <span className='px-2 py-1'>Page {page} of {totalPages}</span>
                        <button className='px-2 py-1 rounded border border-input' disabled={page === totalPages} onClick={handleNextPage}>Next</button>
                      </div>
                    </div>
                      <div className="mt-3 border-t border-border" />

                      <div className="mt-3 grid gap-3">
                          {paginatedGuests.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                  No guests yet.
                              </div>
                          ) : (
                              paginatedGuests.map((g: Guest) => (
                                <GuestCard key={g.id} guest={g} invitation={invitation} setEditingGuest={setEditingGuest} setDeletingGuest={setDeletingGuest} />
                              ))
                          )}
                      </div>
                  </div>
  )
}
