# Owner Decision and Execution Authority

`docs/authority/owner-decisions.json` is the canonical register for explicit Otaku-mori owner
decisions. It records product policy separately from implementation state and consequential-action
authorization.

## Interpretation

- `OWNER_APPROVED_POLICY` records an owner-selected product or experience rule.
- `IMPLEMENTATION_AUTHORIZED` permits only the bounded implementation described by that record.
- `OWNER_REVIEW_REQUIRED` preserves an unresolved creative or operational selection.
- `PROPOSED` records an unresolved recommendation and grants no implementation authority.
- `PROHIBITED` records an explicit boundary.

No status implicitly authorizes a remote push, merge, deployment, provider or environment change,
Neon action, database mutation, payment operation, reward-balance change, destructive cleanup, or
final artistic acceptance. Those actions require the explicit scoped approval named in the record
and remain subject to `AGENTS.md`.

## Local engineering autonomy

Within an already authorized scope, engineering may inspect source and read-only state, correct
reproducible defects, improve existing implementations without changing approved behavior, add
focused tests, make contract-consistent accessibility and responsive corrections, run
non-destructive local validation, and prepare local commits or review evidence.

New customer policy, personal-data collection, major dependencies, material feature expansion,
unapproved creative direction, or any consequential external mutation remains owner-gated.

## Evidence and maintenance

Every decision has a stable ID, source, implementation status, allowed local actions, explicit
approval gates, and evidence. Code and tests determine whether a policy is implemented; the
register never turns an intended policy into a claim of completed enforcement. Unresolved decisions
carry a milestone so they do not block unrelated local engineering.
