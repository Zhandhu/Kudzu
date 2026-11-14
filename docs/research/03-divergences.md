# 03. Where the research disagrees with us, and what to do

How to use this file. Each item below is one decision, written so it can be made in about a minute: read "What we do now", the strength of the case, and the recommendation. The summary table lists every item with the strongest cases first, and the items follow in the same order. Several choices were made for safety, product identity or to keep the demo simple, and a missing study is not treated here as a reason to change.

Grades follow the [README](README.md#how-strong-is-the-evidence): A, B, C or H. All sources are in [01-need.md](01-need.md), [02-choices.md](02-choices.md) and their source lists. No new sources were added. Facts about the app were checked against the demo code and its tour text.

## Summary

| # | Issue | Case for changing | Recommended option | Cost |
| --- | --- | --- | --- | --- |
| 1 | Closeness fades too fast, at one rate for everyone | Strong | Fade against the rhythm set for each person, with a slow default | Medium |
| 2 | Dormant ties are drawn as dead | Strong | Redraw and reword dormant as "resting", and keep suggesting old ties | Small |
| 3 | We promise outcomes the evidence does not show | Strong | Reword the pitch and the demo script | Small |
| 4 | The Verified badge carries the pitch | Moderate | Keep the badge, rest the claim on the closed membership | Small |
| 5 | A call counts less than meeting, and off-app less than in-app | Moderate | Raise a call to near in person, and drop the off-app discount | Small |
| 6 | The reason we give for a short list | Moderate | Keep the short list, change the reason we give | Small |
| 7 | Written requests to strangers | Moderate | Keep the request, remove any promise of a yes | Small |
| 8 | Events are assumed to create new ties | Moderate | Show who you know that is going, and stop claiming new ties | Small |
| 9 | Requests expire after ten days | Moderate | Make expiry soft: tell the sender, keep the request answerable | Small |
| 10 | Reminders are untested | Weak | Keep, add an off switch for each kind, and run the comparison | Small |
| 11 | A closeness state may feel like a duty | Weak | Keep as is, and measure | None |
| 12 | Announcements and notification frequency | Weak | Keep as is | None |
| 13 | The 50-person event chat limit | Weak | Keep as is | None |
| 14 | "People you already know" is required at sign-up | Weak | Keep as is, and test required against optional | None |
| 15 | The network map | Weak | Keep as is | None |

## Claims to stop making

The first four are in the demo today. The rest are claims a pitch could easily make, and the evidence does not support them.

| Where | What we say now | Why it is not supported | Safer wording |
| --- | --- | --- | --- |
| README, opening | Verification "is what lets people answer a message from someone they have not met" | No study shows verification raises replies (H). Badge studies found no effect on credibility (B) | "Every member is checked by the school, so a message always comes from a real student or graduate." |
| Tour, "Every account is verified" | "So you always know who you are talking to" | We check membership, not everything about a person | "So you know every member is a real student or graduate of the school." |
| Tour, "Send it" | "Each person takes only a few requests a month, so the ones they get are answered" | We do not know our reply rate. Text requests to strangers do worse than senders expect (B) | "Each person takes only a few requests a month, so nobody is flooded." |
| Demo script, thank-you step | "Research shows a thank-you is what brings a mentor back" | The experiments were not on mentoring, and thanks is one cause, not the cause (A for the effect in other settings). It also uses "mentor", a label the app avoids | "In experiments, people who were thanked were more likely to help again." |
| Tour, closeness step | "You get a reminder before a friendship lapses" | A quiet friendship has not lapsed. Old ties stay valuable (A) | "You get a reminder when it has been a while." |
| Pitch | A short list is better because too many options overwhelm people | The average choice-overload effect is near zero (A) | "A short list spreads requests, so the same few people are not asked by everyone." |
| Pitch | People will say yes more often than you expect | Shown for requests in person (A). The opposite was found over email (B) | For old friends only: "People are usually more glad to hear from you than you expect." |
| Pitch | Only 9% of graduates find their alumni network helpful, so alumni lose touch | The survey asked about help in the job market, not about staying in touch (C) | "In one US survey, 9% of graduates said their alumni network helped them in the job market." |
| Pitch | The app improves wellbeing, health or careers | The wellbeing evidence is not causal. Mentoring effects are small (A). No alumni app has been evaluated (H) | "The app makes it easier to stay in touch. We will measure whether it works." |
| Pitch | Events help you meet new people | Guests at a mixer mostly talked to people they knew (B) | "Events are a reason to see people you know, and the chat helps you find them." |

## 1. Closeness fades too fast, and at one rate for everyone

**What we do now:** Every contact loses half its value every 60 days, for every relationship. By our own arithmetic from the demo code, a friend you meet once shows as "fading" after about three months and "dormant" after about five and a half months.

**What the research says:** People contact their closest 5 friends about weekly and the next 15 about monthly, and wider ties far less often [B, Sutcliffe, Dunbar and others 2012, read as a summary]. Closeness does fall when contact falls, but the one study that followed it ran for 18 months with 25 students and gives no rate [B, Roberts and Dunbar 2011]. The 60-day figure is our own guess [H]. By the same arithmetic, a friend you see once a year would show as dormant for more than half of each year [H, our calculation].

**How strong is the case for changing:** Strong, because the number has no source and one rate cannot fit ties that are kept weekly, monthly and yearly.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | One 60-day half-life | None | Most real friendships show as fading or dormant. Users may stop trusting the map |
| Slow the single rate | One longer half-life for everyone | Small | Still wrong for close friends, who would look fine after months of silence |
| Fade against the chosen rhythm | Each person is judged against the rhythm the user set (monthly, each semester, and a new yearly choice). Ties with no rhythm fade slowly | Medium | Users must set a rhythm for it to work well. The default still needs a number we do not have |

**Recommendation:** Change the fade to follow the rhythm set for each person, add a yearly rhythm, and use a much slower default until we have our own data.

## 2. Dormant ties are drawn as dead

**What we do now:** A dormant tie is a brown, curled leaf with a faint dashed vine, and the tour says "yellow and brown mean it has gone quiet". The app sends a "worth reconnecting?" reminder for a dormant tie only up to about nine months of silence, then stops.

**What the research says:** Advice from people you have lost touch with compared well with advice from current contacts [A, Levin, Walter and Murnighan 2011, executives in MBA classes]. The most valuable reconnections were with people the person had spent less time with, not the ones they thought of first [B, Walter, Levin and Murnighan 2015, executives]. Most people have an old friend they still care about, and contact from an old friend is appreciated more than senders expect [A, Aknin and Sandstrom 2024; A, Liu and others 2022]. 01-need.md already says the app should "treat a quiet friendship as worth reviving, not as lost".

**How strong is the case for changing:** Strong, because the picture and the nine-month cut-off say the opposite of our own stated requirement, and the fix is cheap.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Brown curled leaf, no reminders after nine months | None | Tells users their oldest ties are dead, which may add to the fear of reaching out |
| Redraw and reword | Dormant becomes "resting": a bud or a calm colour, with the hint "ready to revive". The add-a-person screen already uses that phrase | Small | The map shows less contrast between states |
| Redraw, and keep suggesting old ties | As above, and now and then suggest one long-quiet person with a reason to write | Small | More reminders. Must stay rare (see item 10) |

**Recommendation:** Redraw and reword dormant as resting, and replace the nine-month cut-off with an occasional suggestion of one long-quiet person.

## 3. We promise outcomes the evidence does not show

**What we do now:** The research case links the app to wellbeing, careers and help from alumni, and a pitch can easily turn those links into promises. The demo script says research shows a thank-you "is what brings a mentor back".

**What the research says:** Mentoring effects are positive but small [A, Eby and others 2008, meta-analysis]. The 9% figure measured help in the job market, not staying in touch [C, Strada-Gallup 2018 survey]. The link between relationships and survival comes from observational studies, and the authors say cause is not established [A, Holt-Lunstad and others 2010]. No independent evaluation of an alumni keep-in-touch app was found [H].

**How strong is the case for changing:** Strong, because these are claims we make to other people, and a careful listener can check them.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Pitch and script unchanged | None | A partner school or funder finds the gap and trusts the rest less |
| Reword | Use the safer wording in "Claims to stop making". Promise easier contact, not better lives | Small | The pitch sounds more modest |

**Recommendation:** Reword the pitch and the demo script to promise easier contact and a plan to measure it, and nothing more.

## 4. The Verified badge carries the pitch

**What we do now:** Every member is checked by school email or the alumni office, and every profile shows a "Verified" badge. The tour and the README present verification as the reason people will answer a stranger.

**What the research says:** Two online studies found that a verified badge did not raise the credibility of a post [B, Vaidya and others 2019], and a 2024 survey experiment found the same for health posts [B]. Fewer than half of users noticed the badge in a regulator's study [C, Ofcom 2025]. All of this is from public social media, where a badge marks a well-known account, so it may not carry over. Theory and one field study support the gate itself: proof from a third party shapes impressions, and people who share a group identity get more help [B, Walther and Parks 2002; B, Levine and others 2005].

**How strong is the case for changing:** Moderate, because the feature is sound but the claim rests on the part with no support, and a badge on every profile tells the reader nothing new.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Badge on every profile, pitch leans on it | None | The main selling point is the least supported part |
| Keep the badge, move the claim | The badge stays as a quiet mark. The pitch says "a closed membership, checked by the school" | Small | None of note |
| Make the badge say something | Show class year and how the person was checked, in place of one word | Small | Slightly more text on each profile |
| Remove the badge | Rely on the gate alone | Small | Loses a safety cue that schools and users may expect. "Pending" accounts still need a mark |

**Recommendation:** Keep the badge, and rest the claim on the closed, school-checked membership.

## 5. A call counts less than meeting, and off-app contact counts less than in-app

**What we do now:** A logged call counts three quarters of a logged meeting. Any contact logged by hand counts a little less than the same contact made through the app, because nobody else confirms it. The app is also inconsistent with itself here: a coffee chat arranged through the app counts in full whether it is held in person or by video call, so the same video call counts 1.0 when it was scheduled in the app and about 0.68 when it was logged by hand afterwards.

**What the research says:** People who reconnected with an old friend by phone felt closer than those who used email, and it was no more awkward [B, Kumar and Epley 2021; 02-choices.md also lists this paper as A]. In talk between strangers, video added nothing over voice alone [same paper]. Offline activity is tied to the closest relationships [B, Sutcliffe, Dunbar and others 2012]. No study compared meeting in person with a call, so our order is a guess [H].

**How strong is the case for changing:** Moderate, because the evidence puts voice close to richer contact, and nothing supports counting off-app contact for less.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Call at 0.75 of a meeting, off-app at 0.9 of in-app | None | Long-distance friends who call often look less close than they are |
| Raise the call | A call counts nearly as much as meeting. Text stays lowest | Small | In person against a call is untested, so this is also a guess |
| Raise the call and drop the off-app discount | As above, and logged contact counts the same as in-app contact | Small | Relies on honest logging. The state is private, so there is little reason to cheat |

**Recommendation:** Raise a call to near the weight of meeting, and drop the off-app discount.

## 6. The reason we give for a short list

**What we do now:** There is no browsing. A person says what they need and sees about four people.

**What the research says:** A meta-analysis of 50 experiments found the average effect of "too many options" was almost zero [A, Scheibehenne and others 2010]. A later one found an effect when the task is hard and people are unsure what they want [A, Chernev and others 2015, read as a summary]. One dating study found people less satisfied after choosing from 24 profiles than from 6 [B, D'Angelo and Toma 2017, dating]. Spreading recommendations so they do not pile up on a few people gave more matches in a field experiment [A, Chen, Hsieh and Lin 2023, dating]. "Four" has no source [H].

**How strong is the case for changing:** Moderate for the reason we give, and weak for the feature, because the short list has good support on other grounds.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Four people, explained as "less overwhelming" | None | We defend a good choice with a disputed reason |
| Keep the list, change the reason | Same screen. We say it spreads requests and protects popular people | Small | None of note |
| Show more people | A longer list or a "show more" button | Small | Requests pile up on a few people, which is the better-shown harm |

**Recommendation:** Keep the short list, and say it exists to spread requests.

## 7. Written requests to strangers

**What we do now:** A request is one written line to one person, with a topic. The other person answers yes, later or no in one tap.

**What the research says:** Over email, people overestimated how well a request to a stranger would work [B, Roghanizad and Bohns 2017, 45 requesters, read as a summary]. The well-known result that people underestimate how often others say yes was found for requests in person [A, Flynn and Lake 2008]. A scarce, costly signal raised acceptance in a field experiment [A, Lee and Niederle 2015, a dating site]. No study was found on shared college and reply rates [H].

**How strong is the case for changing:** Moderate for what we say, and weak for the feature, because text is the only practical way to ask in an app.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Written request, current wording | None | Senders expect a yes and are let down |
| Keep the request, remove any promise | No wording that suggests a request will be answered or accepted. Keep "we will tell you and suggest someone else" | Small | None of note |
| Add a voice note | The sender can record a short spoken request | Large | Raises safety and moderation work. Untested for requests |

**Recommendation:** Keep the written request, and remove any wording that promises an answer.

## 8. Events are assumed to create new ties

**What we do now:** Events have a short group chat for people who are going. The tour does not claim that events create new ties, but the feature is easy to pitch that way.

**What the research says:** At a mixer, guests mostly talked to people they already knew, though they said they came to meet new people [B, Ingram and Morris 2007, one mixer, not re-checked]. No study was found on whether a chat before an event changes this [H].

**How strong is the case for changing:** Moderate, because one study points clearly against the assumption, and the cheaper use of events also fits our main purpose of staying in touch.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Event page and chat as built | None | We count events as a source of new ties and they are not |
| Show who you know | The event page leads with "people you know who are going" | Small | Events look less useful to someone with a small network |
| Add one introduction | Before the event, suggest one person to meet, with a reason | Medium | Untested. Could feel forced |

**Recommendation:** Show who you know that is going, and describe events as a way to see people again.

## 9. Requests expire after ten days

**What we do now:** A request lapses after ten days. The sender is told and shown who else could help.

**What the research says:** In a field experiment, no deadline got the most responses, one week came next and one month got the fewest [B, Knowles and others 2022]. That study was about a survey for charity, not a personal request, and the rates were seen only in a summary. A signal of who has capacity cut refusals on a job market [B, Horton 2019]. No study was found on expiry of requests between people [H].

**How strong is the case for changing:** Moderate, because the evidence is one study from another setting, but a version exists that keeps the benefit and removes the risk.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | The request closes at ten days | None | A late yes is lost |
| Soft expiry | At ten days the sender is told and shown others, and the request stops counting toward the limit of five. The other person can still answer | Small | Old requests stay in the receiver's list |
| No expiry | Requests stay open until answered | Small | The sender waits with no news. This is the reason expiry was added |

**Recommendation:** Make the expiry soft, so the sender can move on and a late yes still counts.

## 10. Reminders are untested

**What we do now:** The app reminds people on a rhythm they chose, when there is a timely reason, and when a tie has gone quiet. Each reminder names a person, and some carry a drafted first line. The last two kinds are not timed by the user.

**What the research says:** No trial shows that a reminder to contact a friend works [H]. Two small trials of apps that prompted reflection found no change in loneliness [B, Nguyen and others 2025, 29 students; B, Harkin and others 2025, 99 older adults], and neither tested a reminder to write to a named person. In the first, 18% of prompts were answered and users wanted to choose the time. Reminders do raise clinic attendance, where the person has already agreed a date [A, Robotham and others 2016, health]. A warm-up of messaging current friends first raised messages to old friends from 31% to 53% [A, Aknin and Sandstrom 2024].

**How strong is the case for changing:** Weak, because nothing tested our kind of reminder, and the barrier it targets is well shown.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Three kinds of reminder | None | Untimed prompts may be ignored |
| Keep, add an off switch for each kind | The user can turn off "timely reason" and "gone quiet" reminders and keep the rhythm they chose | Small | Fewer reminders sent |
| Add a warm-up | Suggest a current friend first, then an old one | Medium | Tested once, in a study, not in an app |
| Remove reminders | The map alone shows who is quiet | Small | Removes the feature that targets the best-shown barrier |

**Recommendation:** Keep reminders, add an off switch for each kind, and compare users who get them with users who do not.

## 11. A closeness state may feel like a duty

**What we do now:** Each person has a state (strong, steady, fading, dormant) that only the user sees. It needs no daily action.

**What the research says:** A shared streak count on Snapchat created a sense of duty to keep contact going [B, Hristova and others 2022, read as a summary]. A survey of 2,483 young teenagers found only weak links [B, van Essen and Van Ouytsel 2023, read as a summary]. Both are about teenagers and a daily count that two people share. No study tests a private state like ours, and we found no evidence either way on whether "fading" motivates or causes guilt [H].

**How strong is the case for changing:** Weak, because the evidence is from a different kind of feature and our state was built to avoid its main risks.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Private state in words and colours | None | Unknown. Guilt is possible |
| Soften the words | Rename "fading" to something like "been a while" | Small | Less clear |
| Let users hide it | A setting that turns the state off | Medium | Removes the main reason to open the map |

**Recommendation:** Keep as is, never show a number or a streak, and measure whether seeing "fading" brings people back.

## 12. Announcements and notification frequency

**What we do now:** A class or a city gets one-way announcements a few times a year, each as a notification. Notifications are meant to be rare. Announcements do not count toward closeness.

**What the research says:** Broadcast posts were not linked to wellbeing, while personal messages were [B, Burke and Kraut 2016, public social media]. Reading a friend's broadcasts was linked to growing closeness [B, Burke and Kraut 2014]. Even one push a week led about 10% of users to turn notifications off [C, vendor data]. After a day with notifications off, people felt less connected to their group [B, Pielot and Rello 2017].

**How strong is the case for changing:** Weak, because the evidence pulls both ways and the current design already sits between the two risks.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | A few announcements a year, as notifications | None | "Rare" could drift to "none", or to too many |
| Allow replies | Turn announcements into group chats | Large | Thousands of people in one chat. This is why they are one-way |
| Send more often | Monthly announcements | Small | More people turn notifications off |

**Recommendation:** Keep as is, and never count an announcement as staying in touch.

## 13. The 50-person event chat limit

**What we do now:** An event chat is open only to people going, for a limited time, and no event above 50 people gets one.

**What the research says:** Spontaneous conversations top out at about four people [B, Dunbar, Duncan and Nettle 1995, face-to-face talk]. In public live-stream chat, each person took part less once the message rate passed about 40 per five minutes [B, Nematzadeh and others 2019, strangers online]. That limit is a message rate, not a head count. The number 50 has no source [H].

**How strong is the case for changing:** Weak, because no study gives a better number, and a cap is a sensible safety and noise limit.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | No chat above 50 people | None | The number is a guess |
| Lower the cap | For example 20 or 30 | Small | Also a guess. Fewer events get a chat |
| Limit by message rate | Slow the chat when it gets busy | Medium | More to build, for evidence from another setting |

**Recommendation:** Keep as is, and call 50 a starting value.

## 14. "People you already know" is required at sign-up

**What we do now:** Sign-up has three required parts: school, current career, and people you already know.

**What the research says:** New members who saw friends active went on to share more [B, Burke, Marlow and Lento 2009, observational, about posting]. Vendor tests of form length disagree with each other [C]. No peer-reviewed study of sign-up length was found [H].

**How strong is the case for changing:** Weak, because there is no evidence in either direction, and an empty network is a real problem the step solves.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | The step is required | None | Some people leave at this step |
| Make it optional | The step can be skipped and offered again later | Small | More people start with an empty map |

**Recommendation:** Keep as is, and test required against optional with the first real users.

## 15. The network map

**What we do now:** The network is drawn as a map with a vine to each person, greener and thicker when closer.

**What the research says:** One design paper describes a similar picture and reports no user results [B, Shannon, Kenny and Quigley 2009]. A 2023 study found people liked a picture of their own network but needed a trained person to explain it [B]. No study shows that seeing your network changes whom you contact [H].

**How strong is the case for changing:** Weak, because the map is the product's identity and nothing points against it. The list view already covers people who find the map hard to read.

| Option | What it means in the app | Cost to build | Risk |
| --- | --- | --- | --- |
| Keep as is | Map first, list one tap away | None | Some users may not understand the map |
| Open on the list | List first, map one tap away | Small | Loses what makes the app look different |

**Recommendation:** Keep as is, and do not claim that the map changes behaviour.

## What we should measure first

1. How often real users contact each person, by ring of closeness. Record the gap between contacts for each tie over the first months. This gives us our own fade rate and settles item 1. It also shows whether calls and logged contact matter as much as meetings (item 5).
2. Whether seeing "fading" or "resting" brings people back. Compare return visits and messages sent after a user sees a quiet tie, with the old and the new wording. This settles items 2 and 11.
3. Whether reminders lead to messages. Give reminders to some users and not to others, and count messages sent and contact revived. This settles item 10, and it would be the first published evidence of its kind.
4. Reply rate to requests, with hard expiry against soft expiry. Also record how many answers arrive after day ten. This settles items 7 and 9.
5. Whom people talk to at events. After each event, ask who they spoke to and whether they knew them before. This settles item 8.

Sign-up completion with "people you already know" required against optional (item 14) is already listed in 02-choices.md and can run at the same time.
