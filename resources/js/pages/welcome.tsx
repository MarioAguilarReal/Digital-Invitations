import { login, register } from '@/routes';
import { dashboard } from '@/routes/admin';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="relative flex w-full max-w-[335px] flex-col-reverse gap-10 lg:max-w-5xl lg:flex-row lg:items-center lg:gap-14">
                        <div className="absolute -left-8 top-10 -z-10 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,_#F8D7B4_0,_#FDFDFC_70%)] opacity-90 blur-[1px] lg:-left-16 lg:h-44 lg:w-44" />
                        <div className="absolute -right-6 bottom-6 -z-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_#BEE7FF_0,_#FDFDFC_70%)] opacity-80 blur-[1px] lg:-right-12 lg:h-56 lg:w-56" />
                        <section className="flex flex-1 flex-col gap-6">
                            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#4b4b44]">
                                <span className="h-px w-10 bg-[#cbbfb0]" />
                                Made for modern invites
                            </div>
                            <h1
                                className="text-3xl font-semibold leading-tight text-[#1b1b18] lg:text-5xl"
                                style={{ fontFamily: 'Fraunces, serif' }}
                            >
                                Create invitations your guests actually open.
                            </h1>
                            <p className="max-w-xl text-base text-[#4b4b44] lg:text-lg">
                                Digital Invitations by M. Aguilar helps you design beautiful invites,
                                collect RSVPs, and keep your guest list organized in one calm
                                workspace. Publish fast, manage replies, and send updates without
                                stress.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center justify-center rounded-full bg-[#1b1b18] px-6 py-3 text-sm font-semibold text-[#FDFDFC] transition hover:-translate-y-0.5 hover:bg-[#2a2a27]"
                                    >
                                        Go to dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-full bg-[#1b1b18] px-6 py-3 text-sm font-semibold text-[#FDFDFC] transition hover:-translate-y-0.5 hover:bg-[#2a2a27]"
                                        >
                                            Start your first invite
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center justify-center rounded-full border border-[#d2c6b8] px-6 py-3 text-sm font-semibold text-[#1b1b18] transition hover:-translate-y-0.5 hover:border-[#b7aa9b]"
                                        >
                                            I already have an account
                                        </Link>
                                    </>
                                )}
                            </div>
                            <div className="grid gap-4 text-sm text-[#4b4b44] sm:grid-cols-3">
                                <div className="rounded-2xl border border-[#ede4d7] bg-white/60 p-4 shadow-[0_10px_20px_-20px_rgba(0,0,0,0.25)]">
                                    <div className="text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                        Design
                                    </div>
                                    <div className="mt-2 font-medium text-[#1b1b18]">
                                        Elegant templates and layouts.
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-[#ede4d7] bg-white/60 p-4 shadow-[0_10px_20px_-20px_rgba(0,0,0,0.25)]">
                                    <div className="text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                        RSVP
                                    </div>
                                    <div className="mt-2 font-medium text-[#1b1b18]">
                                        Capture guest details instantly.
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-[#ede4d7] bg-white/60 p-4 shadow-[0_10px_20px_-20px_rgba(0,0,0,0.25)]">
                                    <div className="text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                        Manage
                                    </div>
                                    <div className="mt-2 font-medium text-[#1b1b18]">
                                        Track status in one place.
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="flex flex-1 items-center justify-center">
                            <div className="relative w-full max-w-sm rounded-[32px] border border-[#e9e0d4] bg-white/80 p-6 shadow-[0_30px_60px_-45px_rgba(17,17,17,0.6)]">
                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                    <span>Launch ready</span>
                                    <span className="rounded-full bg-[#f5efe6] px-3 py-1 text-[10px] font-semibold text-[#6b5f53]">
                                        Live preview
                                    </span>
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl bg-[#f8f3ec] p-5">
                                        <div className="text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                            Event
                                        </div>
                                        <div className="mt-2 text-lg font-semibold text-[#1b1b18]">
                                            Adriana & Miguel
                                        </div>
                                        <div className="mt-1 text-sm text-[#5a5148]">
                                            Garden celebration • July 12
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-[#efe6da] p-4">
                                            <div className="text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                                RSVPs
                                            </div>
                                            <div className="mt-2 text-2xl font-semibold text-[#1b1b18]">
                                                128
                                            </div>
                                            <div className="text-xs text-[#5a5148]">
                                                Confirmed guests
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-[#efe6da] p-4">
                                            <div className="text-xs uppercase tracking-[0.2em] text-[#8a7c6f]">
                                                Messages
                                            </div>
                                            <div className="mt-2 text-2xl font-semibold text-[#1b1b18]">
                                                6
                                            </div>
                                            <div className="text-xs text-[#5a5148]">
                                                Updates sent
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 rounded-2xl bg-[#1b1b18] px-5 py-4 text-sm text-[#FDFDFC]">
                                    Publish your invite in minutes and share it anywhere.
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
