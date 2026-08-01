import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { Button } from './ui/button'

export function ContactView() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Let's Start a Conversation"
          description="Whether you want to join BIG, partner with us, volunteer, or simply ask a question—we're excited to hear from you."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Mail, title: 'Email', value: 'hello@beindependentgal.com', href: 'mailto:hello@beindependentgal.com' },
            { icon: Phone, title: 'Phone & WhatsApp', value: '+254 725 156 897', href: 'tel:+254725156897' },
            { icon: MapPin, title: 'Location', value: 'Based in Nairobi, Kenya' },
            { icon: Clock, title: 'Office hours', value: 'Mon–Fri 9:00–17:00 EAT' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.title} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
                  <p className="mt-1 text-base font-medium text-slate-900">{c.value}</p>
                  {c.href && <a href={c.href} className="mt-2 text-sm text-primary font-semibold">Contact</a>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
