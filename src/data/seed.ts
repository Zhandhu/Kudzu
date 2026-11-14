import type { Announcement, Connection, Conversation, Group, Interaction, InteractionType, KEvent, Message, Nudge, Prefs, Request, User } from '../types'
import { CITIES, DAY, HOUR, coordsFor, startOfDay } from '../lib/util'

/* ---------------- demo personas (the signed-in user is always id "me") ---------------- */

export const STUDENT_PERSONA: User = {
  id: 'me',
  schoolIds: ['gt'],
  role: 'student',
  gradYear: 2028,
  name: 'Riley Chen',
  major: 'Industrial Engineering',
  title: '3rd-year student',
  company: undefined,
  industry: 'Consulting',
  city: 'Atlanta',
  coords: CITIES.Atlanta,
  asks: ['industry', 'decision', 'interview', 'recruiting'],
  offers: ['campus', 'path'],
  prompts: [
    { promptId: 'p6', answer: 'Consulting or product. I like both and I have one summer left to test it.' },
    { promptId: 'p9', answer: 'You were an IE who ended up somewhere unexpected.' },
    { promptId: 'p3', answer: 'Iced latte, year-round, including January.' },
  ],
  capacity: 4,
  used: 1,
  groupIds: ['grp-fg', 'grp-startup'],
  verified: 'verified',
  degrees: [{ schoolId: 'gt', level: 'Bachelor’s', major: 'Industrial Engineering', gradYear: 2028 }],
  interests: ['Climbing', 'Hackathons', 'Co-op program'],
}

export const ALUM_PERSONA: User = {
  id: 'me',
  schoolIds: ['gt'],
  role: 'alum',
  gradYear: 2015,
  name: 'Morgan Ellis',
  major: 'Industrial Engineering',
  title: 'Senior Product Manager',
  company: 'Delta Air Lines',
  industry: 'Tech',
  city: 'Atlanta',
  coords: CITIES.Atlanta,
  asks: ['industry'],
  offers: ['industry', 'decision', 'path', 'interview', 'resume'],
  prompts: [
    { promptId: 'p5', answer: 'Getting from operations into product, and what to say in the interview.' },
    { promptId: 'p2', answer: 'Ask for the coffee chat. Almost everyone says yes.' },
    { promptId: 'p10', answer: 'Planning trips around airports I have not flown through yet.' },
  ],
  capacity: 3,
  used: 1,
  groupIds: ['grp-fg', 'grp-startup'],
  verified: 'verified',
  degrees: [{ schoolId: 'gt', level: 'Bachelor’s', major: 'Industrial Engineering', gradYear: 2015 }],
  path: [{ title: 'Operations Analyst', company: 'UPS' }, { title: 'Product Manager', company: 'Delta Air Lines' }],
  careerChange: true,
  interests: ['Running', 'Volunteering', 'Study abroad'],
}

export const DEFAULT_PREFS: Prefs = {
  industries: ['Consulting', 'Tech'],
  cities: ['Atlanta', 'New York'],
  levels: [],
}

/** A request to these people is always accepted, so the demo is repeatable. */
export const ALWAYS_ACCEPT = ['g1']

/** The first time you propose coffee to these people they answer with other times, so that case can be shown. */
export const SUGGESTS_OTHER_TIMES = ['g2']

/* ---------------- groups ---------------- */

export const SEED_GROUPS: Group[] = [
  { id: 'grp-nyc', schoolId: 'gt', name: 'GT Alums in NYC', description: 'Monthly meetups, apartment leads and job referrals for alumni in the city.', color: '#477d42' },
  { id: 'grp-wie', schoolId: 'gt', name: 'Women in Engineering', description: 'Mentorship circles and events for women across every engineering field.', color: '#8b5e3c' },
  { id: 'grp-fg', schoolId: 'gt', name: 'First-Gen Professionals', description: 'For first-generation students and alumni working out the unwritten rules together.', color: '#c9a227' },
  { id: 'grp-fin', schoolId: 'gt', name: 'Finance & Consulting', description: 'Recruiting prep, case partners and people who have been through it.', color: '#2b502a' },
  { id: 'grp-24', schoolId: 'gt', name: 'Class of 2024', description: 'Keeping the class together after graduation.', color: '#679a60' },
  { id: 'grp-startup', schoolId: 'gt', name: 'Founders & Builders', description: 'People starting companies, joining early teams, or thinking about it.', color: '#744a2e' },
  { id: 'egrp-health', schoolId: 'emory', name: 'Emory in Healthcare', description: 'Clinicians, researchers and public health people.', color: '#477d42' },
  { id: 'egrp-biz', schoolId: 'emory', name: 'Business Alumni Network', description: 'Finance, consulting and strategy careers.', color: '#8b5e3c' },
  { id: 'ugrp-biz', schoolId: 'uga', name: 'Finance & Accounting Alumni', description: 'Banking, accounting and corporate finance.', color: '#2b502a' },
  { id: 'ugrp-atl', schoolId: 'uga', name: 'UGA Alums in Atlanta', description: 'Meetups and watch parties around the city.', color: '#c9a227' },
  { id: 'sgrp-tech', schoolId: 'gsu', name: 'Georgia State in Tech', description: 'Product, engineering and IT careers.', color: '#477d42' },
  { id: 'sgrp-biz', schoolId: 'gsu', name: 'Downtown Professionals', description: 'Alumni working in and around downtown Atlanta.', color: '#744a2e' },
]

/* ---------------- events ---------------- */

export function seedEvents(now: number): KEvent[] {
  const day0 = startOfDay(now)
  const at = (d: number, h: number, m = 0) => day0 + d * DAY + h * HOUR + m * 60_000
  const ev = (
    id: string, schoolId: string, title: string, hostId: string, type: KEvent['type'], virtual: boolean, start: number,
    place: string, city: string, capacity: number, description: string, attendeeIds: string[],
    extra: Partial<KEvent> = {},
  ): KEvent => ({
    id, schoolId, title, hostId, type, virtual, start, place, city, capacity, description, attendeeIds,
    coords: virtual ? undefined : coordsFor(city, id),
    visibility: 'public',
    industries: [],
    ...extra,
  })
  return [
    ev('ev1', 'gt', 'Midtown Morning Coffee Meetup', 'g5', 'Networking', false, at(2, 8, 30), 'Vine & Bean Café, Midtown', 'Atlanta', 24,
      'A low-key hour of coffee before work. Students and alumni both welcome. Come with one question you want answered and leave with two new people to talk to.',
      ['g5', 'g24', 'g7', 'g15', 'g8', 'g14', 'g27', 'g11'], { myRsvp: 'going' }),
    ev('ev2', 'gt', 'Breaking into Consulting: Alumni Panel', 'g31', 'Industry', true, at(4, 19), 'Video call', 'Virtual', 150,
      'Four alumni at three firms talk through recruiting timelines, case prep and what the first two years are like. Half the session is Q&A.',
      ['g31', 'g5', 'g19', 'g22', 'g14', 'g9', 'g25'], { industries: ['Consulting'] }),
    ev('ev3', 'gt', 'First-Gen Resume Night', 'g15', 'Networking', true, at(3, 18), 'Video call', 'Virtual', 40,
      'Bring a draft. Alumni volunteers give 15-minute one-on-one reviews in breakout rooms.',
      ['g15', 'g7', 'g11', 'g23', 'g25', 'g30'], { groupId: 'grp-fg', visibility: 'community' }),
    ev('ev4', 'gt', 'NYC Alumni Happy Hour', 'g21', 'Social', false, at(6, 18, 30), 'The Rooftop at Madison & 28th', 'New York', 60,
      'First round is covered. New to the city? This is the easiest way to meet the group.',
      ['g21', 'g4', 'g31'], { groupId: 'grp-nyc' }),
    ev('ev5', 'gt', 'Bay Area Tech Mixer', 'g28', 'Industry', false, at(9, 18), 'SoMa Commons, 2nd Street', 'San Francisco', 80,
      'Engineers, PMs and designers from across the Bay. Short lightning talks, then open networking.',
      ['g28', 'g3', 'g20'], { industries: ['Tech', 'Design', 'Startups'] }),
    ev('ev6', 'gt', 'Women in Engineering Brunch', 'g24', 'Social', false, at(11, 11), 'Garden Room, Inman Park', 'Atlanta', 30,
      'A relaxed brunch for students and alumnae. Seating is mixed by class year on purpose.',
      ['g24', 'g1', 'g8', 'g14', 'g18', 'g26', 'g32'], { groupId: 'grp-wie', visibility: 'community' }),
    ev('ev7', 'gt', 'Seattle Trail Day', 'g17', 'Social', false, at(5, 9), 'Rattlesnake Ledge trailhead', 'Seattle', 20,
      'An easy four-mile hike and lunch afterwards. Carpools leave from Capitol Hill.',
      ['g17', 'g2']),
    ev('ev8', 'gt', 'DC Policy & Tech Coffee', 'g10', 'Networking', false, at(13, 8), 'Compass Coffee, Dupont area', 'Washington, DC', 20,
      'For alumni working where technology and government meet. Informal, no agenda.',
      ['g10', 'g30', 'g22'], { industries: ['Government'] }),
    ev('ev9', 'gt', 'Aerospace Careers Roundtable', 'g11', 'Industry', false, at(16, 17, 30), 'Midtown Innovation Hall', 'Atlanta', 45,
      'Small-table conversations with alumni in flight test, propulsion and manufacturing. Rotate tables every 20 minutes.',
      ['g11', 'g23', 'g29', 'g14'], { industries: ['Aerospace'] }),
    ev('ev10', 'gt', 'Founders Demo Night', 'g27', 'Industry', false, at(20, 18, 30), 'The Foundry on West Peachtree', 'Atlanta', 100,
      'Six alumni-founded startups, five minutes each. Stay for the hiring table afterwards.',
      ['g27', 'g12', 'g15', 'g1', 'g8'], { groupId: 'grp-startup', industries: ['Startups', 'Tech'] }),
    ev('ev11', 'gt', 'Class of 2024 Trivia Night', 'g9', 'Social', false, at(25, 19), 'Queen City Taproom', 'Charlotte', 40,
      'Teams of four. Winning team picks the next city.',
      ['g9'], { groupId: 'grp-24' }),
    ev('ev12', 'gt', 'Class of 2028 Study Break', 'g14', 'Social', false, at(8, 16), 'Library lawn', 'Atlanta', 60,
      'Snacks, lawn games and an hour off before finals. Bring a classmate you haven’t seen since first year.',
      ['g14', 'g29'], { cohortYears: [2028, 2028] }),
    ev('ev13', 'gt', 'Classes of 2013–2017 Reunion Weekend', 'g11', 'Social', false, at(18, 17), 'Midtown Innovation Hall', 'Atlanta', 150,
      'Ten years on, give or take. A Friday mixer, a Saturday campus walk and plenty of time to catch up.',
      ['g11', 'g3', 'g31', 'g17', 'g28', 'g2'], { cohortYears: [2013, 2017] }),

    ev('eev1', 'emory', 'Healthcare Careers Coffee', 'e1', 'Networking', false, at(3, 8), 'Druid Hills Coffee House', 'Atlanta', 25,
      'Meet alumni working in hospitals, research and public health.', ['e1', 'e3'], { industries: ['Healthcare'], groupId: 'egrp-health' }),
    ev('eev2', 'emory', 'Finance Alumni Panel', 'e2', 'Industry', true, at(8, 18), 'Video call', 'Virtual', 100,
      'Asset management, banking and consulting paths compared.', ['e2', 'e4'], { industries: ['Finance'] }),
    ev('eev3', 'emory', 'Alumni Picnic in the Park', 'e5', 'Social', false, at(12, 12), 'Piedmont Park meadow', 'Atlanta', 80,
      'Bring a blanket. Families welcome.', ['e5', 'e1', 'e2']),

    ev('uev1', 'uga', 'Atlanta Alumni Watch Party', 'u2', 'Social', false, at(5, 15), 'The Midtown Tavern', 'Atlanta', 120,
      'Big screens, good company.', ['u2', 'u4'], { groupId: 'ugrp-atl' }),
    ev('uev2', 'uga', 'Banking Recruiting Q&A', 'u1', 'Industry', true, at(7, 18), 'Video call', 'Virtual', 60,
      'What recruiters look for, from people who do the hiring.', ['u1', 'u4'], { industries: ['Finance'] }),

    ev('sev1', 'gsu', 'Downtown Lunch & Learn', 's4', 'Networking', false, at(4, 12), 'Woodruff Park pavilion', 'Atlanta', 40,
      'Lunch with alumni who work a few blocks from campus.', ['s4', 's2', 's1'], { groupId: 'sgrp-biz' }),
    ev('sev2', 'gsu', 'Tech Careers Night', 's1', 'Industry', false, at(10, 18), 'Innovation Lab, Peachtree Center', 'Atlanta', 60,
      'Product, engineering and IT alumni on how they got started.', ['s1', 's3'], { industries: ['Tech'], groupId: 'sgrp-tech' }),
  ]
}

/* ---------------- connections ---------------- */

export function seedConnections(now: number): Connection[] {
  const ix = (type: InteractionType, daysAgo: number, note?: string, quality?: 'up' | 'down'): Interaction => ({ type, at: now - daysAgo * DAY, note, quality })
  const good = (daysAgo: number) => ix('coffee', daysAgo, undefined, 'up')
  const c = (otherId: string, note: string, ...interactions: Interaction[]): Connection => ({ otherId, note, interactions })
  return [
    // matched but not yet met: these are not in the web until there is a real exchange
    c('g24', '', ix('matched', 3)),
    c('g11', '', ix('matched', 25), ix('messaged', 22), ix('messaged', 20)),

    // strong (the labels here are what the closeness score works out to on day one)
    { ...c('g5', 'Offered to run a mock case with me before recruiting starts.', ix('matched', 34), ix('messaged', 30), good(28), ix('event', 21, 'Fall alumni mixer'), ix('messaged', 6)), rhythmDays: 30 },
    { ...c('g7', 'Knows a lot about grid modernization. Has two kids, early mornings only.', ix('matched', 60), good(41), ix('messaged', 12)), rhythmDays: 120 },
    c('g25', 'First-year in Computer Engineering. Asked about clubs and picking a thread.', ix('matched', 40), good(18), ix('thanks', 17)),
    // steady
    c('g2', 'Met at the fall mixer, works on engines. Travels to Atlanta a few times a year.', ix('matched', 120), ix('messaged', 110), ix('coffee', 55)),
    c('g15', 'Said to send my resume when product internships open.', ix('matched', 150), ix('coffee', 96), ix('messaged', 55)),
    c('g31', '', ix('matched', 90), ix('event', 75, 'Consulting info session'), ix('messaged', 62)),
    c('g4', 'Was at Stripe as an intern, now moving to Google.', ix('matched', 140), ix('coffee', 100), ix('messaged', 70)),
    c('g28', '', ix('matched', 130), ix('coffee', 110), ix('messaged', 85)),
    // fading
    c('g19', '', ix('matched', 210), ix('coffee', 160), ix('messaged', 100)),
    c('g3', 'Great on management vs. IC. Follow up about her team’s internship.', ix('matched', 240), ix('coffee', 180), ix('messaged', 125)),
    c('g10', '', ix('matched', 200), ix('event', 110, 'DC alumni coffee')),
    // dormant
    c('g17', '', ix('matched', 300), ix('coffee', 250), ix('messaged', 200)),
    c('g13', 'Introduced by Marcus.', ix('matched', 320), ix('coffee', 260)),
    c('g21', '', ix('matched', 400), ix('coffee', 360), ix('messaged', 330)),

    // other schools (visible after switching school in the demo panel)
    c('e1', '', ix('matched', 70), ix('coffee', 60), ix('messaged', 40)),
    c('e2', '', ix('matched', 160), ix('coffee', 150), ix('messaged', 120)),
    c('u1', '', ix('matched', 30), good(25), ix('messaged', 10)),
    c('u4', '', ix('matched', 280), ix('coffee', 220)),
    c('s1', '', ix('matched', 20), good(15), ix('messaged', 5)),
    c('s2', '', ix('matched', 190), ix('coffee', 170), ix('messaged', 140)),
  ]
}

/* ---------------- conversations ---------------- */

export function seedConversations(now: number): Conversation[] {
  const day0 = startOfDay(now)
  let n = 0
  const t = (from: string, daysAgo: number, text: string, extra: Partial<Message> = {}): Message => ({
    id: `seed-${n++}`, from, at: now - daysAgo * DAY, text, ...extra,
  })
  const conv = (otherId: string, unread: boolean, ...messages: Message[]): Conversation => ({ id: `c-${otherId}`, otherId, unread, messages })
  return [
    // 1. brand-new match, nothing said yet
    conv('g24', false),
    // 2. active chat
    conv('g5', true,
      t('me', 30, 'Hi Devon! I’m an IE junior trying to decide between consulting and product. Would love to hear how you thought about it.'),
      t('g5', 29.8, 'Happy to help. I had the same question in my third year. What draws you to each?'),
      t('me', 7, 'Consulting for the variety, product for getting to build one thing for a long time.'),
      t('g5', 6, 'That’s a clear way to put it. Want to do a mock case sometime? It’s the fastest way to find out if you enjoy the work.')),
    // 3. coffee proposed by the other person, waiting on me
    conv('g7', true,
      t('me', 14, 'Thanks again for the coffee last month. I’ve been reading about grid storage ever since.'),
      t('g7', 13, 'Glad it stuck! There’s a lot more I can show you. Let’s do another one.'),
      { id: `seed-${n++}`, from: 'g7', at: now - 12 * DAY, proposal: { slots: [day0 + 2 * DAY + 7.5 * HOUR, day0 + 4 * DAY + 7.5 * HOUR, day0 + 5 * DAY + 12 * HOUR], place: 'Vine & Bean Café, Midtown', mode: 'in-person' } }),
    // 4. coffee confirmed, coming up
    conv('g11', false,
      t('g11', 22, 'Saw you’re in IE. We hire a lot of IEs into test planning, if that’s ever interesting.'),
      t('me', 21, 'It is! I didn’t know that was a path. Could I ask you a few questions over coffee?'),
      { id: `seed-${n++}`, from: 'me', at: now - 20.5 * DAY, proposal: { slots: [day0 + 3 * DAY + 9 * HOUR, day0 + 6 * DAY + 16 * HOUR], place: 'Student Center coffee bar', mode: 'in-person', acceptedSlot: day0 + 3 * DAY + 9 * HOUR } },
      t('g11', 20, 'Thursday morning works. See you there.')),
    // 5. completed chat
    conv('g2', false,
      t('me', 110, 'Hi Jordan, we met at the fall mixer. Would you be up for a call about aerospace careers?'),
      { id: `seed-${n++}`, from: 'g2', at: now - 50 * DAY, proposal: { slots: [now - 45 * DAY], place: 'Video call', mode: 'virtual', acceptedSlot: now - 45 * DAY, checkedIn: true } },
      t('g2', 45, 'Good talking today. Send me your resume whenever you want another set of eyes on it.'),
      t('me', 45, 'Will do. Thank you, that was really helpful.')),

    // 6. a chat where the demo user was the one giving advice, ending in a thank-you note
    conv('g25', false,
      t('g25', 40, 'Hi! I’m a first-year in Computer Engineering and I have no idea which clubs are worth it. Could I ask you a few questions?'),
      t('me', 39, 'Of course. I was just as lost two years ago. Coffee at the Student Center?'),
      { id: `seed-${n++}`, from: 'me', at: now - 38 * DAY, proposal: { slots: [now - 18 * DAY], place: 'Student Center coffee bar', mode: 'in-person', acceptedSlot: now - 18 * DAY, checkedIn: true } },
      t('g25', 17, 'Thank you for being so honest about which clubs are worth the time. I joined the solar racing team the next day and I already love it.', { thanks: true })),

    conv('e1', false, t('e1', 40, 'Good luck with the application. Let me know how it goes!')),
    conv('u1', false, t('u1', 10, 'Charlotte is great for banking. Happy to introduce you to a few people.')),
    conv('s1', true, t('s1', 5, 'Want to grab coffee downtown next week?')),
  ]
}

/* ---------------- requests ---------------- */

export function seedRequests(now: number): Request[] {
  const r = (id: string, fromId: string, toId: string, daysAgo: number, topic: string, note: string): Request => ({ id, fromId, toId, topic, note, at: now - daysAgo * DAY, status: 'pending' })
  return [
    // asked of the demo user
    r('rq1', 'g32', 'me', 1, 'path', 'Hi! I’m a sophomore in CS trying to pick a thread. You were where I am a year ago. Could I ask how you chose?'),
    r('rq2', 'g18', 'me', 3, 'campus', 'I’m looking for a research lab to join and heard you know which clubs and labs are worth the time.'),
    // sent by the demo user: one still waiting, one that went unanswered
    r('rq3', 'me', 'g6', 2, 'industry', 'I’d love to hear what moving from R&D into product looked like for you.'),
    r('rq4', 'me', 'g26', 11, 'decision', 'I’m weighing consulting against operations roles and would value your view.'),

    r('rq5', 'e3', 'me', 2, 'path', 'Could I ask you about switching tracks in second year?'),
    r('rq6', 's3', 'me', 1, 'campus', 'Any advice on balancing work and classes?'),
  ]
}

/* ---------------- scripted nudges (others are computed from connection strength) ---------------- */

export const SEED_NUDGES: (Nudge & { schoolId: string })[] = [
  { id: 'visit-g2', schoolId: 'gt', otherId: 'g2', text: 'Jordan is in Atlanta this week. You’re both free Thursday morning.', action: 'coffee' },
  { id: 'job-g4', schoolId: 'gt', otherId: 'g4', text: 'Sam just started at Google. Congratulate them?', action: 'message', draft: 'Congrats on the new role at Google, Sam! How are the first few weeks going?' },
]

/* ---------------- announcements ---------------- */

/**
 * A few notices to a class or a city. Some are already posted and some are dated
 * in the coming weeks, so that fast-forwarding the demo clock brings a new one in.
 */
export function seedAnnouncements(now: number): Announcement[] {
  const at = (days: number) => now + days * DAY
  return [
    { id: 'an1', schoolId: 'gt', years: [2028, 2028], at: at(-2), eventId: 'ev12',
      title: 'Study break on the library lawn', body: 'One hour off before finals, a week from now. Snacks and lawn games. Bring a classmate you haven’t seen since first year.' },
    { id: 'an2', schoolId: 'gt', city: 'Atlanta', at: at(-6),
      title: 'Atlanta alumni volunteer morning', body: 'We’re helping at the campus food pantry on the first Saturday of next month. Students welcome. Tell us you’re interested and we’ll send the details.' },
    { id: 'an3', schoolId: 'gt', years: [2013, 2017], at: at(-3), eventId: 'ev13',
      title: 'Reunion weekend: registration is open', body: 'Ten years on, give or take. A Friday mixer and a Saturday campus walk. Tell us you’re coming so we can plan numbers.' },
    { id: 'an4', schoolId: 'gt', years: [2028, 2028], at: at(12),
      title: 'Class gift: vote on what we fund', body: 'Three ideas are on the table: a study-room refresh, an emergency fund, or bike racks by the library. Voting is open for two weeks.' },
    { id: 'an5', schoolId: 'gt', years: [2013, 2017], at: at(15),
      title: 'Reunion weekend: hotel block closes soon', body: 'The group rate at the hotel near campus ends at the end of the month. Book before then if you are travelling in.' },
    { id: 'an6', schoolId: 'gt', city: 'Atlanta', at: at(20),
      title: 'Who’s around over the break?', body: 'A few of us are getting together for a walk on the BeltLine while campus is quiet. Tell us if you’re in town.' },
  ]
}
