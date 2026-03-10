import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Invitation } from '../Models/Invitation.type';
import { InputMask as MaskedInput } from '@react-input/mask';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type GuestCreateValues = {
    type: 'individual' | 'group';
    display_name: string;
    contact_phone?: string | null;
    contact_email?: string | null;
    seats_reserved?: number;
    allow_plus_one?: boolean;
    member_names: { name: string }[];
    note?: string | null;
};

type Stats = {
    capacity: number;
    reservedSeats: number;
    confirmedSeats: number;
    remainingSeats: number;
    pendingSeats: number;
    confirmedGuests: number;
    declinedGuests: number;
}

export function CreateGuest ({ invitation, stats }: { invitation: Invitation; stats: Stats }) {
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const { register, control, handleSubmit, watch, setValue, reset } =
        useForm<GuestCreateValues>({
            defaultValues: {
                type: 'individual',
                display_name: '',
                contact_phone: '',
                contact_email: '',
                seats_reserved: 1,
                allow_plus_one: false,
                member_names: [],
                note: '',
            },
        });

    const createFields = useFieldArray({ control, name: 'member_names' });

    const type = watch("type");
    const allowPlusOne = watch("allow_plus_one");
    const seatsReserved = watch("seats_reserved");
    const typeField = register("type");

    const { replace: replaceCreateMembers } = createFields;

    useEffect(() => {
        if (type !== "group") {
        replaceCreateMembers([]);
        }
    }, [type, replaceCreateMembers]);

    const remainingSeats = stats.remainingSeats ?? 0;
    const requestedSeats = type === 'group'
    ? Math.max(1, Number(seatsReserved) || 1)
    : (allowPlusOne ? 2 : 1);
    const canCreateGuest = remainingSeats >= requestedSeats;

    const onCreateGuest = handleSubmit((values) => {
        const payload: Record<string, any> = {
            type: values.type,
            display_name: values.display_name,
            contact_phone: values.contact_phone,
            contact_email: values.contact_email,
            note: values.note,
        };

        if (values.type === 'group') {
            payload.seats_reserved = values.seats_reserved ?? 1;
            payload.member_names = (values.member_names ?? [])
                .map((entry) => entry.name)
                .filter(Boolean);
        } else {
            payload.allow_plus_one = !!values.allow_plus_one;
        }

        router.post(`/admin/invitations/${invitation.id}/guests`, payload, {
            onSuccess: () => {
                reset({
                    type: 'individual',
                    display_name: '',
                    contact_phone: '',
                    contact_email: '',
                    seats_reserved: 1,
                    allow_plus_one: false,
                    member_names: [],
                    note: '',
                });
                createFields.replace([]);
            },
        });
    });

    const inputBaseClass = "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

    return (
        <form
            onSubmit={onCreateGuest}
            className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
        >
            <h2 className="text-sm font-semibold">Add guest</h2>

            <div className="mt-3 grid gap-3">
                <select
                    {...typeField}
                    value={type}
                    onChange={(e) => {
                        typeField.onChange(e);
                        const nextType = e.target.value as
                            | 'individual'
                            | 'group';
                        setValue('type', nextType, {
                            shouldValidate: true,
                        });
                        if (nextType === 'group') {
                            setValue(
                                'seats_reserved',
                                Math.max(1, Number(seatsReserved) || 1),
                            );
                            setValue('allow_plus_one', false);
                        } else {
                            setValue('seats_reserved', 1);
                        }
                    }}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                </select>

                <Input
                    placeholder={
                        type === 'group'
                            ? 'Family name (e.g., Familia Perez Juarez)'
                            : 'Guest name'
                    }
                    {...register('display_name')}
                />

                <Controller
                    control={control}
                    name="contact_phone"
                    render={({ field }) => (
                        <MaskedInput
                            mask="(___) ___-____"
                            replacement={{ _: /\d/ }}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            className={inputBaseClass}
                            placeholder="Contact phone (optional)"
                        />
                    )}
                />

                <Input
                    placeholder="Contact email (optional)"
                    type="email"
                    {...register('contact_email')}
                />

                {type === 'group' ? (
                    <Input
                        type="number"
                        min={1}
                        placeholder="Seats reserved"
                        {...register('seats_reserved', {
                            valueAsNumber: true,
                        })}
                    />
                ) : (
                    <div className="grid gap-2">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={!!allowPlusOne}
                                onChange={(e) =>
                                    setValue('allow_plus_one', e.target.checked)
                                }
                            />
                            Permitir acompañante (+1)
                        </label>
                        <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                            Reservados: {allowPlusOne ? 2 : 1} lugares.
                        </div>
                    </div>
                )}

                {type === 'group' ? (
                    <div className="grid gap-2">
                        <div className="text-xs font-medium text-muted-foreground">
                            Nombres de asistentes (opcional)
                        </div>
                        <div className="grid gap-2">
                            {createFields.fields.map((field, idx) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-[1fr_36px] gap-2"
                                >
                                    <Input
                                        placeholder={`Nombre #${idx + 1}`}
                                        {...register(
                                            `member_names.${idx}.name` as const,
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => createFields.remove(idx)}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    createFields.append({ name: '' })
                                }
                            >
                                + Agregar nombre
                            </Button>
                        </div>
                    </div>
                ) : null}

                <textarea
                    placeholder="Note (optional)"
                    rows={3}
                    className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    {...register('note')}
                />

                {errors?.seats_reserved && (
                    <div className="text-xs text-destructive">
                        {errors.seats_reserved}
                    </div>
                )}

                {!canCreateGuest ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
                        Capacidad alcanzada. No hay lugares suficientes para
                        esta invitación.
                    </div>
                ) : null}

                <Button type="submit" disabled={!canCreateGuest}>
                    Create guest
                </Button>
            </div>
        </form>
    );
};
