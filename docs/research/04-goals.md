# 4. Are we meeting our goals?

A step back from features. This file states what Kudzu is for, judges the current demo against that, and lists what to do next. Update it whenever the answer changes.

## The goals

1. **Keep a school's alumni network connected.**
2. **Help people find connections within their alumni network.**
3. **Help people find mentorship through their alumni network.**

## Where the demo stands

The demo shows how the product would work. It uses mocked data and has had no real users, so it has not connected anyone yet. What can be judged is how well the design serves each goal.

| Goal | How well the design serves it | Why |
| --- | --- | --- |
| **2. Finding connections** | Strongest | Meet, match reasons, prompt likes, mutual connections and events all serve this |
| **3. Finding mentorship** | Good for starting, thinner for sustaining | Matching and the first chat are well covered. The Network tab keeps the relationship alive afterwards, but treats a mentor like any other connection |
| **1. Keeping the network connected** | Weakest | Little is built for alumni staying in touch with each other, and the Network tab starts empty |

## The gaps

### Alumni have little reason to open it for themselves

The app is built around students finding alumni. An alum who opens it mostly sees students to help. Their own classmates, teammates and former colleagues are not there unless they happen to match. This is goal 1, and it is the least served.

### The network starts empty

Strength leaves and nudges are the app's best idea, but they only work once connections exist. A new user has nothing to keep alive.

### Mentorship has no rhythm of its own

The Network tab does sustain relationships after a first chat: leaves show a tie fading, nudges prompt contact, and each connection has a timeline, notes and a way to propose coffee. Two things are missing:

- **Nothing marks a relationship as a mentorship.** A mentor and someone met once at an event are handled the same way.
- **Nudges are reactive.** They fire once a tie is already fading, at about three months. Research on formal mentoring found better relationships where pairs met regularly and set goals (Allen, Eby and Lentz, 2006 **[B]**).

This is a smaller gap than the other two.

## What to do next

| # | Step | Serves goal | Status |
| --- | --- | --- | --- |
| 1 | **Run a pilot by hand.** Pair about twenty students with ten alumni from one school on a spreadsheet, introduce them by email, and ask both sides how it went | All | Not started. Do this before building more |
| 2 | **Give alumni something for themselves.** Class-year and city cohorts, "who from your year is in Seattle," and reunion-style events. Community groups are the starting point | 1 | **Built.** Class and city cohorts on the Network tab, with class events such as reunions |
| 3 | **Bring in existing relationships.** Let people add classmates and contacts they already know, so the Network tab is useful on the first day | 1 | **Built.** "I know them" at sign-up, on the Network tab, in cohorts and on profiles |
| 4 | **Let a pair opt into a rhythm.** After a good chat, offer a regular check-in and a shared goal, and mark the relationship as ongoing | 3 | **Partly built.** The rhythm is built. A shared goal is not |
| 5 | **Measure the goals directly.** Count active alumni-to-alumni ties and pairs who meet more than once, not matches | All | Proposed |

The pilot comes first because everything so far rests on research from other settings. It tests the assumption the product depends on: that alumni say yes.

## What was built for steps 2 and 3

**Cohorts.** Two slices of your school that you belong to without joining anything:

- **Your class.** Your own year for students. Two years either side for alumni, because a single graduating year is too small a group once people scatter.
- **Your city.** Everyone from your school living where you do, with a switcher for other cities.

Each shows who is there, how many are already in your network, where your class has ended up, and events for that group. Events can now be tagged for a range of class years, which is how reunions appear.

**People you already know.** A person can mark someone as "I know them" and say roughly when they last talked. That answer dates the relationship, so it starts with the right leaf instead of looking brand new.

- Offered during sign-up, from the Network tab, inside cohorts and on any profile.
- Suggestions come from your class, your major, shared groups and mutual connections.

### Decisions made, and why

- **No LinkedIn import.** As far as we know, LinkedIn does not let outside apps read a user's connections. This was not re-checked. It would also bring in mostly people from outside the school, which Kudzu is not for.
- **Asking "when did you last talk?"** A list of names with no dates would all look the same. One question gives the Network tab something true to show on the first day.

### Limits

- **No confirmation step.** In the demo, marking someone as known adds them at once. A real app must ask the other person to confirm, or anyone could claim to know anyone and gain the ability to message them.
- **Cohorts are only as good as the school's membership.** With few people from a class on the app, a class cohort is nearly empty. This is the cold-start problem again.
- **Only class and city.** Major, sports teams, clubs and dorms are other natural cohorts. Community groups cover some of this by hand.

## From a chat to a relationship

A concern raised after the cohorts work: the coffee chat felt short-term. A match went straight into the network, and nothing after the first chat helped the relationship grow. Three changes address it.

### 1. A place in the web is earned

A match used to count as a connection. The network filled with people the user had never spoken to.

Now someone joins the web only after a real exchange: a coffee chat, an event attended together, or being marked as someone the user already knew. Until then they appear under "Not in your web yet," with a prompt to propose coffee. Mutual connections, network gaps and cohort counts all use the web, not the list of matches.

### 2. Every good chat ends with "what next?"

When a check-in says the chat happened and went well, it asks how the user wants to keep in touch: monthly, each semester, or no set rhythm. A chosen rhythm produces a nudge when the next catch-up is due. This is proactive. The older nudges only fire once a tie has started to fade.

This follows the finding that mentoring pairs who met regularly and set goals reported better relationships (Allen, Eby and Lentz, 2006 **[B]**). The goal half of that finding is not built.

### 3. Closeness is a score

Strength used to be a rule: so many days since last contact, and the leaf changed. It ignored what the contact was.

Closeness is now the sum of every interaction, where each one counts according to three things:

| What | How it counts |
| --- | --- |
| **The kind of interaction** | Coffee chat 1.0 · knew each other before 0.8 · event together 0.6 · thank-you 0.5 · message 0.35 · match 0.1 |
| **How it went** | A coffee chat rated well counts 1.3 times. One rated poorly counts half |
| **How long ago** | Every contribution halves each 60 days |

Messages are capped, so a long text thread never outweighs meeting in person. The four leaf states are bands of the total: Strong at 0.7 and above, Steady from 0.35, Fading from 0.15, Dormant below.

What this changes in practice:

- **Several small contacts can hold a tie** that one old coffee chat could not.
- **A good chat lasts longer than a poor one.**
- **Each connection's page shows what its closeness is based on,** so the leaf is never a mystery.

The score is not random. The same history always gives the same result.

### What is guessed

All of the numbers above are our judgement: the weights, the 60-day half-life, the cap on messages and the bands. None comes from a study. The research supports the shape (ties weaken without contact, Roberts and Dunbar, 2011 **[B]**) and not the values. They should be tuned against what users say about which relationships feel close.

### Still missing

- **Small ways to keep in touch.** A congratulation or a shared link is still just a message. One-tap actions for these would make staying in touch easier than scheduling coffee.
- **Closing the loop on advice.** A mentee noting what they will do, then being brought back to say how it went.
- **A shared goal** for an ongoing mentorship.
- **Both people agreeing to a rhythm.** Today it is one person's private reminder.

## An open question that shapes all of this

**Who is the customer: the student, the alum, or the school?**

If a school's alumni office adopted Kudzu, verification, the alumni list and the cold-start problem would all get easier, and "keep our network connected" is their goal as well. If it grows student by student, goal 2 leads and goal 1 has to be earned later.
