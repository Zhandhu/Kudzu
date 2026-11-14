# Kudzu

**Keep your alumni network close.**

Kudzu is a mobile-first app for alumni of the same college to stay in touch with one another, and for students to reach them. Your network is a living map: the app shows who you are close to and who has gone quiet, reminds you before a friendship lapses, and counts the catch-ups that happen off the app. When you do want to meet someone new, you search your school by what you need and ask one person, with a reason.

**Every member is verified** as a student or graduate of the school, by school email or by the alumni office. That is what lets people answer a message from someone they have not met. It is not a place to browse people, and there is no swiping and no matching.

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

- On the welcome screen, tap **Skip onboarding (demo)**, pick one of the two apps, then **Skip the rest**. "Grow my network" loads a prefilled Georgia Tech student. "Keep in touch" loads an alum.
- **The app can show itself.** The full app opens on a choice: a **Quick guide** (about two minutes, 13 stops), a **Full walkthrough** (about five minutes, 31 stops), or exploring alone. Both run over the real app: one element is lit, a caption explains it, and it moves on when you tap the real thing. They move through the app the way a member would, by tapping tabs and opening people, not by jumping between screens. **Skip** does the step for you, so nothing later breaks. Leave at any point with the X or Escape. Either can be started again from the demo controls.
- Open the **demo controls** by tapping the Kudzu logo three times, or with the wrench button.
- [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) is a five-minute script for presenting it yourself, feature by feature.

Demo controls:

| Control | Effect |
| --- | --- |
| Switch user | Flip between the student view and the alum view |
| Switch school | Georgia Tech, Emory, UGA or Georgia State. Every tab is scoped to the selected school |
| Fast-forward one month | Connection strengths fade, new nudges appear, and unanswered requests lapse |
| Receive a request | Someone asks you for a chat. It appears under the tendril on Find |
| Trigger a post-chat check-in | Opens the private feedback form, which ends with a thank-you note |
| Receive a thank-you note | Someone you helped thanks you. It appears on your profile and in the chat |
| Receive a class announcement | Alumni services send a notice to your class. It arrives as a phone-style notification at the top of the screen; tapping it opens the announcement |
| Show account-warning notice | Shows the notice a user gets after missed chats |
| Start the walkthrough | Quick or Full. Resets the demo data and runs the guided tour over the real app |
| Reset all demo data | Clears everything and returns to onboarding |

## What's in the app

| Tab | Features |
| --- | --- |
| **Find** | "What are you looking for?": tap a need, or describe one in your own words, and the people who can help drop out from under it. Search by name, field, city, level or the help someone offers, results as leaves on branches, each leaf a face, name, class, company and how far away they are (1st, 2nd or 3rd). One tap opens the whole profile as a floating card. Requests for a chat, and people you have connected with but not yet met |
| **Events** | For You / All feeds, type filters, each event as a floating card with map and guest list, RSVP, a group chat for the people going (open from three days before to a week after), host an event, community groups |
| **Network** | Connection strength shown as leaf states, nudges, searchable list, and a map where vines run from you to each connection. Announcements to your class and city under the lighter green leaf, class and city cohorts, and a way to add people you already know |
| **Messages** | Chat with mock auto-replies, event chats for events you are going to, a coffee button at the bottom right with a first-time hint, coffee-chat proposals that become confirmed chats, with "Suggest other times" and "Talk it over" when none fit, a mocked calendar link that marks times both people are free, post-chat check-in with a thank-you note |
| **Profile** | Edit profile and prompts, career path, hobbies and clubs, thank-you notes you've received, who you want to find, groups, events, settings |

**No one picks a role.** People say what they are looking for and what they can offer, from one shared list of topics. From that and each person's stage, the app works out the relationship for every pairing: **Learn from**, **Give back** or **Trade notes**. The same student learns from an alum, gives back to a first-year and trades notes with a classmate.

**Sign-up is one menu.** Three sections are needed: you and your school, your current career, and people you already know. The rest are optional and can be added later from the profile: what you're here for, the fields you're interested in, hobbies, clubs and affiliations, and prompts. The career section also takes earlier roles and a flag for people who changed careers. Each row has a box that fills in when the section is done, and they can be done in any order. Sign-up also covers .edu detection, alum verification, request-a-school, inviting someone by phone number, and choosing which of the two apps to use.

**Two apps, one network.** "Grow my network" is everything in the table above. "Keep in touch" is a simple app for people who are not looking for new connections: one Home screen with who to catch up with, everyone they know (longest gap first), and, if they switch it on, people they could help. It has four tabs (Home, Map, Messages, Profile): the map of the network is kept, and there is no search of the school and no events. It is chosen on the first page of sign-up and changed under Profile, Settings. It is a first version: see [`docs/design/simple-app.md`](docs/design/simple-app.md) for what is built and what is still to decide.

**More than one school.** Someone with degrees from two schools belongs to both networks. One is their default, which the app opens on. Tapping the school name at the top of any tab lists their networks, swaps between them, changes the default, or adds another.

Also included: a private feedback and trust system, and Report / Block on every profile and chat.

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
  services/           The only data-access layer. Search, requests, closeness, nudges, events, chat replies
  store/useKudzu.ts   Zustand store: all app state and actions
  lib/util.ts         Time, geo and avatar helpers
  components/         Shared UI, brand marks, profile view, map, sheets, the walkthrough (`Tour.tsx`), demo panel
  screens/            One file per screen
```

Screens read data through `src/services`, never straight from the seed files, so a real API can replace that layer later without touching the UI.

### How a few things work

- **Closeness is a score, not a rule.** Every interaction adds to it according to what kind it was (a coffee chat counts most, a message least) and how it went (a chat rated well counts for more). Each contribution halves about every 60 days. The four leaf states are bands of that score. See `closeness` in `src/services`. A catch-up outside the app can be logged by hand ("We caught up"): meeting in person counts almost as much as a coffee chat, a call for less, a text for least.
- **Requests, not matches.** You ask someone for a chat, about a topic and with a line of your own. They accept, suggest a later time, or decline, each in one tap. There is no swiping and no two-sided match.
- **Requests are kept from going unanswered.** People who are full this month cannot be asked. Each person can have five requests open. A request lapses after ten days, and the sender is told and shown who else can help. Someone who lets two requests lapse is paused for new ones until they return. See the request functions in `src/services`.
- **An accepted request is not yet a connection.** Someone joins your web only after a real exchange: a coffee chat, an event together, or marking them as someone you already know. Until then they sit under "Not yet met" on Find.
- **Sign-up preferences are weights, not walls.** The fields, cities and levels you pick decide who is shown first. They never hide anyone. Only a chip in the search bar filters.
- **"Something else" is matched on words.** What you type is cut down to its meaningful words. Each person is read as a short document, and a word found in their role or field counts for more than one found in a prompt answer. People who cover more of what you typed come first. See `suggestForText` in `src/services`. A real product would use a language model or embeddings here.
- **Grouping follows the search.** Results are grouped by city, field or level. A search narrowed to one city is not grouped by city, since everyone would sit on one branch.
- **Event chats are small and short-lived.** Only people going to an event are in its chat. It opens three days before, closes a week after, and events with more than 50 people going do not get one. Tapping someone in it opens their profile, which is how it becomes one-to-one. Other guests’ messages and replies are mocked.
- **Cohorts get announcements, not chats.** A class or a city is too many people for a conversation. Announcements come from the school’s alumni services, go one way, and come a few times a year. A member cannot reply to everyone: the most they do is tap “I’m interested”. Each one arrives as a notification (mocked: nothing is really pushed). Some are dated ahead, so fast-forwarding a month brings a new one in. How alumni services write and send them is not built.
- **The Find front door fills itself in.** What you said you are looking for comes first. If that is fewer than four things, the list is topped up with what people at your stage usually want. "Or look around" is built from your own fields, city, what you studied and the career level most useful to you. See `needsFor` and `lookAround` in `src/services`.
- **Rhythms.** After a good chat you can choose to check in monthly or each semester. A nudge appears when that is due, before the tie has started to fade.
- **Calendars are mocked.** Linking one sets a flag. Who is busy when is made up from each person's id and the hour, so it is the same every time you look. About two in three people have "linked" theirs. Jordan answers a first coffee proposal with other times, so that case can be shown.
- **Demo time** is the real clock plus an offset. "Fast-forward one month" adds 30 days to the offset, which is why strengths fade and confirmed chats become due for a check-in.
- **Replies are mocked.** About 60% of people accept a request after a moment. The rest never answer, so that a lapsed request can be shown. Maya, the first suggestion at Georgia Tech, always accepts so the demo is repeatable.
- **Feedback is private, with one exception.** Check-in answers feed a hidden score used only to order search results and are never shown to anyone. The thank-you note at the end is the one part the other person sees, and only if you write one.
- **Nobody asks for a referral.** "Referrals and introductions" can be offered but is not in the list of things to look for. "Friends after graduation" is in both lists.
- **Zero chats a month is allowed.** Someone can be here only to ask. Nobody can send them a request.
- **Invites and usernames are mocked.** A phone invite is stored and nothing is sent. Usernames are made from each person's name.
- **Soft roles** come from `matchInfo` in `src/services`. Someone further along is someone to learn from by default; what each person asks for and offers supplies the reason and can tip the result.

## Research

[`docs/research/`](docs/research/README.md) holds the evidence behind the design: how the app should work for mentors, mentees and peers, a proposed matching algorithm, and a feature-by-feature review with an experiment backlog. Every claim is graded and sourced.

## Out of scope

Real authentication, LinkedIn or email verification, a backend or database, push notifications, real-time messaging and payments are all mocked or omitted.

All people in the seed data are fictional. School names are used as plain text only; no logos, mascots or other marks are used.
