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
| 2 | **Give alumni something for themselves.** Class-year and city cohorts, "who from your year is in Seattle," and reunion-style events. Community groups are the starting point | 1 | **Agreed. Keep on the plan** |
| 3 | **Bring in existing relationships.** Let people add classmates and contacts they already know, so the Network tab is useful on the first day | 1 | Proposed |
| 4 | **Let a pair opt into a rhythm.** After a good chat, offer a regular check-in and a shared goal, and mark the relationship as ongoing | 3 | Proposed. Lowest priority of the four |
| 5 | **Measure the goals directly.** Count active alumni-to-alumni ties and pairs who meet more than once, not matches | All | Proposed |

The pilot comes first because everything so far rests on research from other settings. It tests the assumption the product depends on: that alumni say yes.

## An open question that shapes all of this

**Who is the customer: the student, the alum, or the school?**

If a school's alumni office adopted Kudzu, verification, the alumni list and the cold-start problem would all get easier, and "keep our network connected" is their goal as well. If it grows student by student, goal 2 leads and goal 1 has to be earned later.
