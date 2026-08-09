import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from './ui/button'

const pillars = [
  { title: 'Build', icon: Lightbulb, text: 'Transform ideas into businesses, careers, and income-generating opportunities.' },
  { title: 'Connect', icon: Network, text: 'Create trusted relationships with women, mentors, partners, investors, and customers.' },
  { title: 'Grow', icon: Rocket, text: 'Use practical tools, accountability, and resources to scale sustainably.' },
  { title: 'Thrive', icon: Wallet, text: 'Build financially independent women who create opportunities for others.' },
]

const audience = ['Entrepreneurs', 'Freelancers', 'Small business owners', 'Creatives', 'Professionals', 'Digital creators', 'Startup founders', 'Skilled artisans', 'Women with side hustles']

const programs = [
  ['BIG Builders Community', 'A high-trust community where women collaborate, share opportunities, and grow together.'],
  ['BIG Builders Academy', 'Practical learning experiences focused on building sustainable businesses and careers.'],
  ['BIG Marketplace', 'An upcoming platform connecting customers with businesses owned by BIG members.'],
  ['BIG Builders Summit', 'Events bringing together entrepreneurs, innovators, investors, and ecosystem partners.'],
  ['BIG Builder Circles', 'Small accountability groups where members solve challenges together and celebrate progress.'],
]

const values = ['Build before you boast.', 'Progress over perfection.', 'Collaboration over competition.', 'Integrity in everything.', 'Continuous learning.', 'Lift as you rise.']

export function AboutView({ setCurrentView }: { setCurrentView: (view: string, options?: { authMode?: 'login' | 'register' }) => void }) {
  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-primary px-6 py-24 text-primary-foreground sm:py-32 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-7 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-accent"><Sparkles data-icon="inline-start" /> Be Independent Gal</p>
            <h1 className="max-w-4xl text-balance font-heading text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-8xl">Building women.<br /><span className="text-accent">Building the future.</span></h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-primary-foreground/75 sm:text-xl">BIG is a Kenyan community and business ecosystem for women who are building businesses, brands, careers, products, services, and communities.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setCurrentView('auth', { authMode: 'register' })} className="rounded-full bg-accent px-7 py-6 font-semibold text-accent-foreground hover:bg-accent/90">Join the movement <ArrowRight data-icon="inline-end" /></Button>
              <Button onClick={() => setCurrentView('programs')} variant="outline" className="rounded-full border-primary-foreground/30 bg-transparent px-7 py-6 text-primary-foreground hover:bg-primary-foreground/10">Explore programs</Button>
            </div>
          </div>
          <div className="border-l border-primary-foreground/25 pl-7 lg:mb-3">
            <p className="font-heading text-3xl font-medium leading-tight sm:text-4xl">We are not a motivational movement.</p>
            <p className="mt-5 text-xl font-semibold text-accent">We are a movement of builders.</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">About BIG</p><h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Independence is built — not given.</h2></div>
          <div className="flex flex-col gap-6 text-lg leading-8 text-muted-foreground"><p>Africa&apos;s future will not be shaped by those waiting for opportunities. It will be built by women who create them.</p><p>BIG exists to equip, connect, and accelerate women through practical opportunities, meaningful relationships, resources, and accountability.</p><p>Our success is measured by the progress our members make — not by the number of workshops we conduct.</p></div>
        </div>
      </section>

      <section className="bg-muted/40 px-6 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-6 md:grid-cols-2"><article className="rounded-3xl bg-card p-8 shadow-sm sm:p-10"><Target className="text-secondary" /><p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Our vision</p><h2 className="mt-3 font-heading text-3xl font-semibold">To build Africa&apos;s largest community of women builders creating sustainable businesses, wealth, and lasting impact.</h2></article><article className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-sm sm:p-10"><BadgeCheck className="text-accent" /><p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-accent">Our mission</p><h2 className="mt-3 font-heading text-3xl font-semibold">Equip, connect, and accelerate women building businesses and careers.</h2><p className="mt-5 leading-7 text-primary-foreground/70">We create opportunities that increase income, strengthen businesses, and build long-term economic independence.</p></article></div></div></section>

      <section className="px-6 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">The BIG framework</p><h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Practical progress, together.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Most organizations teach. BIG helps women build through accountability, collaboration, business growth, opportunity sharing, market access, and strategic partnerships.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{pillars.map(({ title, icon: Icon, text }) => <article key={title} className="border-t-4 border-secondary bg-card p-7 shadow-sm"><Icon className="text-secondary" /><h3 className="mt-8 font-heading text-2xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{text}</p></article>)}</div></div></section>

      <section className="bg-primary px-6 py-20 text-primary-foreground lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Who we serve</p><h2 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl">Women who are actively building something.</h2></div><div className="flex flex-wrap content-start gap-3">{audience.map((item) => <span key={item} className="rounded-full border border-primary-foreground/25 px-4 py-3 text-sm text-primary-foreground/85">{item}</span>)}</div></div></section>

      <section className="px-6 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Our programs</p><h2 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl">Where building becomes visible.</h2></div><BriefcaseBusiness className="hidden text-secondary sm:block" size={42} /></div><div className="mt-12 grid gap-x-10 gap-y-0 md:grid-cols-2">{programs.map(([title, text], index) => <article key={title} className="flex gap-5 border-t py-7"><span className="font-mono text-sm text-secondary">0{index + 1}</span><div><h3 className="font-heading text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-muted-foreground">{text}</p></div></article>)}</div></div></section>

      <section className="bg-muted/40 px-6 py-20 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Our values</p><h2 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl">The way we build matters.</h2></div><ul className="grid gap-4 sm:grid-cols-2">{values.map((value) => <li key={value} className="flex items-start gap-3 border-b pb-4 text-lg"><HeartHandshake className="mt-1 shrink-0 text-secondary" />{value}</li>)}</ul></div></section>

      <section className="px-6 py-24 lg:px-10"><div className="mx-auto flex max-w-5xl flex-col items-center text-center"><ShieldCheck className="text-secondary" size={42} /><h2 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-6xl">Too many talented women remain unseen.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Not because they lack ability, but because they lack access to opportunities, trusted networks, strategic support, and the right environment to grow. BIG exists to close that gap.</p><Button onClick={() => setCurrentView('auth', { authMode: 'register' })} className="mt-9 rounded-full bg-secondary px-8 py-6 text-secondary-foreground hover:bg-secondary/90">Start building with BIG <ArrowRight data-icon="inline-end" /></Button></div></section>
    </main>
  )
}
