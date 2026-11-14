# Kadzu research base

This folder is the evidence behind Kadzu's design decisions. It exists so that when we argue about a feature, we argue from what is known, and so that we can tell which of our beliefs are tested and which are guesses.

It covers three questions:

| # | Question | File |
| --- | --- | --- |
| 1 | How should the app fit together for a mentor, a mentee and a peer? | [01-roles.md](01-roles.md) |
| 2 | How should we match people to maximise satisfaction? | [02-matching.md](02-matching.md) |
| 3 | Which features work, which should change, and how do we keep finding out? | [03-efficacy.md](03-efficacy.md) |

All citations, with links and how far each was checked, are in [sources.md](sources.md).

## The short version

Twelve findings carry most of the weight. Each links to the file that develops it.

1. **Mentoring helps, but the average effect is small.** What separates a useful relationship from a useless one is its quality, so the product should optimise for good conversations, not for the number of matches. ([01](01-roles.md#1-what-mentoring-does-and-does-not-do))
2. **Shared values predict a good match far better than shared demographics.** Our prompts are the main tool for revealing values, which makes them more important than the profile header. ([01](01-roles.md#2-what-makes-a-pairing-work))
3. **People who had a say in their match, set goals and met regularly report better relationships.** Swiping already gives the say. We have no goal-setting and no rhythm after the first chat. ([01](01-roles.md#2-what-makes-a-pairing-work))
4. **Students badly underestimate how willing people are to help.** In one set of studies, by as much as half. The biggest barrier on the mentee side is the fear of asking, and the app can lower it. ([01](01-roles.md#4-the-mentee-side-the-fear-of-asking))
5. **Mentors come back when they feel valued, and a thank-you is what makes them feel valued.** We currently give mentors nothing after a chat. This is the largest gap in the prototype. ([01](01-roles.md#3-the-mentor-side-why-people-give-time))
6. **Peers are a real alternative to mentors, not a lesser version.** One randomised trial found that female peer mentors kept women in engineering when male mentors and no mentor did not. ([01](01-roles.md#5-the-peer-side))
7. **A good match is one both people want.** Ranking by what one side likes sends everyone to the same few popular people. Scores must be reciprocal. ([02](02-matching.md#2-what-the-research-says))
8. **Popular users get swamped unless the system limits exposure.** A field experiment that spread recommendations more evenly produced substantially more matches. Our capacity setting is the right idea but is not yet used in ranking. ([02](02-matching.md#2-what-the-research-says))
9. **Fewer, better options beat an endless deck.** People choosing from 24 options were less satisfied a week later than people choosing from 6. ([02](02-matching.md#2-what-the-research-says))
10. **Dormant ties keep their value.** Advice from people you have lost touch with was as useful as advice from current contacts. Our "dormant" leaf looks like a dying plant, which tells users the opposite. ([03](03-efficacy.md#network-and-connection-strength))
11. **People underestimate how much a message out of the blue is appreciated.** Nudges should say so. ([03](03-efficacy.md#network-and-connection-strength))
12. **Private feedback is the right call.** Public ratings inflate because people do not want to hurt each other. ([03](03-efficacy.md#feedback-and-trust))

## What we recommend doing first

These are ordered by how much evidence supports them against how little they cost to build.

| Priority | Change | Why | Detail |
| --- | --- | --- | --- |
| 1 | Add a **thank-you step** to the post-chat check-in, delivered to the mentor. **Built** | Finding 5 | [03](03-efficacy.md#feedback-and-trust) |
| 2 | Replace the single intentions list with **"I'm looking for" and "I can offer"**. **Built** | Findings 2, 6 | [01](01-roles.md#7-proposal-one-model-three-modes) |
| 3 | Make match scores **reciprocal** and **capacity-aware** | Findings 7, 8 | [02](02-matching.md#4-proposed-algorithm) |
| 4 | Replace the endless deck with a **small daily set** plus one weekly top match | Finding 9 | [02](02-matching.md#4-proposed-algorithm) |
| 5 | Add a **goal and a suggested agenda** to every coffee proposal | Finding 3 | [03](03-efficacy.md#messages-and-coffee-chats) |
| 6 | **Redraw the dormant leaf** and rewrite nudges around the value of reconnecting | Findings 10, 11 | [03](03-efficacy.md#network-and-connection-strength) |

Items 1 and 2 are built in the prototype. The rest are proposals for discussion.

What was built differs from the proposals in three ways:

- **Need-to-offer fit is added to the existing ranking** as one more term. The reciprocal, capacity-aware algorithm in [02-matching.md](02-matching.md) is not built.
- **The check-in does not yet change by mode.** Everyone who had a good chat is offered the thank-you, whichever way the help flowed.
- **The private impact line for mentors is not built.** The profile shows the notes received and how many people have sent one.

## How strong is the evidence?

Every claim in this folder carries a grade.

| Grade | Meaning |
| --- | --- |
| **A** | Meta-analysis, randomised trial or large field experiment, published in a peer-reviewed venue |
| **B** | A single peer-reviewed study, a small sample, or a theoretical model |
| **C** | Company-reported figures, vendor case studies, press coverage of a study, or an unreviewed preprint |
| **H** | Our own hypothesis. No evidence found yet |

Two limits apply to everything here:

- **Most sources were checked through abstracts and summaries, not full texts.** Where a specific number could not be confirmed against the paper, [sources.md](sources.md) says so.
- **Almost none of this research was done on an app like Kadzu.** The mentoring studies are mostly workplace programmes. The matching studies are mostly dating apps. The findings are the best available starting point, and each one needs testing with our own users.

## How the research loop works

This is meant to be added to, not finished.

1. **Ask.** A design question goes into the open-questions list below.
2. **Search.** Look for meta-analyses and field experiments first, single studies second, industry claims last.
3. **Record.** Add the source to [sources.md](sources.md) with a grade and a note on how it was checked.
4. **Apply.** Write the implication into file 01, 02 or 03 next to the feature it affects.
5. **Test.** Turn the implication into an experiment in the [backlog](03-efficacy.md#experiment-backlog). Our own data outranks any paper.
6. **Log.** Add a line to the research log below.

### Research log

| Round | Date | What was covered |
| --- | --- | --- |
| 1 | 2026-11-14 | Mentoring outcomes and matching criteria, weak and dormant ties, help-seeking, mentor motivation, reciprocal recommenders, congestion and choice restriction, signalling, fairness of exposure, marketplace experiments |
| 2 | 2026-11-14 | Closed three gaps from round 1: how reciprocal scores are combined (RECON), planning prompts and follow-through, alumni platform outcome data |

| 3 | 2026-11-14 | Using a person's existing connections in matching, how this differs from dating apps, and referral-seeking. Added to files 02 and 03, with the first safeguards built |

### Open questions for the next round

- **Does anyone publish independent outcomes for alumni mentoring platforms?** Round 2 found only vendor case studies.
- **One-off chats or ongoing relationships: which produces more value per hour of mentor time?** We found evidence on programme features but nothing comparing a single conversation with a series.
- **Does "bring a friend" lower the barrier to asking?** No evidence found either way.
- **What is the right experience gap?** One vendor analysis says most pairings are three to five years apart. We have no evidence on which gap works best.
- **Identity-based matching.** The engineering trial supports offering it. How should it be offered so that it is a choice and never a filter imposed on someone?
- **Cold start at a new school.** How many alumni does a school need before students get a good first week?
- **Peer relationship types.** Kram and Isabella's three-way typology is cited from memory and should be checked against the paper.
