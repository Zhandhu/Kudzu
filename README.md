# Kudzu

**Coffee chats, matched.**

Kudzu is a mobile-first app that matches current students and alumni of the same college for coffee chats, networking events and lasting professional connections. Think "Hinge for networking": profiles you swipe on, conversation-starter prompts, clear intentions, plus events and a living map of your network.

This repository is a **clickable demo** of the full product vision. Every screen is interactive, but there is no backend: all data is mocked and saved in your browser's localStorage.

**Live demo:** https://zhandhu.github.io/Kudzu/ (rebuilt automatically on every push to `main`)

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). On a laptop the app renders inside a phone frame; on a phone it fills the screen.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |

## Presenting the demo

- On the welcome screen, tap **Skip onboarding (demo)** to load a prefilled Georgia Tech student.
- Open the **demo controls** by tapping the Kudzu logo three times, or with the wrench button.
- [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) is a five-minute walkthrough that shows every feature in order.

Demo controls:

| Control | Effect |
| --- | --- |
| Switch user | Flip between the student view and the alum view |
| Switch school | Georgia Tech, Emory, UGA or Georgia State. Every tab is scoped to the selected school |
| Fast-forward one month | Connection strengths fade and new nudges appear |
| Trigger a new match | Matches you with the next person in Meet |
| Trigger a post-chat check-in | Opens the private feedback form, which ends with a thank-you note |
| Receive a thank-you note | Someone you helped thanks you. It appears on your profile and in the chat |
| Show account-warning notice | Shows the notice a user gets after missed chats |
| Reset all demo data | Clears everything and returns to onboarding |

## What's in the app

| Tab | Features |
| --- | --- |
| **Meet** | Swipeable profile cards that say why each person is shown, likes on a specific prompt with a comment, match celebration, filters, monthly chat capacity, "bring a friend" group chats |
| **Events** | For You / All feeds, type filters, event detail with map and guest list, RSVP, host an event, community groups |
| **Network** | Connection strength shown as leaf states, nudges, searchable list, and a map where vines run from you to each connection. Class and city cohorts, and a way to add people you already know |
| **Messages** | New-match row, chat with mock auto-replies, coffee-chat proposals that become confirmed chats, post-chat check-in with a thank-you note |
| **Profile** | Edit profile and prompts, thank-you notes you've received, matching preferences, groups, events, settings |

**No one picks a role.** People say what they are looking for and what they can offer, from one shared list of topics. From that and each person's stage, the app works out the relationship for every pairing: **Learn from**, **Give back** or **Trade notes**. The same student learns from an alum, gives back to a first-year and trades notes with a classmate.

Also included: a full onboarding flow (school selection with .edu detection, alum verification, request-a-school), a private feedback and trust system, and Report / Block on every profile and chat.

Kudzu is **college-agnostic**. Schools are data, not code: a `School` has an id, name, email domains, city and accent colour, and every user, event and group carries a school id. The demo is seeded with Georgia Tech as the featured school plus three others.

## Tech stack

React 19 · Vite · TypeScript · Tailwind CSS · Framer Motion · React Router · Zustand (persisted to localStorage) · react-leaflet with OpenStreetMap tiles · lucide-react

No API keys are needed. The only network requests are map tiles and web fonts.

## Project structure

```
src/
  config/brand.ts     App name, tagline and shared constants (rename the product here)
  types.ts            Data model
  data/               Seed data: schools, prompts, profiles, events, groups, connections, chats
  services/           The only data-access layer. Matching, strength, nudges, events, chat replies
  store/useKudzu.ts   Zustand store: all app state and actions
  lib/util.ts         Time, geo and avatar helpers
  components/         Shared UI, brand marks, profile view, map, sheets, demo panel
  screens/            One file per screen
```

Screens read data through `src/services`, never straight from the seed files, so a real API can replace that layer later without touching the UI.

### How a few things work

- **Connection strength** is derived, not stored: days since the last interaction, with a little extra grace if you interact often. Strong is under 30 days, Steady under 90, Fading under 180, Dormant beyond that.
- **Demo time** is the real clock plus an offset. "Fast-forward one month" adds 30 days to the offset, which is why strengths fade and confirmed chats become due for a check-in.
- **Matching** is mocked: about 40% of right swipes match instantly. The first profile in the Georgia Tech deck always matches so the demo is repeatable.
- **Feedback is private, with one exception.** Check-in answers feed a hidden score used only to rank the Meet deck and are never shown to anyone. The thank-you note at the end is the one part the other person sees, and only if you write one.
- **Soft roles** come from `matchInfo` in `src/services`. Someone further along is someone to learn from by default; what each person asks for and offers supplies the reason and can tip the result.

## Research

[`docs/research/`](docs/research/README.md) holds the evidence behind the design: how the app should work for mentors, mentees and peers, a proposed matching algorithm, and a feature-by-feature review with an experiment backlog. Every claim is graded and sourced.

## Out of scope

Real authentication, LinkedIn or email verification, a backend or database, push notifications, real-time messaging and payments are all mocked or omitted.

All people in the seed data are fictional. School names are used as plain text only; no logos, mascots or other marks are used.
