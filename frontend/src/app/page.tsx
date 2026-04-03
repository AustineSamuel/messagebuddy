export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-between px-6 py-10 md:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
              MB
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              MessageBuddy
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a
              href="/login"
              className="rounded-full px-4 py-1.5 text-zinc-200 transition hover:bg-zinc-800/70"
            >
              Log in
            </a>
            <a
              href="/register"
              className="rounded-full bg-zinc-50 px-4 py-1.5 text-xs font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
            >
              Get started
            </a>
          </nav>
        </header>

        <section className="mt-12 grid gap-10 md:mt-20 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Smart messaging made simple
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Your AI‑powered buddy for every conversation.
              </h1>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-zinc-300 sm:text-base">
                Draft replies, organize threads, and keep every message on track.
                MessageBuddy helps you stay thoughtful, fast, and always on top of
                your conversations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300"
              >
                Create a free account
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 px-5 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800/80"
              >
                I already have an account
              </a>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                End‑to‑end encrypted chats
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Works on any device
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -left-10 -top-10 rounded-3xl bg-emerald-500/10 blur-3xl" />
            <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur">
              <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live preview
                </span>
                <span>Inbox · 3 active threads</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="rounded-2xl bg-zinc-900/80 p-3">
                  <p className="text-zinc-200">
                    Hey, can you help me phrase a friendly follow‑up to this client?
                  </p>
                </div>
                <div className="ml-auto max-w-[80%] rounded-2xl bg-emerald-500/90 p-3 text-emerald-950">
                  <p>
                    Absolutely. Here&apos;s a warm, concise follow‑up that keeps momentum
                    without feeling pushy.
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-900/80 p-3">
                  <p className="text-zinc-200">
                    Perfect. Can you also suggest a short subject line?
                  </p>
                </div>
                <div className="ml-auto max-w-[70%] rounded-2xl bg-emerald-500/90 p-3 text-emerald-950">
                  <p>How about &ldquo;Quick follow‑up on next steps&rdquo;?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 flex items-center justify-between border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} MessageBuddy</span>
          <span className="hidden gap-4 md:inline-flex">
            <a href="/login" className="hover:text-zinc-300">
              Log in
            </a>
            <a href="/register" className="hover:text-zinc-300">
              Register
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}
