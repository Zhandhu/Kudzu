# The simple app: a scaffold

This is a first pass at a second way to use Kudzu. It is built far enough to click through. It is not finished, and the open questions at the end need answers before it is.

## Who it is for

People who already have a network and are not trying to grow it. Many are older alumni. They want two things:

1. To keep in touch with the people they know.
2. Sometimes, to help a student or a recent graduate.

They do not want to search a school or browse events. They do want the map: seeing where their people are is part of keeping up with them. The full app asks "who do you want to meet?" The simple app asks "who have you not talked to in a while?"

This replaces the earlier idea of "simple" as the same Find page drawn as a list. That changed how results looked, not what the app was for.

## What is built

| Piece | State |
| --- | --- |
| A setting, `experience`, with two values: `full` and `simple` | Built. Saved with the rest of the demo data |
| Choosing it at sign-up | Built. It is the first page after the welcome screen, on its own, with nothing pre-selected. A demo can pick one there and skip the rest: the full app loads the student, the simple app loads the alum |
| Changing it later, under Profile, Settings | Built |
| Four tabs instead of five: Home, Map, Messages, Profile | Built. Find and Events lead to Home |
| The Home screen | Built as a first version, below |
| A switch for "show people I could help" | Built. On Home and in settings. Off shows nobody |

### The Home screen

One screen, three lists, larger type and larger buttons than the full app.

| List | What it shows | Where it comes from |
| --- | --- | --- |
| **Catch up with** | Up to three people to write to now, each with a reason and one button | The same nudges as the full app: a chosen rhythm that is due, someone in town, a new job, a tie that is fading |
| **Help someone out** | Requests sent to you, answered with Yes, Later or Not now. Then up to three people looking for what you offer | Requests, and the same ranking Find uses, limited to people you would be giving back to |
| **Your people** | Everyone you know, with when you last talked. The longest gap comes first. A box to find someone by name | Your network and the closeness score |

Tapping a person in "Your people" opens their page, with notes, history and the rhythm. Tapping someone you could help opens their profile as a floating card.

### What the simple app leaves out

| Left out | Why |
| --- | --- |
| Searching the school | They are not looking for new people |
| Events and groups | Not what they came for |
| Events and groups on the profile | Same reason |
| Matching preferences | Nothing is being matched |

Nothing is deleted. Switching back to the full app brings all of it back, with the same people and messages.

## How the two apps share one product

Both read the same data: the same people, connections, messages, requests and closeness scores. The simple app is a different front door, not a different account. That keeps three things true:

- A student in the full app can ask an alum in the simple app for a chat. The alum sees it under "Help someone out".
- Someone can start simple and switch to full when they change jobs and want to meet people.
- Every improvement to nudges and closeness helps both.

## Open questions

These are decisions, not details. Each changes what gets built next.

| # | Question | Options |
| --- | --- | --- |
| 1 | Who gets the simple app by default? | Ask everyone at sign-up (built). Or suggest it to alumni past a certain class year and let them change it |
| 2 | With helping switched off, can students still find and ask this person? | Yes, they only stop seeing suggestions (built). Or no: off means closed to requests, the same as zero chats a month |
| 3 | How does someone in the simple app add a person they just met? | "Add someone you know" (built). Or also a search of the school by name only |
| 4 | Do they see events at all? | No (built). Or only a class reunion, as one line on Home |
| 5 | How many "catch up with" cards? | Three (built). Research on reminders suggests fewer is better, so one a week is worth testing |
| 6 | Is there a weekly email instead of opening the app? | Not built. For this group it may matter more than the app itself |
| 7 | Should "Your people" be grouped? | One list, longest gap first (built). Or by city, or by how they know them |

## What I would build next

1. Decide question 2. It changes what "help" means for the people asking.
2. A weekly summary: "three people to write to this week", as a mock email. This group is the least likely to open an app unprompted.
3. Done: "We caught up" records a call, a lunch or a text that happened outside the app. It is on each person’s page and on the Home cards.
4. Larger text as a setting, separate from which app is chosen.
