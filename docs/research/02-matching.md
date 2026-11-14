# 2. Matching: a better algorithm, and the research behind it

This file describes how the prototype ranks people today, what the research on matching says, and a proposed algorithm to discuss. Nothing here is built yet.

Grades in brackets are explained in the [README](README.md#how-strong-is-the-evidence). Full citations are in [sources.md](sources.md).

## 1. What the prototype does today

The Meet deck is built by `buildDeck` in `src/services/index.ts`.

1. **Filter.** Keep people at the same school who are not already connected, swiped or blocked, and who pass the user's filters (role, grad year, industry, intentions, distance).
2. **Score** each remaining person:

   ```
   score = 2.5 × (need-to-offer fit, 0 to 1)
         + 1.5 × (number of things in common)
         + 4.0 × (hidden trust score, 0 to 1)
         + 1.5 × (mutual connections value, 0 to 1)
         + 1.0 × (how much they widen your network, 0 to 1)
         + 1.0 if they have chat spots left this month
   ```

   The first, fourth and fifth terms were added after this review. See [section 9](#9-using-the-network-you-already-have).

3. **Sort** by score and show everyone, one card at a time.
4. **Match by coin flip.** A right swipe matches 40% of the time, regardless of who is involved.

This is fine for a demo. As a real algorithm it has four problems:

| Problem | Consequence |
| --- | --- |
| **It only looks one way.** The score is what the viewer has in common with the other person. It never asks whether the other person would want this match | Students are sent to alumni who will not say yes |
| **Everyone sees the same top people.** Trust and "things in common" favour the same profiles for every viewer | A few alumni get most of the requests |
| **Capacity is a bonus, not a limit.** An alum with one spot left ranks almost as high as one with five | Overload, slow replies, and students waiting on people who are full |
| **It never learns.** The private feedback moves the trust score slightly and nothing else | The system is no better after 10,000 chats than after 10 |

## 2. What the research says

### A match has to work for both people

- **People-to-people recommendation is a different problem from recommending products.** A recommendation only succeeds if both sides agree. The field calls this *reciprocal recommendation*, and its central question is how to combine two one-way preferences into one score. **[B]** (Palomares et al., 2021)
- **The standard way to combine them is the harmonic mean.** RECON, an early reciprocal recommender for online dating, scores each direction and takes the harmonic mean, which is low whenever either side is low. In evaluation on about 90,000 users it outperformed a one-way baseline. The performance figures come from a secondary summary. **[B]** (Pizzato et al., 2010)

### Popular people get swamped

- **Dating platforms concentrate recommendations on a few users.** This causes congestion: many people are sent to one person, most are ignored, and they become discouraged. A field experiment on a dating platform that spread recommendations more evenly produced substantially more matched couples. **[A]** (Chen, Hsieh and Lin, 2023)
- **Limiting exposure by capacity is an active research direction.** A recent preprint proposes capping how much attention each person receives, in expected likes, and reports gains in simulation. It is not yet peer-reviewed. **[C]** (arXiv 2602.19689)

### Less choice can be better

- **More options made people less satisfied.** People who chose from 24 potential partners were less satisfied with their choice a week later than people who chose from 6, and more likely to want to change it. The sample was 152 undergraduates. **[B]** (D'Angelo and Toma, 2017)
- **Restricting choice can be a winning strategy for a platform.** A model of matching platforms shows that offering fewer candidates reduces competition among users on the same side, which benefits users who most need a match. **[B]** (Halaburda, Piskorski and Yildirim, 2018)
- **Limiting who can make the first move can make everyone better off.** A model of search on matching platforms finds that restricting what users can see or do reduces wasted effort. **[B]** (Kanoria and Saban, 2021)

### A scarce signal is a believed signal

- **A limited "rose" raised acceptance.** In a field experiment on a dating site, participants could attach one of a small number of virtual roses to a request. A rose substantially increased the chance of acceptance, even though it cost nothing but the chance to use it elsewhere. The sample was 613 people. **[A]** (Lee and Niederle, 2015)

### Stable matching

- **Hinge's "Most Compatible" pairs people using the Gale-Shapley stable matching algorithm,** and reports that users were eight times more likely to exchange numbers with those matches. Both the method and the figure are the company's own claims. In the classic algorithm, the side that proposes gets its best possible stable match and the other side does not. **[C]** (Hinge)

### What predicts a good mentoring pair

These come from [01-roles.md](01-roles.md) and are the inputs the score should use.

- **Shared values predict support. Shared demographics mostly do not.** **[A]** (Eby et al., 2013)
- **Having input into the match improves the relationship.** **[B]** (Allen, Eby and Lentz, 2006)
- **Most alumni-student pairings are three to five graduation years apart,** in one vendor's analysis of about 10,000 connections. This describes what people choose, not what works best. **[C]** (PeopleGrove)

## 3. Design principles

The research reduces to six rules.

1. **Score both directions.** A match is only as good as its less interested side.
2. **Optimise for good chats, not likes.** The target is a conversation that happens and that both people rate well.
3. **Treat attention as a budget.** Each person can take a limited number of requests. Spend that budget where it is most likely to turn into a chat.
4. **Show few, and show why.** A short set with a stated reason beats a long deck.
5. **Keep learning.** Reserve some slots for people the system knows little about.
6. **Leave the choice with the user.** The algorithm proposes. People decide.

## 4. Proposed algorithm

Seven steps. Steps 1 to 5 are simple enough to build into the prototype's `buildDeck`. Steps 6 and 7 change the product.

### Step 0: Eligibility

Remove anyone who cannot be matched at all: different school, blocked, paused, already connected, or failing one of the viewer's hard filters. This is what the prototype does now.

### Step 1: Score each direction

For viewer *a* and candidate *b*, estimate how good this match would be **for *a***, from 0 to 1.

```
u(a → b) = 0.40 × fit         does what b offers match what a is looking for?
         + 0.30 × similarity  shared values, groups and background
         + 0.15 × gap         is the experience gap right for this kind of match?
         + 0.15 × logistics   same city, travelling there, or happy to meet online
```

| Term | How it is worked out | Why |
| --- | --- | --- |
| **fit** | Share of *a*'s asks that *b* offers. Needs the asks and offers model from [01-roles.md](01-roles.md#7-proposal-one-model-three-modes) | Support comes in kinds. Largest weight because it is the reason for the chat |
| **similarity** | Shared groups and background today. Later, how close two people's prompt answers are in meaning | Eby et al. **[A]**: perceived deep similarity is the strongest predictor |
| **gap** | Highest when the gap suits the mode: about 3 to 10 years for "Learn from", 1 to 3 for near-peer, 0 to 1 for "Trade notes". Falls away smoothly outside that range | PeopleGrove **[C]**. The ranges are our starting guess **[H]** |
| **logistics** | 1.0 same city, 0.7 if one is travelling there, 0.4 if online only | A chat that cannot be scheduled does not happen **[H]** |

The weights are starting values chosen by judgement. Step 7 replaces them with learned ones.

### Step 2: Combine into one reciprocal score

```
r(a, b) = 2 × u(a → b) × u(b → a) / ( u(a → b) + u(b → a) )
```

This is the harmonic mean used by RECON **[B]**. If either side scores low, the result is low. A pair scoring 0.9 and 0.3 gets 0.45, not the 0.6 an ordinary average would give.

### Step 3: Adjust for reliability

Multiply by how reliably *b* shows up and how their chats are rated, using the private feedback.

```
reliability(b) = ( good chats + 5 × 0.8 ) / ( total chats + 5 )
```

The extra terms act as five imaginary chats at an 80% success rate. A new user starts at 0.8 and moves toward their real record as it builds. Without this, one bad first chat would bury a new user, and one good one would put them at the top.

### Step 4: Adjust for capacity

```
availability(b) = remaining spots this month / ( 1 + requests waiting for b's reply )
                  limited to between 0 and 1
```

- An alum with 3 spots and 1 request waiting scores 1.0.
- An alum with 1 spot and 4 requests waiting scores 0.2.
- An alum with no spots scores 0 and is held until next month.

This is the part that prevents congestion (Chen, Hsieh and Lin **[A]**). It makes the capacity setting, which users already fill in, do real work.

```
final(a, b) = r(a, b) × reliability(b) × availability(b)
```

### Step 5: Build a small daily set

Do not show everyone. Each day, show **about six people**, chosen as follows:

- **Four** by highest final score, skipping anyone too similar to someone already picked, so that the set is not six consultants.
- **One** near-peer or same-stage peer, so that "Trade notes" matches appear even for users who came for mentors.
- **One** exploration slot: someone new or rarely shown, picked partly at random. This is how the system learns about people it has no data on, and it gives every user a baseline of exposure.

Every card states its reason in one line: "Devon offers case interview practice, which you are looking for."

Six is our starting number, taken from the small set in D'Angelo and Toma **[B]**. It should be tested.

### Step 6: Change who makes the first move

Today both sides swipe the same deck. The proposal:

| Mode | Who initiates | What the other side sees |
| --- | --- | --- |
| **Learn from** | The mentee sends a request with a stated goal | The mentor gets a short inbox of requests, best fit first, and accepts or declines. No swiping |
| **Trade notes** | Either person | The normal two-way like |

Mentor time is the scarce resource, so mentors should spend it deciding on real requests, not browsing (Kanoria and Saban **[B]**). Mentors can still browse if they want to.

Add one scarce signal: **two priority requests per week.** A priority request goes to the top of the recipient's inbox and is marked as such (Lee and Niederle **[A]**). The comment on a prompt stays as it is. It already works as a signal of effort.

### Step 7: One weekly top match

Once a week, compute a **stable matching** across the whole school and give each person one "match of the week."

- Use deferred acceptance with capacities, so that an alum with three spots can be matched to three students.
- **Students propose.** In this algorithm the proposing side gets its best stable outcome, and students are the side we most want to serve.
- Both people see the match at the same time, with the reason, and it expires after a week.

A stable matching means no two people would both rather have each other than the match they were given. It is the nearest thing to "the best available pairing for everyone at once," which sorting each person's list separately cannot produce.

## 5. Worked example

Riley is a third-year Industrial Engineering student in Atlanta, looking for *a look inside consulting* and *advice on a decision*. Three candidates:

| | Devon | Nate | Zoe |
| --- | --- | --- | --- |
| Who | Principal at BCG, class of 2011, Atlanta | Partner at McKinsey, class of 2010, Chicago | IE student, class of 2028, Atlanta |
| Mode | Learn from | Learn from | Trade notes |
| Riley → them | 0.81 | 0.68 | 0.82 |
| Them → Riley | 0.77 | 0.60 | 0.78 |
| **Reciprocal** | **0.78** | **0.64** | **0.80** |
| Reliability | 0.90 | 0.85 | 0.80 (new user) |
| Availability | 1.0 (3 spots, 1 waiting) | 0 (full this month) | 1.0 |
| **Final** | **0.71** | **0** | **0.64** |

Reading the result:

- **Devon ranks first.** Strong fit both ways, reliable, and has room.
- **Nate is held back,** though he would be a good match, because he is full. Under today's scoring he would rank near the top and Riley's request would sit unanswered.
- **Zoe scores highest on raw compatibility** but is discounted for being new. She appears in the peer slot of the daily set, which is how the system finds out whether she is as good a match as she looks.

How Riley's score for Devon is built: fit 1.0, similarity 0.6, gap 0.5 (17 years is wider than ideal), logistics 1.0. So 0.40 + 0.18 + 0.075 + 0.15 = 0.805.

## 6. How it learns

The weights in step 1 are guesses. With data they should be learned.

- **What to predict:** a *good completed chat*. Both people showed up and both gave a thumbs up. This already exists in the prototype's check-in.
- **Break it into stages,** because each fails for different reasons:

  ```
  P(good chat) = P(request sent) × P(accepted) × P(both show up) × P(both rate it well)
  ```

- **Start simple.** A logistic regression on the four step-1 terms, refitted monthly, is enough for the first several thousand chats and is easy to explain.
- **Add learned preferences later.** Once there is enough data, "people who liked the same profiles as you" can be added as a further term.

### Rollout

| Version | What it is | Needs |
| --- | --- | --- |
| **v0** | Today's rules | Nothing |
| **v1** | Steps 1 to 5 with hand-set weights | Asks and offers on profiles. Buildable in the prototype now |
| **v2** | Steps 6 and 7: request inbox, priority requests, weekly match | Product changes on both sides |
| **v3** | Learned weights | A few thousand rated chats |

For the demo, the 40% coin flip could be replaced with the reciprocal score as the chance of a match. Good pairings would then match more often than poor ones, which is easier to explain in a presentation.

## 7. Fairness and safety

- **Do not use race, gender or age in the score.** The meta-analysis says they add almost nothing on average **[A]**, and using them silently would be wrong regardless.
- **Offer identity-based matching as a user's own choice,** through groups they join and mark as a preference. The engineering peer-mentor trial supports making this available **[A]**.
- **Audit exposure regularly.** Check whether any group of users is shown less often or matched less often than others with similar profiles, and correct for it. Popularity bias is the default behaviour of ranking systems **[A]**.
- **Reports and blocks stay outside the score.** A safety report triggers human review. It should never just lower someone's ranking.
- **Say why.** A one-line reason on every card makes the system easier to trust and easier to correct.

## 8. Questions to decide together

1. **Is "a good completed chat" the right target?** It ignores what happens later. A harder but better target would be whether the mentee did something as a result.
2. **Should mentors lose the swipe deck?** A request inbox respects their time, but some alumni may enjoy browsing.
3. **How small should the daily set be?** Six is a starting point. A new school with 40 alumni may need a different number from one with 4,000.
4. **How hard should capacity bite?** Holding back a full alum protects them, but hides the best match from a student who would have waited.
5. **Should the weekly match be automatic or opt-in?**
6. **How much should a new user be protected?** The reliability formula starts everyone at 0.8. Higher is kinder to newcomers and riskier for the people they meet.

## 9. Using the network you already have

The first version of this proposal ignored a user's existing connections, apart from removing them from the deck. That was a gap. A person's network says a lot about who they should meet next, and no dating app has an equivalent.

### What the research supports

- **A few people in common is better than none or many.** The LinkedIn experiment measured tie strength by mutual connections and found an inverted U: moderately weak ties did the most for job mobility, more than close ties or strangers. **[A]** (Rajkumar et al., 2022)
- **A good network is varied as well as strong.** The developmental-network view says who supports your career should differ in both closeness and background. **[B]** (Higgins and Kram, 2001)
- **Past chats are evidence of what works for you.** This is ordinary recommender logic applied to data the check-in already collects. **[H]** for our setting.
- **Warm introductions** through a mutual connection would plausibly lower the fear of asking, given how much people underestimate others' willingness to help. No study of this was found. **[H]**

The first two pull in opposite directions. One favours people close to your network, the other people outside it. The LinkedIn result suggests where to settle: one step beyond who you know.

### What is now built

| Term | How it works | Shown on the card as |
| --- | --- | --- |
| **Mutual connections** | Counts your connections who also know this person. Worth 0 for none, rises to its peak at two or three, then falls for four or more | "You both know Nina and Mei" |
| **Network novelty** | The share of your connections who are *not* in this person's industry. Highest when you know nobody in their field | "Would be your first connection in Healthcare" |

Two limits:

- **The demo has no real connection graph.** Who knows whom among the seed profiles is a fixed guess based on shared groups, city, industry and class year. A real app would read this from its own data.
- **The shape of the mutual-connections curve is our guess.** The research supports "moderate is best." Where the peak sits, and how fast it falls, is untested.

### Not built

- Learning from a user's own rated chats.
- Introductions through a mutual connection.
- Novelty on anything other than industry, such as city or career stage.

## 10. How this compares with dating apps

Most of the matching evidence in this file comes from dating apps, because that is where two-sided matching has been studied most. It is worth being clear about where the comparison holds.

### Where it holds

| Shared problem | Shared answer |
| --- | --- |
| Both people have to say yes | Reciprocal scores |
| Popular people are swamped | Limits on exposure |
| Too much choice lowers satisfaction | A small daily set |
| A like is cheap and so means little | A scarce signal, such as a priority request |
| Each person sorted separately gives a poor overall result | Stable matching across everyone |

### Where it does not

These three differences are our reasoning. No study compares the two settings directly. **[H]**

| | Dating | Kadzu |
| --- | --- | --- |
| **What makes a match** | Mutual attraction, largely similarity | Complementarity: one person's need meets another's offer |
| **How many** | One partner, after which both leave | Many relationships, and both stay |
| **Your existing network** | Irrelevant or avoided | Central to who you should meet next |

What follows from them:

- **Fit comes before similarity.** Shared values still matter (Eby et al., 2013 **[A]**), but the reason for the chat is that one person can help the other.
- **Capacity is a number.** A dating match takes someone off the market. A mentor can take several chats a month, which is why this proposal uses capacity-aware matching.
- **Success builds the product.** A dating app loses its users when it works. Here every good match makes the Network tab more useful, so there is no reason to hold back the best matches.
- **The two sides are unequal.** Mentors are scarce and are giving time. This is the case for mentees requesting and mentors choosing.
- **The outcome can be measured.** Dating apps seldom learn how a date went. The check-in tells us, which makes learning from results far easier.
- **One risk is specific to us: transactional use.** Someone who wants only a referral is using the other person. See [03-efficacy.md](03-efficacy.md#referral-seeking-and-transactional-use).
