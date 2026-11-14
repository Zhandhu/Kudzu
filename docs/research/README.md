# Kudzu research base

This folder holds the evidence behind Kudzu. It answers three questions, in this order.

| # | Question | File |
| --- | --- | --- |
| 1 | Why should this app exist? | [01-need.md](01-need.md) |
| 2 | What evidence is there for each design choice? | [02-choices.md](02-choices.md) |
| 3 | Where did the research disagree with us, and what did we change? | [03-divergences.md](03-divergences.md) |
| | Every source, with its grade and how far it was read | [sources.md](sources.md) |

Records of two design decisions (the move from swiping to search, and the simpler "Keep in touch" app) are in [`../design/`](../design/). They describe what was built and why. They are not evidence.

## The short version

**The need is well supported. The solution is not yet tested by anyone.**

- **People lose touch, and it costs them.** Friendships lose closeness within months when contact drops. Stronger social ties go with better health, and old and weak ties are where much career help comes from. Most of this evidence is grade A or B.
- **People want to reconnect and do not.** Across seven studies, most people (about nine in ten in one, three in four in another) had an old friend they still cared about and had lost touch with. Fewer than four in ten sent a message, even when given the time and the chance. The barrier is the belief that the message will not be welcome, and on average that belief is wrong.
- **Existing channels do not fix it.** In one US survey, 9% of graduates said their alumni network had helped them in the job market. This evidence is grade C, and it measures job help, not staying in touch.
- **No one has shown that an app like this works.** We found no independent evaluation of an alumni keep-in-touch app, and no trial showing that reminders to contact a friend keep a friendship alive. Our own data will be the first evidence.

**Of our 21 design choices, 2 are well supported, 13 are partly supported, and 6 are our own bets.**

- **Well supported:** the thank-you note after a chat, and keeping feedback private.
- **Partly supported:** the idea has evidence but the details do not. The numbers we chose are our own: the 60-day fade, "about four people", five open requests, the ten-day expiry and the 50-person chat limit.
- **Our bets:** the network map, dropping the mentor and mentee labels, the three ways to answer a coffee proposal, one-way announcements, the three required sign-up steps, and avoiding the words "match", "swipe" and "like".

**In 15 places the research disagreed with us or offered a more defensible choice. We changed ten and kept five.** The three with the strongest case were:

1. Closeness faded too fast, and at one rate for everyone. A friend seen once a year showed as dormant for more than half the year. It now fades against the rhythm set for each person, with a slower default.
2. Dormant ties were drawn as dead. Research finds they are among the most valuable to revive. They are now called "resting", and the app keeps suggesting them.
3. We sometimes promised outcomes the evidence does not show. The wording is now limited to what we can support.

[03-divergences.md](03-divergences.md) lists what changed for all 15, and keeps the reasoning for each: what the app did, what the research says, the options, and the recommendation.

## How strong is the evidence?

Every claim in this folder carries a grade.

| Grade | Meaning |
| --- | --- |
| **A** | Meta-analysis, randomised trial or large field experiment, published in a peer-reviewed venue |
| **B** | A single peer-reviewed study, a small sample, or a theoretical model |
| **C** | Company or survey reports, vendor case studies, press coverage of a study, or an unreviewed preprint |
| **H** | Our own hypothesis. No evidence found |

Three limits apply to everything here.

- **Most sources were read as abstracts or summaries, not in full.** [sources.md](sources.md) says how far each one was read. Where a number could not be confirmed against the paper, the text says so. Some citation details are flagged as unconfirmed and need checking before anything is published.
- **Almost none of this research was done on an app like Kudzu.** Much of it comes from dating platforms, public social media, workplaces and health reminders. The findings are the best available starting point. Each needs testing with our own users.
- **A missing study is not a reason to change a choice.** Several choices were made for safety, for the identity of the product, or to keep the demo simple. Those reasons stand without a study behind them.

## How this folder was written

It was rewritten in one round, to match what the app has become: a way for alumni to stay in touch, with reaching someone new as the second use.

| Step | What happened |
| --- | --- |
| Cleared | Four earlier files were removed: on mentor and mentee roles, on a matching algorithm that was never built, on feature efficacy, and on goals. They described a version of the app built around a swipe deck. They remain in the git history |
| Searched | New searches covered what the earlier files did not: why graduates lose touch, verification and trust, group size, notifications, older users, and what predicts closeness |
| Written | The three documents were each drafted by a separate research pass, then checked against one another. Contradictions between them were reconciled, and the source lists were merged |
| Kept | Sources from the earlier round that are still cited, with the closer reading they were given then |

Earlier rounds also built and then shelved a set of safeguards against people using the app only to ask for job referrals. That work is on the branch `shelved/referral-safeguards`.

## What to do with it

1. When presenting the app, use the wording in "Claims to stop making" in [03-divergences.md](03-divergences.md). Each claim has a safer version beside it.
2. Read the papers behind the three strongest items in full. They were read as summaries, and the changes made on their strength are worth confirming.
3. Plan to measure. The last section of [03-divergences.md](03-divergences.md) lists what to record with the first real users. Nothing here can show that the app works until that is done.
4. Treat the numbers as provisional. The fade rates, "about four people", five open requests, the ten-day mark and the 50-person limit are our own guesses, and the first real data should replace them.

## If you only have five minutes

Read "The short version" above, then the table "What was changed" at the top of [03-divergences.md](03-divergences.md), then "What the evidence does not show" in [01-need.md](01-need.md).
