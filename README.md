# Kudzu

**Keep your alumni network close.**

Kudzu is a mobile-first app for alumni of the same college to stay in touch with one another, and for students to reach them. Your network is a living map: the app shows who you are close to and who has gone quiet, reminds you before a friendship lapses, and counts the catch-ups that happen off the app. When you do want to meet someone new, you search your school by what you need and ask one person, with a reason.

**Every member is verified** as a student or graduate of the school, by school email or by the alumni office. So a message always comes from a real student or graduate. It is not a place to browse people, and there is no swiping and no matching.

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
- **The app can show itself.** The very first screen asks whether you want a walkthrough: a **Quick walkthrough** (about four minutes), a **Full tutorial** (about ten minutes), or neither. Either one starts with sign-up, including verifying with a school email, and then follows whichever app you pick there: Grow my network (16 stops on the quick route, 40 on the full) or Keep in touch (23 stops). The full route covers the map, staying in touch, the two boxes on Messages, reaching someone new, arranging a coffee, and the Community tab with its groups and events. At the end it asks whether you want to see the other app. Each runs over the real app: one element is lit, a caption explains it, and it moves on when you tap the real thing. They move through the app the way a member would, by tapping tabs and opening people, not by jumping between screens. **Skip** does the step for you, so nothing later breaks. Leave at any point with the X or Escape. The keep-in-touch walkthrough includes adding people you already know and switching the help feature off. During sign-up the guide fills in a sample member, so you tap and it types. All of them can be started again from the demo controls. If a stop cannot find what it points at, it says so and lets you move on.
- Open the **demo controls** by tapping the Kudzu logo three times, or with the wrench button.
- [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) is a five-minute script for presenting it yourself, feature by feature.

Demo controls:

| Control | Effect |
| --- | --- |
| Switch user | Flip between the student view and the alum view |
| Switch school | Georgia Tech, Emory, UGA or Georgia State. Every tab is scoped to the selected school |
| Fast-forward one month | Connection strengths fade, new nudges appear, and unanswered requests lapse |
| Receive a request | Someone asks you for a chat. It appears under Requests at the top of Messages |
| Trigger a post-chat check-in | Opens the private feedback form, which ends with a thank-you note |
| Receive a thank-you note | Someone you helped thanks you. It appears on your profile and in the chat |
| Receive a class announcement | Alumni services send a notice to your class. It arrives as a phone-style notification at the top of the screen; tapping it opens the announcement |
| Show account-warning notice | Shows the notice a user gets after missed chats |
| Start the walkthrough | "From the start" returns to the first screen and sign-up. Quick or Full jump straight into the main app, Simple into Keep in touch. Each resets the demo data and runs the guided tour over the real app |
| Reset all demo data | Clears everything and returns to onboarding |

## What's in the app

| Tab | Features |
| --- | --- |
| **Find** | "What are you looking for?": tap a need, or describe one in your own words, and the people who can help drop out from under it. Search by name, field, city, level or the help someone offers, results as leaves on branches, each leaf a face, name, class, company and how far away they are (1st, 2nd or 3rd). One tap opens the whole profile as a floating card. Requests for a chat, and people you have connected with but not yet met |
| **Community** | Two halves, Events and Groups, with a count on the tab when the school has posted something unread. Events: a "For you" filter and type filters, each event as a floating card with map and guest list, RSVP, a group chat for the people going (open from three days before to a week after), host an event, community groups |
| **Network** | Just the map and the list: connection strength shown as leaf states, a searchable list that starts with "Add people you know", and a map where vines run from you to each connection. Nothing floats over it |
| **Messages** | Two boxes at the top, side by side: Requests (people who asked you, and the ones you are waiting on) and Catch up (people it is time to write to, each with a reason), a "Say hello" row of people you have not written to yet, a small cup on the picture of anyone you have no coffee chat with yet (nothing once one has happened or is arranged), chat with mock auto-replies, a coffee button at the bottom right of each chat (filled until you have a coffee chat with that person, an outline after), coffee-chat proposals that become confirmed chats, with "Suggest other times" and "Talk it over" when none fit, a mocked calendar link that marks times both people are free, post-chat check-in with a thank-you note |
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

- **Closeness is a score, not a rule.** Every interaction adds to it according to what kind it was (a coffee chat counts most, a message least) and how it went (a chat rated well counts for more). The four states (strong, steady, fading, resting) are bands of that score. See `closeness` in `src/services`.
- **Closeness fades at the pace you set.** There is no single right rate: some friends you see monthly and some once a year. Each person is judged against the rhythm chosen for them (monthly, each semester, or once a year), so one good catch-up reads as strong for about one period. With no rhythm set the fade is slow. The default rate is our own guess; no study gives one.
- **A quiet tie is resting, not lost.** It is drawn as a bud, and the app keeps suggesting one long-quiet person at a time, however long it has been. Research finds old ties are among the most valuable to hear from again.
- **Catch-ups off the app count in full.** "We caught up" logs a meeting, a call or a text. Meeting counts as a coffee chat arranged in the app does, a call almost the same, and a text what an in-app message does.
- **Requests, not matches.** You ask someone for a chat, about a topic and with a line of your own. They accept, suggest a later time, or decline, each in one tap. There is no swiping and no two-sided match.
- **Requests are kept from going unanswered.** People who are full this month cannot be asked. Each person can have five requests open. After ten days without an answer the sender is told and shown who else can help, and the request stops counting toward their five. The other person can still answer it, so a late yes is not lost. Someone who leaves two requests unanswered is paused for new ones until they return. See the request functions in `src/services`.
- **Adding someone you know needs their confirmation for anything that touches them.** Tapping "I know them" puts the person on your own list at once, so reminders and logged catch-ups work from the first day. They are then asked, with one tap, whether you know each other. Until they say yes you cannot message them in the app, and they do not count as a connection for the "2nd" tags other people see. This stops anyone from adding a stranger to get round the request with a reason. People who have added you appear in a grey box at the top of your list of people, with "Yes, I know them" and "Not really"; saying no is never reported back. If you both add each other it confirms without asking. In the demo the person confirms after a few seconds, and "Someone says they know you" in the demo controls brings one in.
- **An accepted request is not yet a connection.** Someone joins your web only after a real exchange: a coffee chat, an event together, or the two of you confirming that you already know each other. Until then a small cup on their picture in Messages marks that you have not had a coffee chat. The "Say hello" row at the top of Messages lists only the people you have not written to yet.
- **Sign-up preferences are weights, not walls.** The fields, cities and levels you pick decide who is shown first. They never hide anyone. Only a chip in the search bar filters.
- **"Something else" is matched on words.** What you type is cut down to its meaningful words. Each person is read as a short document, and a word found in their role or field counts for more than one found in a prompt answer. People who cover more of what you typed come first. See `suggestForText` in `src/services`. A real product would use a language model or embeddings here.
- **Grouping follows the search.** Results are grouped by city, field or level. A search narrowed to one city is not grouped by city, since everyone would sit on one branch.
- **Your class and your city are groups.** They are the two groups every member is in without joining, pinned first under Groups on the Community tab and marked "Yours". Each has its members, its events, and the posts the school's alumni services send to it; a count on the card shows posts not yet read. Groups you choose to join sit below them.
- **Event chats are small and short-lived.** Only people going to an event are in its chat. It is reached from the event's own page, or from the chat bubble at the bottom right of the Community tab, which opens to all your event chats. (The keep-in-touch app has no events tab, so there they are listed on Messages.) It opens three days before, closes a week after, and events with more than 50 people going do not get one. Tapping someone in it opens their profile, which is how it becomes one-to-one. Other guests’ messages and replies are mocked.
- **Cohorts get announcements, not chats.** A class or a city is too many people for a conversation. Announcements come from the school’s alumni services, go one way, and come a few times a year. A member cannot reply to everyone: the most they do is tap “I’m interested”. Each one arrives as a notification (mocked: nothing is really pushed). Some are dated ahead, so fast-forwarding a month brings a new one in. How alumni services write and send them is not built.
- **The Find front door fills itself in.** What you said you are looking for comes first. If that is fewer than four things, the list is topped up with what people at your stage usually want. "Or look around" is built from your own fields, city, what you studied and the career level most useful to you. See `needsFor` and `lookAround` in `src/services`.
- **Rhythms and reminders.** After a good chat you can choose to check in monthly, each semester, or once a year. A reminder appears when that is due. Two other kinds of reminder (a timely reason, and "it has been a while") can each be switched off in settings.
- **Calendars are mocked.** Linking one sets a flag. Who is busy when is made up from each person's id and the hour, so it is the same every time you look. About two in three people have "linked" theirs. Jordan answers a first coffee proposal with other times, so that case can be shown.
- **Demo time** is the real clock plus an offset. "Fast-forward one month" adds 30 days to the offset, which is why strengths fade and confirmed chats become due for a check-in.
- **Replies are mocked.** About 60% of people accept a request after a moment. The rest never answer, so that a lapsed request can be shown. Maya, the first suggestion at Georgia Tech, always accepts so the demo is repeatable.
- **Feedback is private, with one exception.** Check-in answers feed a hidden score used only to order search results and are never shown to anyone. The thank-you note at the end is the one part the other person sees, and only if you write one.
- **Nobody asks for a referral.** "Referrals and introductions" can be offered but is not in the list of things to look for. "Friends after graduation" is in both lists.
- **Zero chats a month is allowed.** Someone can be here only to ask. Nobody can send them a request.
- **Invites and usernames are mocked.** A phone invite is stored and nothing is sent. Usernames are made from each person's name.
- **Soft roles** come from `matchInfo` in `src/services`. Someone further along is someone to learn from by default; what each person asks for and offers supplies the reason and can tip the result.

## Research

[`docs/research/`](docs/research/README.md) holds the evidence behind the app: why it should exist, the evidence for each design choice, and where the research disagrees with what we built. Every claim is graded and sourced, and the weak points are stated. [`docs/design/`](docs/design/) holds records of two design decisions.

## Out of scope

Real authentication, LinkedIn or email verification, a backend or database, push notifications, real-time messaging and payments are all mocked or omitted.

All people in the seed data are fictional. School names are used as plain text only; no logos, mascots or other marks are used.
