import Link from "next/link";
import Image from "next/image";
import InstallAppButton from "@/app/components/InstallAppButton";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1a5c3a]">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7ccb8a]/45 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-[45%] bg-[#4caf6a]/35 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.2em]">
          <Link href="/" className="flex items-center gap-2 text-[#1a5c3a]">
            <Image
              src="/icon.png"
              alt="MessageBuddy"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full"
              priority
            />
            <span className="text-sm tracking-[0.25em]">MessageBuddy</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-8 text-[#2d8f55]">
            <Link href="/" className="transition hover:text-[#1a5c3a]">
              Home
            </Link>
            <a href="#about" className="transition hover:text-[#1a5c3a]">
              About us
            </a>
            <a href="#contact" className="transition hover:text-[#1a5c3a]">
              Contact us
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <InstallAppButton variant="header" />
            <button
              type="button"
              className="text-[#2d8f55] transition hover:text-[#1a5c3a]"
              aria-label="Search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              href="/login"
              className="rounded-full border border-[#2d7a4f] px-5 py-2 text-[11px] font-semibold text-[#1a5c3a] transition hover:bg-[#e8f5eb]"
            >
              Sign in
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <h1 className="text-5xl font-bold uppercase tracking-[0.12em] text-[#14532d] md:text-6xl">
            Welcome
          </h1>
          <p className="mt-8 max-w-lg text-sm leading-relaxed text-[#2d8f55] md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <Link
            href="/register"
            className="mt-12 rounded-full bg-[#14532d] px-12 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#1a6b3a]"
          >
            Learn more
          </Link>
        </main>

        <section
          id="about"
          className="mx-auto mt-8 max-w-xl scroll-mt-24 text-center text-sm leading-relaxed text-[#2d8f55]"
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#14532d]">
            About us
          </h2>
          <p>
            MessageBuddy helps teams stay on top of conversations with clear,
            thoughtful messaging—built for focus and calm, green-room energy.
          </p>
        </section>

        <section
          id="contact"
          className="mx-auto mt-10 max-w-xl scroll-mt-24 text-center text-sm text-[#2d8f55]"
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#14532d]">
            Contact us
          </h2>
          <p>hello@messagebuddy.app</p>
        </section>
      </div>
    </div>
  );
}
