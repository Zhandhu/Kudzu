# 02. The evidence behind each design choice

This file takes the 21 main design choices in Kudzu and asks one question of each: what evidence is there that it is the right choice.

The short answer: 2 choices are well supported, 13 are partly supported, and 6 are our own bets. In most "partly supported" rows the idea has evidence and the exact numbers do not. The 60-day half-life, "about four people", the ten-day expiry and the 50-person limit are all our own guesses. In several places the evidence points against us. Those places are listed near the end and are not hidden.

Grades follow the [README](README.md#how-strong-is-the-evidence): A, B, C or H. After each source, square brackets say how far it was read in this round: Full text, Abstract, Summary, or Not re-checked. "Not re-checked" means the finding was handed over from an earlier round and not opened again. Full citations for new sources are in [sources.md](sources.md). Sources already used in [01-need.md](01-need.md) are in [sources.md](sources.md).

Much of this evidence comes from dating platforms, online job markets, workplaces and health reminders. Almost none comes from alumni or from friendship apps. Each area says where its evidence comes from.

## Summary

| # | Choice | Label |
| --- | --- | --- |
| 1 | Closeness state worked out from real contact, fading over time | Partly supported |
| 2 | Network drawn as a map with a vine to each person | Our bet |
| 3 | Reminders to reach out, each with a drafted first line | Partly supported |
| 4 | "We caught up" log for contact off the app | Partly supported |
| 5 | Thank-you note as the one piece of visible feedback | Well supported |
| 6 | People you already knew can be added at sign-up | Partly supported |
| 7 | Every member verified, with a badge on every profile | Partly supported |
| 8 | No browsing or swiping; about four people shown | Partly supported |
| 9 | One request to one person, with a topic and a line; one-tap answer | Partly supported |
| 10 | Limits on chats, open requests and request lifetime | Partly supported |
| 11 | 1st, 2nd and 3rd degree shown on each suggestion | Partly supported |
| 12 | No "mentor" or "mentee" label | Our bet |
| 13 | Feedback after a chat is private | Well supported |
| 14 | Coffee proposal with two or three specific times and a place | Partly supported |
| 15 | Accept a time, suggest other times, or message | Our bet |
| 16 | Event chat only for people going, time-limited, none above 50 | Partly supported |
| 17 | One-way announcements to a class or a city | Our bet |
| 18 | Announcements as notifications; notifications are rare | Partly supported |
| 19 | A simpler "Keep in touch" app, chosen by the person | Partly supported |
| 20 | Sign-up with three required parts | Our bet |
| 21 | No "match", "swipe" or "like" for people | Our bet |

"Well supported" means at least one grade A source tests the mechanism directly, even if in another setting. "Partly supported" means the idea has grade A or B support but the details, or the move to our setting, do not. "Our bet" means we found no study that tests the choice.

## 1. Keeping in touch

Verdict: partly supported. The reasons for these features are strong. The features themselves are mostly untested, and the two trials nearest to reminders were discouraging.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 1. Closeness state (strong, steady, fading, dormant) from real contact. Coffee counts most, then an event, a thank-you, a message. Each contribution halves about every 60 days | People do not notice a tie fading until it is gone. A visible state gives a reason to act | Closeness can be estimated from contact records: a model on over 2,000 ties told strong from weak with over 85% accuracy (Gilbert and Karahalios 2009) [Not re-checked]. Friendships lose closeness when contact falls (Roberts and Dunbar 2011) [Abstract]. Closer layers of friends are contacted more often: about weekly for the closest 5, about monthly for the next 15 (Sutcliffe, Dunbar and others 2012) [Summary] | B for the idea. H for the weights and the 60-day half-life | Fairly sure that contact tracks closeness. Not sure at all about the numbers |
| 2. A map with a vine to each person, greener and thicker when closer | A picture is quicker to read than a list, and shows who is slipping | One design paper describes a network picture that suggests whom to contact soon. We found no user results for it (Shannon, Kenny and Quigley 2009) [Abstract]. A 2023 study showed people a picture of their own network. They found it useful but needed a trained person to explain it [Summary] | H. The two sources are B but neither tests the effect | Low. No study shows that seeing your network changes whom you contact |
| 3. Reminders: a chosen rhythm, a timely reason, or a tie gone quiet. Each has a drafted first line | People want to reconnect but do not start. The barrier is the first step | Few people message an old friend even when given the chance, and a warm-up raised sending from 31% to 53% (Aknin and Sandstrom 2024) [Full text, in round 1]. Contact is appreciated more than senders expect (Liu and others 2022) [Summary]. Text reminders raise clinic attendance across 21 studies (Robotham and others 2016) [Not re-checked]. Against: two small trials of prompting apps found no effect on loneliness. See "The two reminder trials" below | A for the barrier. H for reminders as the fix | Medium for the reason. Low for the feature |
| 4. "We caught up": two taps to log a call, lunch or text. In person counts almost as much as a coffee, a call less, a text least | Most contact between friends happens off the app. Without a log the closeness state would be wrong | Voice builds a stronger bond than text: people who reconnected with an old friend by phone felt closer than those who used email, and it was no more awkward (Kumar and Epley 2021) [Summary]. Offline activity is tied to the closest relationships (Sutcliffe, Dunbar and others 2012) [Summary] | B for the order (in person and voice above text). H for the exact weights and for self-logging | Medium for the order. Low for whether people will log |
| 5. A thank-you note after a coffee chat is the one feedback the other person sees | Thanks make the helper want to help again. Scores would make helping feel judged | A thank-you more than doubled repeat helping in experiments (Grant and Gino 2010) [Not re-checked]. People who send thanks underestimate how good it feels to receive and overestimate how awkward it is (Kumar and Epley 2018) [Summary] | A | High for the effect of thanks. Medium for our setting |
| 6. People you already knew can be added at sign-up | An empty network gives no reason to return | New members of a large social site who saw friends active went on to share more themselves, in logs of about 140,000 newcomers (Burke, Marlow and Lento 2009) [Summary]. The "seven friends in ten days" retention rule is quoted only in blogs [Summary, grade C] | B | Medium. The study is observational and about posting, not about staying |

What this evidence does not cover:

- No study tests a decaying closeness score shown to the user. Research on Snapchat streaks suggests that a shared score both people must keep up can create a sense of duty (Hristova and others 2022 [Summary]; van Essen and Van Ouytsel 2023, 2,483 young teenagers, weak links [Summary]). Our state is private and needs no daily action, so the risk may be smaller. We have not tested that.
- The reminder evidence that works comes from health appointments, where the person has already agreed to a date. A reminder to write to a friend asks for a new decision. That is a different task.
- The Kumar and Epley study compared phone with email. It did not compare meeting in person with a call. Our ranking of in person above a call is a guess (H).

### The two reminder trials

01-need.md mentions two discouraging trials. We looked at both again. Neither one tested a reminder to contact a friend.

- Nguyen and others (2025), JMIR Formative Research [Full text, all but the last 2%]. 29 students finished (15 in the app group, 14 in a monitoring group). The app asked people to recall a good memory of a relationship and write about it. Prompts were sent when sensors predicted loneliness. There was no significant change in loneliness or connectedness on the main scales. Only 18.17% of 1,205 prompts got a response. Users said they were busy, wanted fewer prompts and wanted to choose the time. Grade B, a small pilot.
- Harkin and others (2025), Aging and Mental Health [Summary]. 99 adults with a mean age of 68, four weeks, app against a waiting list. The app asked people to reflect on their social groups. Reported depression fell. The effect on loneliness was reported as not significant in the summary we saw; we could not confirm the figures. Grade B.

What they tell us: prompts sent at times the user did not choose are mostly ignored. That supports letting the user pick the rhythm. They tell us nothing about whether a prompt with a named person and a drafted line leads to a message. No trial of that was found (H).

## 2. Membership

Verdict: partly supported. Theory supports proof from a third party. Tests of verification badges on public platforms mostly found little effect.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 7. Every member is verified as a student or graduate, by school email or the alumni office. A "Verified" badge is on every profile | A request from a stranger is easier to answer when you know the person really shares your college | Information a person cannot easily change, such as a claim by a third party, shapes impressions more than self-claims (Walther and Parks 2002; Walther and others 2009) [Not re-checked]. Later work complicates this (DeAndrea and Vendemia 2019) [Not re-checked]. Strangers who shared a group identity got more help in a field study (Levine and others 2005) [Not re-checked]. Against: two online studies with 748 and 2,041 people found that a verified badge did not raise the credibility of a post (Vaidya and others 2019) [Summary]. A 2024 survey experiment with 534 adults found the same for health posts [Summary]. A regulator's study found fewer than half of users noticed the badge (Ofcom 2025, grade C) [Summary] | B for the gate. H for the badge | Medium that a closed, checked membership helps. Low that the badge itself adds anything |

What this evidence does not cover:

- No peer-reviewed test was found showing that identity verification raises trust or reply rates on a platform. Vendor surveys say it does (grade C).
- The badge studies are about news and posts on public social media, where the badge marks a well-known account. Ours marks membership of a closed group. The result may not carry over in either direction.
- No study was found that tests whether a shared college raises replies to a message. If every profile has the badge, the badge carries no information. The real effect, if any, comes from the gate.

## 3. Reaching someone new

Verdict: partly supported. The best evidence is from dating platforms and online job markets. It supports limits and capacity signals more clearly than it supports a short list.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 8. No browsing and no swiping. You say what you need and see about four people | Browsing turns people into a catalogue and sends most requests to a few popular people | Choosing from 24 dating profiles left people less satisfied a week later than choosing from 6, n = 152 (D'Angelo and Toma 2017) [Not re-checked]. Two theory papers show that limiting choice can raise welfare on matching platforms (Halaburda and others 2018; Kanoria and Saban 2021) [Not re-checked]. Recommendations pile up on a few users; spreading them gave more matches in a field experiment (Chen, Hsieh and Lin 2023) [Not re-checked]. Against: a meta-analysis of 50 experiments, 5,036 people, found the average effect of "too many options" was almost zero (Scheibehenne and others 2010) [Abstract]. A later one, 99 observations, 7,202 people, found an effect when the task is hard and people are unsure what they want (Chernev and others 2015) [Summary] | B for a short list. A for spreading requests. H for "four" | Medium. The harm from long lists is disputed. The harm from crowding a few people is better shown |
| 9. One request to one person, with a topic and a line of your own. They answer yes, later, or no in one tap | A request that costs something to send is taken more seriously. An easy answer lowers the cost of replying | A scarce signal raised acceptance in a field experiment with 613 people on a dating site (Lee and Niederle 2015) [Not re-checked]. People underestimate how often a direct request is granted (Flynn and Lake 2008) [Not re-checked]. Asking for career help feels "dirty", so a stated topic may help (Casciaro and others 2014) [Summary]. Against: over email, requests to strangers worked worse than senders expected (Roghanizad and Bohns 2017) [Summary] | A for scarcity, from dating. H for the one-tap answer and "later" | Medium for limits on sending. Low for reply rates |
| 10. Limits: each person takes a set number of chats a month and cannot be asked when full; five open requests per sender; a request lapses after ten days and the sender is shown who else could help | Asking busy people wastes the request and tires the helper | On an online job market, employers chased workers with no spare time, who then refused. A capacity signal raised invitations and hiring and cut refusals (Horton 2019) [Summary]. A later field experiment with a paid "available now" badge found the same direction (Filippas and others, in press) [Summary]. On a room-rental site about half of enquiries were refused or ignored, many because the host was not free (Fradkin, working paper, grade C) [Summary]. Mixed on expiry: in a field experiment, a one-week deadline got more responses than a one-month deadline, but no deadline got the most (Knowles and others 2022) [Summary] | B for the capacity limit. H for five, and for ten days | Fairly sure about showing capacity. Unsure about expiry |
| 11. Each person shows as 1st, 2nd or 3rd degree | A shared contact is a reason to trust and a reason to reply | Ties with mutual contacts last longer (Burt 2000, 2002) [Summary]. Moderately weak ties helped job moves most (Rajkumar and others 2022) [Summary]. In one online experiment with 246 people, more mutual friends made accepting a friend request more likely [Summary; journal not confirmed] | B | Medium that mutual contacts help. Low that a degree label changes replies |
| 12. Nobody picks "mentor" or "mentee". The app works out the relationship from what each person wants and offers | Fixed roles put off people who do not feel senior enough, or junior enough | Peers give career and personal support at every career stage (Kram and Isabella 1985) [Not re-checked]. Felt similarity in values predicts mentoring support; surface similarity barely does (Eby and others 2013) [Summary]. Mentoring effects are positive but small (Eby and others 2008) [Not re-checked] | H for dropping the labels. A and B for the background | Low. No study compares labelled with unlabelled roles |
| 13. Feedback after a chat is private and never on a profile | Public scores inflate and make helping feel like a test | Public ratings rise over time because raters do not want to harm the person rated (Filippas, Horton and Golden 2022) [Not re-checked]. On an auction site, fear of a bad rating in return kept people from giving honest ones (Bolton, Greiner and Ockenfels 2013) [Summary] | A | High that public ratings distort. Medium for our setting |

What this evidence does not cover:

- Nearly all of it is from dating sites and paid job markets. People there want a partner or a wage. An alumnus giving 30 minutes for free may act differently.
- "About four" has no source. A study of spontaneous talk found that conversations top out at about four people (Dunbar, Duncan and Nettle 1995), but that is about group talk, not about choosing from a list. We do not use it here.
- No study was found on request expiry between people, on a cap of open requests, or on showing "who else could help" after a lapse. The Knowles study is about a survey for charity, not a personal request.

## 4. Meeting

Verdict: partly supported for naming a time and place. The reply options are our own bet.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 14. A coffee proposal offers two or three specific times and a place. With a calendar linked, times both are free are marked and pre-selected | "Let's meet some time" rarely becomes a meeting. A named time does | Writing down a date and time raised flu vaccination by 4.2 points over a 33.1% base (Milkman and others 2011) [Not re-checked]. A meta-analysis of 94 tests found that planning when and where has a medium to large effect on doing it; the figure d = 0.65 was seen in summaries only (Gollwitzer and Sheeran 2006) [Summary]. Pre-selected options are chosen more often in general (a 2019 meta-analysis of defaults) [Not re-checked; no figure used] | A for naming a time, from health and lab tasks. H for "two or three" and for calendar marking | Medium |
| 15. The other person can accept a time, suggest other times, or start a message | Three clear ways out, so nobody is stuck | None found | H | Low. Sensible, untested |

What this evidence does not cover:

- The planning studies are about one person's own plan: a vaccination, an exercise session. A meeting needs two people to agree. No study of scheduling between two people was found.
- We found no evidence on how many times to offer. Two or three is a guess.
- Linking a calendar asks for sensitive data. We found no study on whether people will link one for this purpose.

## 5. Groups and broadcasts

Verdict: partly supported. There is fair evidence that big chats break down and that people at events stay with those they know. The exact limits, and one-way announcements, are our own bet.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 16. An event has a group chat only for people going, open from three days before to a week after, and none above 50 people | A small, short chat helps people find each other. A big or endless one becomes noise | At a mixer, guests mostly talked to people they already knew, though they said they came to meet new people (Ingram and Morris 2007) [Not re-checked]. Spontaneous conversations top out at about four people (Dunbar, Duncan and Nettle 1995) [Not re-checked]. In over a billion public chat messages, each person took part less once the message rate passed about 40 per five minutes (Nematzadeh and others 2019) [Full text] | B for "big chats break down". H for three days, one week and 50 | Medium for the idea. Low for the numbers |
| 17. A class or a city gets one-way announcements from alumni services, a few times a year. No reply-all | People want the news without a flood of replies | Reading a friend's broadcast posts was linked to growing closeness (Burke and Kraut 2014) [Summary]. Against: broadcasts were not linked to better wellbeing, while personal messages were (Burke and Kraut 2016) [Summary] | H | Low. No study compares one-way announcements with group chat |
| 18. Announcements arrive as a notification. Notifications are meant to be rare | Too many notifications get switched off, and then the useful ones are lost too | Even one push a week led about 10% of users to turn notifications off (vendor data, 2017 and 2021) [Not re-checked; grade C]. In a one-week study of 15 people, more notifications went with more stress (Pielot and others 2014) [Summary]. Caution: after a day with notifications off, people felt less connected to their social group, with no change in stress (Pielot and Rello 2017) [Summary] | C for the opt-out figure. B for the rest | Medium that fewer is safer. Low on how few |

What this evidence does not cover:

- The chat study is about public live-stream chat among strangers. The limit it finds is a message rate, not a number of people. It does not give us 50.
- We found nothing on chats that open and close on a schedule.
- The notification evidence is mostly vendor data and one very small study. The Pielot and Rello result is a reminder that too few notifications also has a cost: people feel out of the loop.

## 6. Two versions of the app

Verdict: partly supported. Theory supports a version built around existing ties. Letting the person choose is supported by evidence that age alone predicts little.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 19. A simpler "Keep in touch" app (Home, Map, Messages, Profile) for people not looking for new connections. The person chooses it at sign-up. It is not assigned by age. Showing people you could help is a switch that can be off | Many graduates want their old friends, not new contacts. Guessing this from age would be wrong and insulting | Older adults keep close ties and drop outer ones, and are more often content with the size of their network (Carstensen's theory; Lansford and others 1998; English and Carstensen 2014) [Summary]. Age alone predicts lower technology acceptance only when the use is unclear, and older users reject products that mark them as old (reviews, 2021 and 2025) [Summary] | B | Medium that some users want only existing ties. Low that a separate version is the best way to serve them |

What this evidence does not cover:

- The selectivity research describes what people prefer. It does not test a product with two modes.
- We found no study on whether fewer tabs helps anyone keep in touch.
- People may not know at sign-up which version they want. We found nothing on how often people switch later, so switching must stay easy.

## 7. Sign-up and wording

Verdict: our own bet. We found no peer-reviewed evidence for either choice.

| Choice | Why | Evidence | Grade | How sure |
| --- | --- | --- | --- | --- |
| 20. Sign-up is one menu with three required parts (school, current career, people you already know). The rest is optional | Every required field loses some people. These three are what the app cannot work without | Vendor tests only, and they disagree. Some report more sign-ups with fewer fields. Others report fewer sign-ups after fields were removed [Summary; grade C] | H | Low. Test it ourselves |
| 21. The words "match", "swipe" and "like" are not used for people | These words belong to dating apps. Used here they would change what people think the app is for | None found on wording. Indirect: career networking already makes people feel "dirty" (Casciaro and others 2014) [Summary] | H | Low on evidence. We hold this choice for product reasons, not because a study says so |

What this evidence does not cover:

- No peer-reviewed study of form length for app sign-up was found. The vendor numbers have no clear method, so we do not quote them.
- "People you already know" is a harder required step than a name or a school. It may lose more people than it keeps. Choice 6 depends on it, so this is the first thing to test.
- No study was found on how product wording changes whether an app is seen as a dating app.

## Numbers that are our own

These numbers appear in the product. None of them comes from a study. Each is a starting value to be changed when we have our own data.

| Number | Where | Nearest evidence |
| --- | --- | --- |
| 60-day half-life | Closeness (choice 1) | Roberts and Dunbar show closeness falls within months. They give no rate |
| Order of weights: coffee, event, thank-you, message | Closeness (choice 1) | Voice above text has support (Kumar and Epley 2021). The rest is judgement |
| Monthly or each semester | Reminders (choice 3) | The friendship-layer figures (weekly, monthly) describe what people do, not what works |
| About four people | Suggestions (choice 8) | None. The dating study compared 6 with 24 |
| Five open requests | Limits (choice 10) | None |
| Ten days | Request expiry (choice 10) | One study compared one week, one month and no limit, for a survey |
| Two or three times | Coffee proposal (choice 14) | None |
| Three days before, one week after | Event chat (choice 16) | None |
| 50 people | Event chat (choice 16) | The chat study gives a message rate, not a group size |
| A few times a year | Announcements (choice 17) | Vendor data on notification opt-outs only |

## What we could not confirm

- Many of the sources handed over from earlier rounds were not opened again. Their findings are repeated as given and marked "Not re-checked".
- For Horton (2019) we could not confirm whether the capacity signal was tested in a randomised experiment. It is graded B for that reason.
- The response rates in the deadline study, and the d = 0.65 figure for planning, were seen in summaries only.
- The mutual-friends experiment (246 people) was seen on a laboratory archive page. We could not confirm the journal.
- The Snapchat streak papers were seen in summaries. One was first noted under the wrong journal; the sources file has the correction.
- We searched for studies of visualising one's own network, of expiry on personal requests, of one-way announcements against group chat, and of sign-up form length. We found no peer-reviewed test of any of the four.

## Where the evidence points against us

| Choice | Source | What it found | What it means for us |
| --- | --- | --- | --- |
| 3. Reminders | Nguyen and others 2025 (B); Harkin and others 2025 (B) | Prompting apps did not reduce loneliness. 18% of prompts were answered | Not a test of our feature, but a warning about prompts the user did not time |
| 4. A call counts less than meeting | Kumar and Epley 2021 (B) | People who reconnected with an old friend by phone felt closer than those who used email. In talk between strangers, video added nothing over voice alone | A call may deserve nearly the same weight as meeting. In person was not tested |
| 7. Verified badge | Vaidya and others 2019 (B); a 2024 survey experiment (B); Ofcom 2025 (C) | Badges did not raise the credibility of posts. Many users did not notice them | Rely on the gate, not on the badge |
| 8. A short list | Scheibehenne and others 2010 (A) | Average choice-overload effect near zero across 50 experiments | Do not claim that fewer options make people happier. Claim only that it spreads requests |
| 9. A written request | Roghanizad and Bohns 2017 (B) | Text requests to strangers work worse than senders expect | Do not promise a high rate of yes |
| 10. Ten-day expiry | Knowles and others 2022 (B) | No deadline got the most responses; one month got the fewest. Rates seen in a summary: 8.32%, 5.53%, and 6.3% for one week | A short limit beats a long one, but any limit may cost replies. Expiry helps the sender move on; it may not raise replies |
| 17. One-way announcements | Burke and Kraut 2016 (B) | Broadcasts were not linked to wellbeing; personal messages were | Announcements inform. They should not be counted as keeping in touch |
| 18. Rare notifications | Pielot and Rello 2017 (B) | A day without notifications left people feeling less connected | "Rare" should not become "none" |
| 20. Fewer fields | Vendor tests (C) | Some tests lost sign-ups after removing fields | No clear direction. Test it |

## What to test first

1. Do reminders lead to messages. Compare users who get them with users who do not, as 01-need.md already asks. (Choice 3)
2. Does showing a "fading" state bring people back or push them away. (Choices 1 and 2)
3. Reply rate to requests, with and without a ten-day limit. (Choices 9 and 10)
4. How many people finish sign-up when "people you already know" is required, against when it is optional. (Choices 6 and 20)
5. Whether anyone logs contact off the app after the first week. (Choice 4)
