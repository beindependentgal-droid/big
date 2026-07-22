import React from 'react';
import { cn } from '../lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-[44rem]',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'flex items-center gap-3',
            align === 'center' ? 'justify-center' : 'justify-start',
          )}
        >
          <span className="h-px w-8 bg-slate-200" />
          <span className="font-heading text-[11px] font-medium uppercase tracking-[0.28em] text-[#5B21B6]">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-slate-200" />
        </div>
      )}
      <h2 className="mt-4 text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[2.3rem] lg:text-[2.7rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-5 max-w-[42rem] text-[0.95rem] leading-7 text-slate-600 sm:text-base">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="mx-auto mt-5 max-w-[42rem] text-[0.95rem] leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
