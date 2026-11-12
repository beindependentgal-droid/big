import { ArrowUpRight, Sparkles } from 'lucide-react';

export function ComingSoonPage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#17102b] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute -bottom-48 -left-32 size-[34rem] rounded-full bg-orange-500/15 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-7 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="Be Independent Gal home" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="" className="size-12 rounded-full object-cover" />
            <span className="text-sm font-bold tracking-[0.22em]">BE INDEPENDENT GAL</span>
          </a>
          <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-wide text-white/70 sm:flex">
            <span className="size-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,.8)]" />
            A new chapter is taking shape
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-20 lg:py-24">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
            <Sparkles aria-hidden="true" className="size-4" />
            The BIG platform is being rebuilt
          </div>
          <h1 className="!font-sans max-w-5xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] !text-white sm:text-6xl md:text-7xl lg:text-[6.5rem]">
            We&apos;re building<br />
            <span className="bg-gradient-to-r from-pink-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">what comes next.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
            BIG is coming back with a new platform made for women who are building businesses, careers, and opportunities of their own.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/45">
            We&apos;re bringing the community, connections, and practical support that help builders move forward—all into one new home.
          </p>

          <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 text-sm font-extrabold">BIG</span>
              <div>
                <p className="text-sm font-semibold">A fresh start for builders</p>
                <p className="mt-1 text-xs text-white/45">Launching soon</p>
              </div>
            </div>
            <a href="mailto:hello@beindependentgal.com" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300">
              Get in touch <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>Be Independent Gal (BIG)</p>
          <p>Building women. Building businesses. Building the future.</p>
        </footer>
      </div>
    </main>
  );
}
