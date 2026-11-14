# 3. Efficacy: which features work, and how we keep finding out

This file goes through the prototype feature by feature. For each one it gives the evidence, a verdict (keep, change or add), and what to measure. It ends with a backlog of experiments and a plan for our own user research.

Grades in brackets are explained in the [README](README.md#how-strong-is-the-evidence). Full citations are in [sources.md](sources.md).

## What "working" means

The research in [01-roles.md](01-roles.md#1-what-mentoring-does-and-does-not-do) says mentoring's average effect is small and its value comes from relationship quality. That sets the measure.

**North star: good chats per active user per month.** A good chat is one where both people showed up and both rated it well. The check-in already collects this.

Supporting measures, in the order a relationship moves through them:

| Stage | Measure | What a drop means |
| --- | --- | --- |
| Discover | Share of shown profiles that get a like | Matching is off, or cards do not say why |
| Ask | Share of likes that become a match or accepted request | One-sided matching, or overloaded mentors |
| Schedule | Share of matches with a confirmed time within 7 days | Too much friction after matching |
| Meet | Show-up rate | Weak commitment or no reminders |
| Value | Share of chats rated well by both | Poor fit, or no agenda |
| Follow up | Share of good chats followed by another contact within 30 days | Nothing prompts a second step |
| Sustain | Share of connections still Strong or Steady at 90 days | The network tab is not doing its job |

And two measures of whether the app is healthy for each side:

- **Mentor return rate.** Of mentors who did a chat this month, how many do one next month.
- **Request concentration.** What share of all requests go to the top 10% of mentors. High concentration is the sign of congestion.

Avoid measuring time in app, swipes or matches. They are easy to raise and say nothing about value.

## Feature by feature

### Meet

| Feature | Evidence | Verdict |
| --- | --- | --- |
| **Prompts** | Shared values predict support better than anything else **[A]** (Eby et al., 2013). People expect deep conversation to be awkward and are wrong **[A]** (Kardas et al., 2021) | **Keep, and tilt toward depth.** Favour prompts that reveal how someone thinks about work. Use answers in matching |
| **Liking a prompt with a comment** | A scarce, effortful signal raises acceptance **[A]** (Lee and Niederle, 2015). Askers underestimate how often people say yes **[A]** (Flynn and Lake, 2008) | **Keep.** This is the prototype's strongest feature. Consider making a comment the default path, and a plain like the exception |
| **Endless swipe deck** | Choosing from 24 left people less satisfied than choosing from 6 **[B]** (D'Angelo and Toma, 2017). Restricting choice can help **[B]** (Halaburda et al., 2018) | **Change** to a small daily set. See [02-matching.md](02-matching.md#step-5-build-a-small-daily-set) |
| **"In common" strip** | Perceived similarity is what matters, so showing it raises it **[A]** (Eby et al., 2013) | **Keep, and lead with the reason for the match** |
| **Capacity ("2 spots left")** | Congestion discourages users and reduces matches **[A]** (Chen, Hsieh and Lin, 2023) | **Keep, and make it affect ranking.** Today it is display only |
| **Filters** | Having input into the match improves the relationship **[B]** (Allen, Eby and Lentz, 2006) | **Keep.** Watch for filters that leave a user with nobody |
| **Match celebration** | No direct evidence | **Keep, and change the main button.** "Propose a coffee chat" is already first. Go further and open the time picker directly **[H]** |
| **Bring a friend** | No evidence found | **Unknown.** Plausibly lowers the fear of asking. Test before investing **[H]** |
| **40% random match** | None. It is a demo device | **Replace** with the reciprocal score when matching is rebuilt |

### Messages and coffee chats

| Feature | Evidence | Verdict |
| --- | --- | --- |
| **Coffee proposal with time slots** | Asking people to write down a date *and time* raised follow-through by 4.2 points over a 33% baseline. A date alone did not help **[A]** (Milkman et al., 2011). That study was about flu shots | **Keep.** Picking a specific slot is the mechanism the study found effective |
| **No reminders** | Text reminders improve attendance across 21 studies of medical appointments **[A]** (BMJ Open, 2016) | **Add** a reminder the day before and an hour before. Evidence is from healthcare, so test it |
| **No goal or agenda** | Pairs who set goals report better relationships **[B]** (Allen, Eby and Lentz, 2006). Deeper conversations go better than expected **[A]** (Kardas et al., 2021) | **Add** one line to the proposal ("What I'd like to get from this") and three suggested questions |
| **Mock auto-replies** | Demo only | No change |
| **Reply-rate display** | Askers underestimate willingness to help **[A]** (Flynn and Lake, 2008) | **Add** "Usually replies within 2 days" to profiles |

### Feedback and trust

| Feature | Evidence | Verdict |
| --- | --- | --- |
| **Private check-in** | Public ratings inflate over time because raters do not want to harm the person rated **[A]** (Filippas, Horton and Golden, 2022) | **Keep private.** This is the right design |
| **Nothing goes back to the mentor** | A thank-you more than doubled repeat helping, by making helpers feel valued **[A]** (Grant and Gino, 2010) | **Add a thank-you note.** The mentee writes one line during check-in and it is delivered to the mentor. This is the single best-supported change in this document |
| **No next step for the mentee** | Goal-setting improves mentoring relationships **[B]** (Allen, Eby and Lentz, 2006) | **Add** "One thing I'll do next" to the check-in, and ask about it two weeks later |
| **Quick tags** | No direct evidence | **Keep.** Add positive tags a mentor would want to hear, and include them with the thank-you |
| **Account warning notice** | No direct evidence | **Keep the gentle tone.** Measure whether people who receive it improve or leave **[H]** |
| **Report and block** | Standard practice | **Keep separate from ratings**, as now |

### Network and connection strength

| Feature | Evidence | Verdict |
| --- | --- | --- |
| **Strength fades with time since contact** | Friendships lose closeness when contact drops, more than family ties do. The study followed 25 students, so treat it as preliminary **[B]** (Roberts and Dunbar, 2011) | **Keep** the mechanism |
| **"Dormant" shown as a brown curled leaf** | Dormant ties gave advice as useful as current ties, and reconnecting a once-strong tie brought the benefits of both weak and strong ties **[A]** (Levin, Walter and Murnighan, 2011) | **Change the picture.** A dead leaf says the relationship is gone. The evidence says it is waiting. Draw it as a bud or a seed, and call it "Resting" |
| **Nudges ordered by time** | People choose to reconnect with those they were closest to, which are not the most valuable choices **[B]** (Walter, Levin and Murnighan, 2015) | **Change.** Order nudges by likely value: someone who has changed job, city or field since you last spoke knows things you do not |
| **Nudge wording** | People underestimate how much being contacted is appreciated, most of all when it is unexpected **[A]** (Liu et al., 2022) | **Change.** Say so: "People are usually glad to hear from someone after a while" |
| **"Strong" as the goal** | Moderately weak ties did most for job mobility in an experiment across 20 million LinkedIn users **[A]** (Rajkumar et al., 2022) | **Rethink.** A network of only strong ties is not the aim. Show breadth as well as strength |
| **Map** | No direct evidence | **Keep.** It is the brand. Add a view of what the network lacks, by industry or city **[H]** |
| **Private notes** | No direct evidence | **Keep** |

The fourth and fifth rows change the story the Network tab tells. Today it says "keep everything green." The research supports "keep a few close, stay loosely in touch with many, and do not be shy about reviving old ones."

### Events and groups

| Feature | Evidence | Verdict |
| --- | --- | --- |
| **Events** | Cross-group friendships depend on two things: being exposed to people unlike you, and then befriending them **[C]** (Chetty et al., 2022, from press coverage) | **Keep.** Events provide exposure. They do nothing yet about the second part |
| **Guest list with profiles** | Same | **Keep, and add** "three people to meet at this event," chosen by the matching score |
| **Community groups** | Female peer mentors kept women in engineering when male mentors did not **[A]** (Dennehy and Dasgupta, 2017) | **Keep, and connect to matching** as an opt-in preference |
| **After an event** | No direct evidence | **Add** a prompt the next day: "Who did you meet?" which creates connections **[H]** |

### Onboarding and profile

| Feature | Evidence | Verdict |
| --- | --- | --- |
| **Student / Alum as the main choice** | Peers and near-peers are real sources of support **[B]** (Kram and Isabella, 1985) | **Change** to asks and offers. See [01-roles.md](01-roles.md#7-proposal-one-model-three-modes) |
| **Intentions** | Mentoring has distinct career and psychosocial functions **[B]** | **Change.** Split into what I'm looking for and what I can offer |
| **Alumni onboarding copy** | Mentoring benefits mentors, and telling them aids recruitment **[A]** (Ghosh and Reio, 2013) | **Add** one screen for alumni that says so |
| **Pause my profile** | Congestion evidence **[A]** | **Keep** |

## Experiment backlog

Ordered by evidence strength against cost. Each is written as a testable claim.

| # | Change | We expect | Measure | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Thank-you note delivered to the mentor | More mentors do another chat the following month | Mentor return rate | **A** |
| 2 | Reciprocal, capacity-aware ranking | More requests accepted. Requests less concentrated | Acceptance rate, request concentration | **A** |
| 3 | Daily set of six, replacing the endless deck | Fewer likes, but more of them become chats | Good chats per user | **B** |
| 4 | Goal line and suggested questions on proposals | More chats rated well | Share rated well by both | **B** |
| 5 | Reminders before a chat | Fewer no-shows | Show-up rate | **A**, other domain |
| 6 | "Resting" leaf and value-based nudges | More dormant ties contacted | Reconnection rate | **A** |
| 7 | Reassuring nudge wording | More nudges acted on | Nudge action rate | **A** |
| 8 | Reply-rate line on profiles | More first requests from new students | Requests in a student's first week | **A** |
| 9 | "Three people to meet" at events | More connections made per event | New connections within 48 hours | **C** |
| 10 | Bring a friend | More first chats among students who had done none | First-chat rate | **H** |

### Testing in a two-sided app is harder than it looks

In an ordinary A/B test, half the users get the change and half do not. That breaks down here, because the two halves share the same mentors. If the test group gets better matches, they use up mentor capacity that the control group would have had. Studies of marketplace experiments find this kind of interference can distort a result by anything from a third of the true effect to the whole of it. **[B]**

What to do instead:

- **Randomise by school or by community group,** so that the people being compared do not compete for the same mentors.
- **Alternate over time.** Run the change for a week, switch it off for a week, and compare.
- **At small scale, do not run statistical tests at all.** With one school and a few hundred users, interviews and watching people use the app will teach more than any split test.

## Our own user research

Published research gets us to good guesses. Only our users can confirm them. A first round needs about fifteen conversations.

**Who:** five students who want mentors, five alumni who would mentor, and five students who would mentor younger students.

**What to ask mentees**

- Tell me about the last time you asked someone you did not know for career advice. What stopped you, or nearly did?
- When you look at this profile, what would make you send a request? What would make you hold back?
- After a good conversation, what did you do next?

**What to ask mentors**

- Why would you say yes to a student? Why would you say no?
- How many of these could you do in a month before it felt like a burden?
- After you help someone, what do you want to hear back?

**What to ask peers**

- Who do you already trade notes with about classes or recruiting? How did that start?
- Would you take advice from someone one year ahead of you differently from someone fifteen years ahead?

**Before building anything:** run the matching by hand. Take twenty students and ten alumni, pair them using the scoring in [02-matching.md](02-matching.md#4-proposed-algorithm) on a spreadsheet, send the introductions by email, and ask both sides how it went. This tests the algorithm's logic for the cost of an afternoon.

## What we still do not know

- Whether one-off chats or continuing relationships give more value for the mentor's time.
- Whether any alumni platform's outcomes have been independently measured. We found only vendor reports.
- Whether "bring a friend" helps.
- Whether findings from dating apps and workplace mentoring carry over to students and alumni at all. This is the largest uncertainty, and the reason the experiment backlog matters more than the citations.
