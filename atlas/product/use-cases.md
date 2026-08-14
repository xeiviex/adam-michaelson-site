# Use Cases

> Adam's enumerated use cases, verbatim. Not yet prioritized. Listed in no particular order (Adam
> will prioritize by strategic judgment — most value at lowest cost, what's essential for an initial
> design — and batch iterations by that priority order).

## Persona hypotheses

- **Person** — someone using the personal fitness app; may or may not be a gym member.
- **Gym admin** — someone at the gym doing setup, monitoring, management, etc. (May split into
  multiple personas later; simplified for now.)
- **Provider admin** — like Gym admin, but a non-gym company employee (restaurant, product/service
  provider, etc.).

## Use cases: onboarding

- Person downloads and sets up the app
- Person sets up passkey
- Person has introductory walkthrough
- Person connects to health app
- Person sets up notifications
- Person browses information architecture (blank states)
- Person gets an invitation (and onboards)

## Use cases: workouts

- Person browses workout templates
- Person starts a workout from a template
- Person completes an exercise
- Person completes a set
- Person adjusts an exercise (mid-workout)
- Person adjusts a set (mid-workout)
- Person completes a workout
- Person views past / completed workouts
- Person edits a past / completed workout
- Person views history for an exercise
- Person creates a new workout (from scratch)
- Person adds exercises to workout
- Person reviews physical fitness metrics

## Use cases: goals

- Person sets a goal
- Person sees all goals
- Person reviews progress toward a goal
- Person achieves a goal
- Person is prompted by AI around goals

## Use cases: nutrition

- Person logs food/drink
- Person adds food/drink
- Person edits food/drink
- Person logs a meal (multiple food/drink in one log)
- Person saves a meal
- Person logs a saved meal
- Person sees nutritional stats

## Use cases: social

- Person sees other people using the app
- Person connects with other people on the app
- Person sees another person's stats
- Person messages another person
- Person is prompted / messaged by other people around goals

## Use cases: marketplace

- Person sees gyms
- Person sees providers
- Person sees offers
- Person reviews offer details
- Person selects offer
- Person fills out requirements for offer
- Person completes transaction (including payment)

## Use cases: Gym administration

- Gym admin signs up via website
- Gym admin gets email verification (for onboarding)
- Gym admin sets up account
- Gym admin configures profile (first time)
- Gym admin configures gym
- Gym admin sees gym stats
- Gym admin sees gym members
- Gym admin views user details
- Gym admin edits user details
- Gym admin sets up participation in marketplace
- Gym admin reviews gym config on marketplace
- Gym admin edits gym config on marketplace
- Gym admin reviews gym performance on marketplace

---

## Open threads (not decided)

- **Stable use-case IDs?** Whether to give each use case an identifier (e.g. `ONB-001`, `WRK-014`,
  `MRKT-021`) as a common language across product, research, prototype, and eng. Not adopted yet.
- **Provider-side marketplace use cases** (Provider creates offer, targets audience, measures
  conversion, fulfills purchase) — intentionally not enumerated yet; currently focusing one actor
  at a time.
