# Design record: from swiping to finding

> This is a record of a design decision, written when it was made. Some of what it describes has since changed. The current evidence is in [the research base](../research/README.md).

The Meet tab was the part of Kudzu that still felt like a dating app. This file sets out why, four ways to replace it, a recommendation, and what else had to change with it.

**Status: built.** The recommendation below is now the Find tab. The section [What was built](#what-was-built) at the end lists what went in, what differs from the proposal, and what was left out.

## Why change it

The swipe deck was the right way to show the idea quickly. It is the wrong shape for the goals in an earlier goals review (since replaced by [the research base](../research/README.md)).

| The swipe deck | Why it works against us |
| --- | --- |
| Shows one person at a time, chosen by the app | People arrive with a need ("someone in consulting in New York"). They cannot ask for it. They can only wait for it to come up |
| Asks for a yes or no on a person | Judging people is the dating-app habit. The useful question is "can this person help with what I need?" |
| Needs both sides to swipe | Alumni are busy and giving time. Asking them to browse a deck gets a slow reply or none |
| Celebrates the match | The match is not the goal. The conversation is |
| Feels like a game | A senior alum deciding whether to join may not take it seriously |

The research already pointed this way: mentees should make a request and mentors should choose from a short inbox, and a small set with a stated reason beats an endless deck (an earlier matching note, since replaced by [the research base](../research/README.md)).

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

Each result is a leaf carrying four things and no more: a headshot (an emoji stands in until photos exist), a first name and last initial, a class year, and a company. Its tint is the mode (learn, give, trade), matching the Network tab.

One tap opens the whole profile as a card floating over the search. Tapping outside it, or the close button, returns to the same results.

This replaced two earlier builds. The first showed a small card on hover, which a phone cannot do. The second showed the small card on a first tap and the profile on a second, which was one step more than needed. The reason line, mutual connections and spots left that the small card carried are all on the profile.

On the front door, the leaves drop out from directly under the need that was tapped, so it is clear which need they answer.

## What replaces the match

A **request**, sent from the full profile.

1. Choose what it is about, from the topics where their offers meet your asks.
2. Add a line. Liking one of their prompts stays as the easy way to write it.
3. Send. It goes to their inbox, best fit first.
4. They accept, suggest another time, or decline with one tap. Declining never needs a reason.

The person joins your web after the first coffee chat, as now. People you already know still skip all of this with "I know them."

Two things this needs:

- **A limit on requests,** such as five open at a time, so each one is considered. This also guards against the referral-seeking worry in an earlier efficacy review (since replaced by [the research base](../research/README.md)).
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
- **Search favours the well known.** Everyone can find the partner at the famous firm. Ranking by capacity and spreading exposure, as in an earlier matching note (since replaced by [the research base](../research/README.md)), matters more here, not less.
- **Requests can go unanswered.** The swipe deck hid this by only showing a match once both had agreed. Limits, reply times and a gentle expiry are needed so silence does not sting.
- **Leaves must not cost speed.** If the leaf layout is slower to read than rows, people will stay in the row view and the theme will have added nothing. Test it.

## Build order

| Step | What | Size |
| --- | --- | --- |
| 1 | Find tab with the bar, chips and results as rows. Swipe deck removed | Medium |
| 2 | Requests in place of matches: send, inbox, accept or decline | Medium |
| 3 | Leaves on branches with grouping, the whole profile on one tap | Medium |
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

## Keeping requests from going unanswered

A request that meets silence is the worst outcome of this design. It cannot be ruled out, but it can be made rare, and painless when it happens. The work falls at three points.

### Before a request is sent

Most unanswered requests go to people who were never going to reply.

- **Only people with room can be asked.** Someone at their monthly limit shows as full, with an option to be told when they have a spot.
- **A reply record on each profile:** "Usually replies in 2 days."
- **Results are ordered by likelihood of a reply** as well as fit. Room for another chat and speed of reply both count.
- **A cap on open requests,** five per person. Fewer, more considered requests get more answers.

### While it waits

Silence is often "I'll deal with it later," not "no."

- **Three one-tap answers:** Accept, Later on, Not right now. None needs typing.
- **Declining is guilt-free.** "Not right now" sends a kind note for the person and never asks for a reason. People avoid answering when the only way to say no feels rude.

### After it goes quiet

- **Requests lapse after ten days.** The sender is told plainly, never left wondering.
- **The next step is offered at once:** who else can help with the same thing.
- **Lapsed requests do not count against the cap.**
- **No "seen" marker.** Knowing someone read it and did not reply is worse than not knowing.
- **People who stop answering are paused.** After two requests lapse, new ones stop reaching them until they say they are back. This protects senders and punishes nobody.

### How sure we are

The capacity rules rest on evidence: a field experiment on a dating platform found that sending everyone to the same few people left most ignored, and spreading recommendations produced more matches (Chen, Hsieh and Lin, 2023 **[A]**). The rest is design judgement: the ten days, the cap of five, the kind decline, hiding "seen" and the pause after two. All of it should be tested. **[H]**

There is a trade-off underneath. Every protection for senders asks something of the people being asked. If answering ever feels like a chore, alumni leave, and then nothing gets answered. Where the two pull against each other, favour whatever keeps it easy for the person being asked.

## What was built

| Proposed | Built |
| --- | --- |
| Find tab opening on "What are you looking for?" | Yes. Your asks are ready to tap, with up to four people who can help under each |
| Search with chips for text, field, city, level and "can help with" | Yes. Typing offers a matching chip. The + button lists them all |
| Results as leaves on branches, grouped by city, field or level | Yes. This is the default view |
| A plain list as an option | Yes. The Simple button switches to rows, and the choice is remembered |
| A summary on first tap, the full profile on the next | Replaced. One tap now opens the whole profile as a floating card |
| Requests in place of matches | Yes. Swiping, the mutual match and the celebration screen are removed |
| Rules against unanswered requests | Capacity gate, reply record, cap of five, one-tap answers, ten-day lapse with a suggestion, and the pause after two lapses |
| Sign-up questions in place of the filter form | Yes. Fields, cities and levels, used to order results and never to hide anyone |
| Paths through people you both know | Partly. The front door names who knows whom. There is no way to ask for an introduction |

### How requests are shown

A request is drawn as a **tendril**: the curl a vine sends out before it takes hold, with a bud on the end. It appears on a person's leaf when you have asked them, beside each request you are waiting on, and as one of two leaves in the corner of the Find tab. The other corner leaf, brown, is **Not yet met**: people who have accepted and whom you have not yet had a chat with. So a relationship runs tendril, then leaf, then vine.

### Different from the proposal

- **Requests and Not yet met live on Find,** behind the two corner leaves, not in Messages or Network.
- **Not yet met is simpler.** Tapping a person opens the chat. A cup icon proposes coffee.
- **The Messages tab has no requests section.** An accepted request becomes an ordinary conversation, with the line from the request as its first message.

### Left out

- **Bring a friend** is gone. The proposal was to make it an option on a request.
- **"Tell me when there's a spot"** shows a confirmation and does nothing else.
- **A weekly digest and a reminder** for people with requests waiting.
- **Spreading requests** away from people who already have several waiting. Results are ordered by room and reply speed, but nothing counts requests in flight.
- **The reply record is made up** in the demo. A real one needs real response times.
