import {
  BookOpen,
  Users,
  MessageCircle,
  Leaf,
  Handshake,
  Heart,
  Target,
  Sparkles,
} from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { Button } from './ui/button'

const bigLooks = [
  {
    title: 'BIG Academy',
    description: 'Learn practical skills that prepare you for life and work.',
    icon: BookOpen,
  },
  {
    title: 'Circles',
    description: 'Small communities where meaningful friendships and accountability grow.',
    icon: Users,
  },
  {
    title: 'Girl Talk Friday',
    description: 'Honest conversations that inspire, educate, and empower.',
    icon: MessageCircle,
  },
  {
    title: 'Retreats',
    description: 'Reconnect with yourself while building lifelong friendships.',
    icon: Leaf,
  },
  {
    title: 'Networking',
    description: 'Meet women who open doors to new opportunities.',
    icon: Handshake,
  },
  {
    title: 'Community',
    description: 'A safe space where every woman belongs.',
    icon: Heart,
  },
]

export function AboutView({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  return (
    <div className="bg-white">
      <section className="relative min-h-[78vh] overflow-hidden sm:min-h-[86vh]">
        <img
          src="/images/african_women_community_circle_1784704135356.jpg"
          alt="African women walking together, laughing, and learning as a community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-4 text-center text-white sm:min-h-[86vh] sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/90 backdrop-blur-md sm:text-sm">
            ✨ More Than a Community
          </span>
          <h1 className="mt-8 max-w-3xl text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.03em] text-white sm:text-[2.9rem] lg:text-[3.8rem] xl:text-[4rem]">
            Building Independent Women.
            <span className="mt-4 block text-[#F7D36B]">Building an Unstoppable<br />Generation.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-176 text-[1rem] leading-8 text-white/85 sm:text-[1.05rem]">
            BIG (Be Independent Gal) is a movement empowering women to learn, build meaningful relationships, create opportunities, and thrive together. We believe that every woman deserves access to knowledge, community, and opportunities to build the life she dreams of.
          </p>
          <div className="mt-10 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              className="w-full rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-[0_20px_50px_-18px_rgba(91,33,182,0.35)] transition-all duration-300 hover:-translate-y-1 sm:w-auto"
              onClick={() => setCurrentView('auth')}
            >
              Become a BIG Member
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border border-white/70 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/20 sm:w-auto"
              onClick={() => setCurrentView('feeds')}
            >
              Explore Our Community
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl">
              <img
                src="/images/african_women_tech_collaboration_1784664040784.jpg"
                alt="African women networking and learning together"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Why BIG Exists"
                title="Every woman deserves the opportunity to thrive."
              />
              <p className="mt-6 max-w-[60ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
                Across Africa, millions of women have incredible dreams, talents, and ideas. Yet many never reach their full potential—not because they lack ability, but because they lack access to the right knowledge, meaningful relationships, mentorship, and opportunities.
              </p>
              <p className="mt-6 max-w-[60ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
                BIG was created to change that. We believe no woman should have to build her future alone.
              </p>
              <p className="mt-6 max-w-[60ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
                BIG is a home where women learn practical skills, connect with inspiring people, discover opportunities, support one another, and grow into confident, independent leaders.
              </p>
              <p className="mt-6 max-w-[60ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
                Because when one woman rises, she inspires countless others to rise with her.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The BIG Framework"
            title="Learn. Connect. Earn. Thrive."
            subtitle="Four powerful steps that create confidence, community, opportunity, and lasting impact."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-8 text-center shadow-[0_16px_45px_-24px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-[#f8f5ff] hover:shadow-[0_24px_70px_-30px_rgba(15,23,42,0.16)] md:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-50 text-secondary">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-[#5B21B6]">Learn</p>
              <h3 className="mt-3 text-[1.15rem] font-semibold leading-[1.3] text-slate-900 sm:text-[1.25rem]">Knowledge creates confidence.</h3>
              <p className="mt-4 text-[0.95rem] leading-7 text-slate-600">
                Acquire practical skills, business knowledge, leadership, financial literacy, and personal development that prepare you for real life.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-8 text-center shadow-[0_16px_45px_-24px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-[#f8f5ff] hover:shadow-[0_24px_70px_-30px_rgba(15,23,42,0.16)] md:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#ede9fe] to-[#fdf2f8] text-[#5B21B6]">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-[#5B21B6]">Connect</p>
              <h3 className="mt-3 text-[1.15rem] font-semibold leading-[1.3] text-slate-900 sm:text-[1.25rem]">Relationships create opportunities.</h3>
              <p className="mt-4 text-[0.95rem] leading-7 text-slate-600">
                Meet mentors, friends, professionals, entrepreneurs, and collaborators who help you grow personally and professionally.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-8 text-center shadow-[0_16px_45px_-24px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-[#f8f5ff] hover:shadow-[0_24px_70px_-30px_rgba(15,23,42,0.16)] md:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#ede9fe] to-[#fdf2f8] text-[#5B21B6]">
                <Handshake className="h-6 w-6" />
              </div>
              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-[#5B21B6]">Earn</p>
              <h3 className="mt-3 text-[1.15rem] font-semibold leading-[1.3] text-slate-900 sm:text-[1.25rem]">Opportunities create independence.</h3>
              <p className="mt-4 text-[0.95rem] leading-7 text-slate-600">
                Turn your skills into businesses, careers, partnerships, income, and sustainable opportunities.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-8 text-center shadow-[0_16px_45px_-24px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-[#f8f5ff] hover:shadow-[0_24px_70px_-30px_rgba(15,23,42,0.16)] md:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#ede9fe] to-[#fdf2f8] text-[#5B21B6]">
                <Leaf className="h-6 w-6" />
              </div>
              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-[#5B21B6]">Thrive</p>
              <h3 className="mt-3 text-[1.15rem] font-semibold leading-[1.3] text-slate-900 sm:text-[1.25rem]">Success is better together.</h3>
              <p className="mt-4 text-[0.95rem] leading-7 text-slate-600">
                Build a fulfilling life, create impact in your community, and empower other women to begin their own journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What BIG Looks Like"
            title="The experiences that bring this movement to life."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {bigLooks.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-7 shadow-[0_16px_45px_-22px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-24px_rgba(15,23,42,0.14)] md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50 text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-[1.1rem] font-semibold leading-[1.3] text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
