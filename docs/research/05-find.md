# 5. From swiping to finding: redesigning Meet

The Meet tab is the part of Kudzu that still feels like a dating app. This file sets out why, four ways to replace it, a recommendation, and what else has to change with it. Nothing here is built.

## Why change it

The swipe deck was the right way to show the idea quickly. It is the wrong shape for the goals in [04-goals.md](04-goals.md).

| The swipe deck | Why it works against us |
| --- | --- |
| Shows one person at a time, chosen by the app | People arrive with a need ("someone in consulting in New York"). They cannot ask for it. They can only wait for it to come up |
| Asks for a yes or no on a person | Judging people is the dating-app habit. The useful question is "can this person help with what I need?" |
| Needs both sides to swipe | Alumni are busy and giving time. Asking them to browse a deck gets a slow reply or none |
| Celebrates the match | The match is not the goal. The conversation is |
| Feels like a game | A senior alum deciding whether to join may not take it seriously |

The research already pointed this way: mentees should make a request and mentors should choose from a short inbox, and a small set with a stated reason beats an endless deck ([02-matching.md](02-matching.md#step-6-change-who-makes-the-first-move)).

## What stays

- **Profiles and prompts.** Prompts are still the best conversation starter we have.
- **Asks and offers, and the Learn from / Give back / Trade notes modes.**
- **The reason line** ("Maya can help with…").
- **Capacity,** so nobody is swamped.
- **The ranking,** now used to order results instead of to build a deck.

## What goes

- Swiping, and the pass and connect buttons.
- The mutual match and the match celebration screen.
- The coin-flip that decides a match in the demo.
- The filter sheet as the main way to steer who you see.

## Four ways to do it

### A. The Trellis

A search bar at the top builds a short sentence from leaf-shaped chips. Results grow underneath as leaves on a vine, grouped along one branch per city, industry or experience level.

```
┌──────────────────────────────────┐
│  Find                       GT   │
│  ┌────────────────────────────┐  │
│  │ 🔍 Name, company, anything │  │
│  └────────────────────────────┘  │
│  (Consulting ×) (New York ×) (+) │   <- chips: industry, city, level, help
│                                  │
│  Group by:  City · Industry · Level
│                                  │
│  ── New York ───────────── 3 ──  │
│     ╭─◖Will T.   ◖Raj M.        │   <- each leaf is a person
│  ───┤                            │
│     ╰─◖Sam W.                    │
│  ── Atlanta ────────────── 2 ──  │
│     ╭─◖Devon B.  ◖Camila T.     │
│  ───╯                            │
└──────────────────────────────────┘
```

- **For it:** direct and fast. Every way of searching you listed fits in one bar. Grouping gives the result a shape, which a flat list lacks. The vine has a job: it is the grouping.
- **Against it:** the busiest screen of the four. Needs care on a small phone.

### B. The Canopy

No list. Results are a field of leaves, larger and nearer the middle the better they fit. You pan around it.

- **For it:** the most distinctive, and striking in a demo.
- **Against it:** slow to scan, hard to compare people, and awkward for anyone using a screen reader or a keyboard. It is another gimmick in place of the one we are removing.

### C. The Directory

A search bar, filter chips, and plain rows: avatar, name, role, the reason line. A small leaf marks the mode.

- **For it:** the most efficient and the easiest to build. Familiar to anyone who has used LinkedIn.
- **Against it:** nothing about it is Kudzu. It is also the least likely to prompt someone who is not sure what to look for.

### D. The Pathfinder

It starts from the need, not the person. "What are you looking for?" with your asks from sign-up offered as one-tap choices. It returns three to five people, each with the reason and, where one exists, the path to them through someone you both know.

```
┌──────────────────────────────────┐
│  What are you looking for?       │
│  (Interview practice)            │
│  (An inside look at consulting)  │
│  (Advice on a decision)   (+)    │
│                                  │
│  For interview practice:         │
│   ◖ Devon Brooks · BCG           │
│     Has run 200 case interviews  │
│     You → Nina → Devon           │   <- a warm path
│   ◖ Will Thompson · Bain         │
│     Helps run recruiting         │
└──────────────────────────────────┘
```

- **For it:** the closest fit to "support one another." It asks the question that matters, keeps choice small, and uses the network you already have.
- **Against it:** no good for "find Raj Malhotra" or "who is in Seattle." Needs free search beside it.

## Recommendation

Build **A with D as its front door, and C as its compact view.**

1. **The tab opens on the Pathfinder.** "What are you looking for?" with your own asks ready to tap, and a short set of suggested people under each. Someone who does not know what to search for is still handed a useful next step.
2. **Typing in the bar or adding a chip turns it into the Trellis.** Results regroup as leaves on branches.
3. **A toggle switches the leaves to plain rows** for anyone who wants speed over looks, and for accessibility.

The Canopy is not recommended. It trades one novelty for another.

The tab should also be renamed. **Find** is plain and accurate.

## How the search works

One bar, five kinds of chip. Any combination narrows the results.

| Chip | Examples | Notes |
| --- | --- | --- |
| **Text** | "Raj", "Stripe", "aerospace" | Matches name, company, role, major |
| **Industry** | Consulting, Healthcare | From the existing list |
| **City** | New York, "near me", "where I'm travelling" | Replaces the distance slider |
| **Level** | Students · Early career · Mid career · Senior | Friendlier than a grad-year range. Worked out from class year |
| **Can help with** | Interview practice, A referral | The offers people listed. This is the chip no dating app has |

Chips are leaf-shaped, which costs nothing and carries the theme. The bar should accept typing for all of them: typing "new" offers the New York chip.

## What a leaf shows

Each result is a leaf carrying a first name and last initial. Its colour is the mode (learn, give, trade), matching the Network tab.

| Action | On a computer | On a phone | Shows |
| --- | --- | --- | --- |
| **Glance** | Hover | Press and hold, or first tap | A small card: role, company, city, the reason line, mutual connections, spots left |
| **Open** | Click | Tap the card | The full profile, as now |

A phone has no hover, so the first tap opens the small card and a second tap opens the profile. That keeps one behaviour on both and never hides the synopsis behind a gesture people have to discover.

## What replaces the match

A **request**, sent from the full profile.

1. Choose what it is about, from the topics where their offers meet your asks.
2. Add a line. Liking one of their prompts stays as the easy way to write it.
3. Send. It goes to their inbox, best fit first.
4. They accept, suggest another time, or decline with one tap. Declining never needs a reason.

The person joins your web after the first coffee chat, as now. People you already know still skip all of this with "I know them."

Two things this needs:

- **A limit on requests,** such as five open at a time, so each one is considered. This also guards against the referral-seeking worry in [03-efficacy.md](03-efficacy.md#referral-seeking-and-transactional-use).
- **An honest reply time** on each profile, so people know what to expect.

## Sign-up instead of filters

Today, sign-up ends with a filter form, and the same form sits behind a button on Meet. The proposal is to ask once, in plain terms, and use the answers quietly.

**Ask at sign-up**

- What are you looking for? (the asks, already there)
- Which fields interest you?
- Which cities matter to you? Where you live, where you are from, where you might move
- Who would you most like to hear from? Students, people a few years ahead, people well established

**Use the answers to**

- Order the suggestions on the Pathfinder.
- Offer those fields and cities as the first chips in the bar.
- Decide what "for you" means in Events.

**Do not use them to hide anyone.** A search for "Raj" should find Raj whatever was said at sign-up. Preferences rank. Only an explicit chip filters. This is the main change in how filters work: from walls to weights.

The answers stay editable in Profile.

## What else changes

| Part of the app | Change |
| --- | --- |
| **Tab bar** | Meet becomes Find. The icon changes from a coffee cup to a search or sprout |
| **Messages** | "New matches" becomes "Requests": the ones sent to you, and the ones you are waiting on |
| **Network** | "Not yet met" lists accepted requests with no chat yet. Its Grow leaf links to Find |
| **Events** | Guest lists open the same small card and full profile |
| **Demo controls** | "Trigger a new match" becomes "Receive a request" |
| **Bring a friend** | Becomes an option on a request: "Bring a friend along" |

## Why this serves the goals better

| Goal | How |
| --- | --- |
| **Find connections in your alumni network** | You can ask for what you need, in the terms you think in: a field, a city, a level, a name |
| **Find mentorship** | Starting from "what are you looking for?" and "can help with" puts the help first. A request with a topic is a better first contact than a swipe |
| **Keep the network connected** | Alumni can look up classmates and colleagues directly. Search by name and city is what makes the app useful to someone who is not looking for a mentor |

## Risks

- **A search box asks more of people than a deck.** Some arrive not knowing what they want. The Pathfinder is there for them, and its suggestions must be good.
- **Search favours the well known.** Everyone can find the partner at the famous firm. Ranking by capacity and spreading exposure, as in [02-matching.md](02-matching.md), matters more here, not less.
- **Requests can go unanswered.** The swipe deck hid this by only showing a match once both had agreed. Limits, reply times and a gentle expiry are needed so silence does not sting.
- **Leaves must not cost speed.** If the leaf layout is slower to read than rows, people will stay in the row view and the theme will have added nothing. Test it.

## Build order

| Step | What | Size |
| --- | --- | --- |
| 1 | Find tab with the bar, chips and results as rows. Swipe deck removed | Medium |
| 2 | Requests in place of matches: send, inbox, accept or decline | Medium |
| 3 | Leaves on branches with grouping, the small card on hover or first tap | Medium |
| 4 | Pathfinder front door, with paths through people you both know | Medium |
| 5 | Sign-up questions in place of the filter form. Preferences as weights | Small |
| 6 | Rename and tidy: Messages, Network, demo controls, demo script | Small |

Steps 1 and 2 remove the dating-app feel by themselves. Steps 3 and 4 are what make it Kudzu.

## Questions to settle before building

1. **Requests or mutual interest?** This proposal drops the two-sided match entirely. A softer version keeps it for peers only.
2. **How many open requests should someone be allowed?**
3. **Should alumni see who has looked at their profile?** It could prompt them to reach out. It could also feel like being watched.
4. **Is "Find" the right name?** Alternatives: Explore, Directory, Grow.
5. **Leaves or rows by default?**
