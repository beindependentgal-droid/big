export const BIG_VOICE = {
  name: 'Be Independent Gal',
  shortName: 'BIG',
  audience: 'women who are building',
  positioning: 'A Kenyan community and business ecosystem for women building businesses, careers, products, services, and communities.',
  promise: 'Practical opportunities, trusted relationships, resources, and accountability for measurable progress.',
  words: {
    member: 'builder',
    members: 'builders',
    network: 'community',
    opportunities: 'opportunities',
    progress: 'practical progress',
    support: 'accountability and support',
    connect: 'connect',
    grow: 'grow',
    action: 'Start building',
    join: 'Join BIG',
  },
} as const

export const BIG_COPY = {
  communityTitle: 'Build with women who are building.',
  communityDescription: 'Share what you are working on, find useful opportunities, and move forward with people who understand the work.',
  emptyCommunity: 'No conversations yet. Start with a useful question, an opportunity, or a lesson from what you are building.',
  emptyOpportunities: 'No opportunities here yet. Check back soon or share one that could help another builder.',
  emptyResources: 'No resources here yet. We are adding practical tools to help you build with more clarity.',
  emptyGoals: 'No goals yet. Choose one clear next step and start building momentum.',
  upcoming: 'Coming soon',
} as const

export type BigVoiceKey = keyof typeof BIG_VOICE.words
