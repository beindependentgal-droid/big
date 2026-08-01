import { Crown, Star, ShieldCheck, Calendar, Users } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

export function BIGClubView() {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Crown className="mx-auto h-16 w-16 text-yellow-500 mb-6" />
          <SectionHeading
            title="The BIG Club"
            description="An exclusive network of visionary women leaders, entrepreneurs, and change-makers."
          />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: 'Exclusive Access', desc: 'Private events and retreats designed for high-impact leaders.' },
            { icon: Users, title: 'Curated Networking', desc: 'Connect with established industry titans and influential peers.' },
            { icon: Star, title: 'Mentorship Circle', desc: 'Direct access to premier mentorship and growth resources.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl hover:border-yellow-500/50 transition">
              <item.icon className="h-10 w-10 text-yellow-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join the Inner Circle</h2>
          <p className="text-yellow-100 mb-8 max-w-2xl mx-auto">Membership to the BIG Club is by invitation or application. Join the vanguard of women shaping the future.</p>
          <button className="bg-white text-yellow-900 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition">
            Apply for Membership
          </button>
        </div>
      </div>
    </div>
  )
}
