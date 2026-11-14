# 1. Mentor, mentee and peer: making the app one thing

The prototype treats everyone as the same kind of user with a Student or Alum label. In practice one person plays three parts: a third-year student is a mentee to alumni, a mentor to first-years, and a peer to classmates. This file sets out what the research says each part needs, where the prototype falls short, and a model that ties the three together.

Grades in brackets are explained in the [README](README.md#how-strong-is-the-evidence). Full citations are in [sources.md](sources.md).

## 1. What mentoring does and does not do

- **Mentoring is associated with better outcomes, but the average effect is small.** A meta-analysis across youth, academic and workplace mentoring found mostly small correlations, with academic mentoring showing the largest. **[A]** (Eby et al., 2008)
- **Mentors do two different jobs.** The mentoring literature separates *career support* (advice, sponsorship, introductions) from *psychosocial support* (encouragement, belonging, a role model). A relationship can be strong on one and absent on the other. **[B]** (Kram and Isabella, 1985; Ghosh and Reio, 2013)
- **Few students get this at all.** In a national survey of graduates, only about 22% strongly agreed they had a mentor who encouraged their goals. Graduates who strongly agreed with three items together (a professor who cared, one who made them excited to learn, and a mentor who encouraged them) had roughly double the odds of being engaged at work. That figure is for the three combined, not for mentoring alone. **[C]** (Gallup-Purdue Index, 2014)
- **Access is uneven.** First-generation graduates who had a mentor were less likely to name a professor (61%, against 72% of white graduates), which suggests they depend more on other routes. **[C]** (Strada-Gallup, 2018)

**What this means for Kadzu.** A small average effect means most of the value sits in the minority of relationships that go well. Counting matches rewards the wrong thing. The measure that matters is a conversation both people would call worthwhile. It also means the app should let people say which kind of support they want, because "career advice" and "someone who has been where I am" are different requests.

## 2. What makes a pairing work

- **Similar values matter. Similar demographics barely do.** A meta-analysis found that a mentee's sense of deep similarity with their mentor (values, outlook) was the strongest predictor of the support they felt: ρ = .38 for career support and ρ = .48 for psychosocial support. Similarity in race, age and gender had almost no effect in aggregate. This measures *perceived* similarity, which is not the same as actual similarity. **[A]** (Eby et al., 2013)
- **Having a say matters.** In formal programmes, people who felt they had input into their match, and who rated their training highly, reported better relationships. Mentors also reported better relationships when the pair met regularly and set goals. **[B]** (Allen, Eby and Lentz, 2006)
- **People need several developers, not one mentor.** The developmental-network view treats a career as supported by a set of relationships that vary in strength and diversity. **[B]** (Higgins and Kram, 2001)

**What this means for Kadzu.**

- **Prompts are our similarity engine.** A prompt answer is the only place on a profile where values show. That argues for prompts that surface how someone thinks about work ("My unpopular career opinion…") over ones that are only charming ("My coffee order says…"), and for using prompt answers in matching, which we do not do today.
- **Swiping is the "say" in the match.** The Hinge-style model gets this right by construction.
- **We stop too early.** The prototype ends at one confirmed chat. Nothing prompts a goal beforehand or a second conversation afterwards.
- **The Network tab is already a developmental network.** It could show what is missing ("no one in your network works in healthcare") as well as what is fading.

## 3. The mentor side: why people give time

- **Mentoring is good for mentors.** A meta-analysis found mentors were more satisfied with their jobs and more committed to their organisations than non-mentors. The authors suggest telling prospective mentors this. **[A]** (Ghosh and Reio, 2013)
- **Thanks is what brings a helper back.** In experiments, a short expression of thanks more than doubled the chance a helper would help again. The reason was feeling socially valued, not feeling more competent. The effect spilled over to helping other people. The mechanism details come from summaries of the paper. **[A]** (Grant and Gino, 2010)
- **Alumni who mentor engage more with their school.** One platform reports 52% of users saying it made them more likely to give back. This is vendor-reported with no comparison group. **[C]** (PeopleGrove, 2022)

**Where the prototype falls short.** After a chat, the mentor gets a private rating form and nothing else. They never learn whether the conversation helped. Capacity limits protect them from overload, which is right, but nothing rewards them for showing up.

**What to add.**

| Change | Evidence |
| --- | --- |
| A thank-you note from the mentee, written during check-in and delivered to the mentor | Grant and Gino **[A]** |
| An impact line on the mentor's own profile, visible only to them: "5 chats this year. 4 people said it changed what they did next" | Grant and Gino **[A]**, applied by us **[H]** |
| A follow-up to the mentor when the mentee reports an outcome ("Riley took your advice and applied") | **[H]** |
| Onboarding copy for alumni that says plainly that mentoring benefits the mentor | Ghosh and Reio **[A]** |

## 4. The mentee side: the fear of asking

- **People underestimate how likely others are to say yes.** Across several studies, people underestimated agreement to a direct request for help by as much as 50%. Askers overlook how uncomfortable it is to refuse. Later work suggests this holds for face-to-face requests and may reverse for email. **[A]** (Flynn and Lake, 2008)
- **People underestimate how much being contacted is appreciated.** This held across studies with more than 5,900 participants, and the gap was largest when the contact was unexpected or the tie was weak. One study has been independently replicated. **[A]** (Liu et al., 2022)
- **People expect deep conversations with strangers to be awkward, and they are wrong.** Deep conversations went better than expected, and telling people their expectations were miscalibrated led them to choose deeper topics. **[A]** (Kardas, Kumar and Epley, 2021)

**What this means for Kadzu.** A student's main obstacle is believing they are imposing. Three parts of the prototype already work against that, and should be kept:

- **"Open to N chats per month"** is a standing invitation. It turns "may I bother you?" into "you asked for this."
- **Liking a prompt** gives the student something specific to say, which removes the blank-message problem.
- **Intention badges** tell the student what the other person signed up for.

**What to add.**

| Change | Evidence |
| --- | --- |
| A line on each alum's card such as "Usually replies within 2 days" or "Has said yes to 8 of 9 requests" | Flynn and Lake **[A]** |
| Before a first chat, three suggested questions that go past small talk, drawn from the other person's prompts | Kardas et al. **[A]** |
| One line of reassurance at the moment of asking: "Most people here say yes" (only once we have data that makes it true) | Flynn and Lake **[A]**, wording **[H]** |

## 5. The peer side

- **Peer relationships are an alternative to mentoring, not a substitute for it.** A study of 25 relationship pairs found peers provide both career and psychosocial support at every career stage, and described several types of peer relationship. The specific typology (information, collegial and special peers) is cited from memory and was not re-verified. **[B]** (Kram and Isabella, 1985)
- **Peer mentors of the same gender kept women in engineering.** A randomised trial assigned 150 incoming women engineering students to a female peer mentor, a male peer mentor or no mentor for a year. Only female mentors protected belonging, confidence, motivation and retention, and the benefit lasted into the second year. Grades did not predict who stayed. **[A]** (Dennehy and Dasgupta, 2017)
- **Peer mentoring helps the mentor too.** Small single-campus studies report gains in belonging for both sides. The evidence is thin and mostly self-reported. **[B]**

**How to reconcile this with finding 2.** The meta-analysis says demographic similarity barely matters on average. The engineering trial says gender match mattered a great deal for one group in one setting. Both can be true: on average it does not matter, and for people who are a small minority in their field it can. The practical conclusion is to **offer identity-based matching as a choice the user makes**, through community groups, and never to apply it silently.

**Where the prototype falls short.** Students can match with students, but nothing marks that as a different kind of relationship. A senior and a first-year see each other exactly as two classmates would. Community groups exist but do not feed into matching at all, apart from a line in the "In common" strip.

**What to add.**

| Change | Evidence |
| --- | --- |
| A near-peer mode: students one to three years ahead, framed as "someone who just did what you are about to do" | Dennehy and Dasgupta **[A]** |
| Let a user mark a group as one they want matches from ("Prefer people in Women in Engineering") | Dennehy and Dasgupta **[A]** |
| Same-stage peers framed around exchange, not advice: "trade notes on recruiting" | Kram and Isabella **[B]** |

## 6. The same journey from three seats

Every relationship in the app passes through the same five stages. What each person needs at each stage differs, and so does how well the prototype serves them.

| Stage | Mentee needs | Mentor needs | Peer needs | Prototype today |
| --- | --- | --- | --- | --- |
| **Discover** | To see who can help with a specific question | To be found by people they can help, and not by everyone | To find people at the same point | One deck for all three. Works best for the mentee |
| **Ask** | Permission, and something to say | A request that says what is wanted | An easy, low-stakes opener | Prompt likes are strong. Requests do not state a goal |
| **Meet** | An agenda, so the time is not wasted | To know what to prepare | A shared activity | Time and place only |
| **Follow up** | To act on the advice | To hear whether it helped | To keep trading | Private rating only. The mentor hears nothing |
| **Sustain** | A reason to come back | Protection from overload | A rhythm | Strength leaves and nudges. Capacity setting |

The weakest column is the mentor's, and the weakest row is "Follow up."

## 7. Proposal: one model, three modes

The simplest change that ties the app together is to stop asking "are you a student or an alum?" as the main fact about a person, and start asking two things:

- **What I'm looking for** (asks)
- **What I can offer** (offers)

Both come from one shared list, for example: *a look inside an industry, feedback on a resume, interview practice, a referral, advice on a decision, someone who has been where I am, a peer to trade notes with.*

Every pairing then falls into one of three modes, worked out by the app and not chosen by the user:

| Mode | When it applies | How the card reads |
| --- | --- | --- |
| **Learn from** | Their offers meet my asks, and they are further along | "Maya can help with: switching fields, portfolio reviews" |
| **Give back** | My offers meet their asks, and I am further along | "Diego is looking for: which clubs are worth it" |
| **Trade notes** | Similar stage, asks and offers overlap both ways | "You are both recruiting for consulting this fall" |

Why this model:

- **It matches how the research describes mentoring.** Support comes in kinds, and a pairing works when one person's need meets the other's offer. (Section 1)
- **It makes a student a mentor on day one.** A third-year has things to offer a first-year. The prototype never says so.
- **It gives the matching algorithm its most useful signal.** Need-to-offer fit is the first term in the score proposed in [02-matching.md](02-matching.md#4-proposed-algorithm).
- **It changes little on screen.** The intention badges become two rows. The "In common" strip gains a first line saying why this person is being shown.

The mode would then carry through the rest of the app:

| Screen | What changes by mode |
| --- | --- |
| **Meet** | The card leads with the reason for the match, written for that mode |
| **Messages** | Suggested openers and the proposal's agenda differ. "Learn from" suggests questions. "Trade notes" suggests a topic to compare |
| **Check-in** | "Learn from" asks the mentee for a thank-you and a next step. "Give back" asks the mentor only whether they would do it again |
| **Network** | Each connection shows its mode, and the map can be filtered by it |
| **Profile** | A "Giving back" summary alongside the existing capacity setting |

## Open questions

- Should the mode be shown to users as a label, or only shape the wording? A label could make a relationship feel fixed when it may change over time.
- How many asks and offers should a person be allowed? Too many and the signal is lost.
- Does a "Give back" request feel different to a student mentor than to an alum? We should ask both.
