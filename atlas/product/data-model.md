# Data Model

> Adam's object model, verbatim, followed by open questions. Iteration in progress. Claude reacts
> and questions here — does not rewrite the model unless Adam asks.

## Object model (Adam's draft, verbatim)

- **User** (with types and roles; person has access based on plan, admin has access based on plan + role)
- **Role** (user roles)
- **Plan** (for person, gym, provider – strata for each)
- **Organization** (with types – gym, restaurant, clothing, trainer, etc.)
- **Workout** (includes stats, vitals, etc.)
- **Exercise** (type, includes reps, weight, logs, 1RM, PR, etc.)
- **Set**
- **Activity log** (should I make this a log for everything – food, workout, user activity, payments, plan change, check in, login, etc.? Or should I have different logs for each purpose?)
- **Food** (may be custom entered or from data source)
- **Meal**
- **Offer**
- **Membership/contract**
- **Payment**

## Open questions (raised, not decided)

1. **Activity Log — one log or many?** (Adam's own open question.) Also: which of these is it meant
   to be — (A) technical event store, (B) business audit log, (C) user-facing timeline, or (D) the
   canonical history from which many features derive? These are four different things.
2. **`Food` and `Exercise` need a source + verified distinction.** Confirmed by data-source research
   (`../research/data-sources.md`): a verified backbone from a data source, plus user-created customs,
   with a flag for whether a custom is shareable back to the shared set. Adam's model already gestures
   at this ("may be custom entered or from data source").
3. **`Organization` can't assume we own the data.** Places/marketplace records come from third-party
   APIs whose caching rights vary (some forbid storage, some allow 30 days, some indefinite). May need
   a `data_source` + `cache_expires_at` concept, or a two-tier model (stored catalog + live-fetched
   detail). See `../research/data-sources.md`.
4. **Objects the use cases imply but the list doesn't name yet** (open — not additions until Adam
   decides): Goal, Notification, Conversation/Message, Check-in, Review, Schedule/Class, and the
   Workout↔Exercise linking concept (a template vs. a performed instance).
