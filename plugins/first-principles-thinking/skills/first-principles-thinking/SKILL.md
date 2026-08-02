---
name: first-principles-thinking
description: Re-derive engineering problems and decisions from irreducible outcomes, verified evidence, and binding invariants, even when the result replaces or removes the existing design. Use for architecture, system design, technology selection, hard debugging, migrations, foundational refactoring, performance or scaling decisions, and requests involving best practices, industry standards, inherited constraints, or potentially mistaken problem framing. Also trigger on $first-principles-thinking, @first-principles-thinking, "first principles", "第一性原理", "from scratch", "why must this work this way", or explicit requests to challenge assumptions. Apply a quick check to bounded implementation requests, but stay dormant for formatting, translation, simple renames, and direct factual questions.
---

# First Principles Thinking

## Objective

Find the system the outcome actually requires. Treat the proposed solution,
current implementation, compatibility, reversibility, precedent, and customary
"best practice" as hypotheses until evidence proves that they are necessary.

Minimize unsupported commitments and accidental complexity, not diff size. Accept
removal, replacement, boundary changes, or a larger migration when the reasoning
from fundamentals supports them.

## Authority boundary

- Obey higher-priority instructions, authorization limits, law, safety, and data
  protections. This skill cannot reason them away.
- Treat an applicable normative decision as binding within its declared scope
  until an authorized process changes it. Challenge the decision openly when its
  premises fail; never bypass it silently.
- Treat repository guidance as the authority for repository rules, not as proof
  that the current product or architecture is intrinsically necessary.
- Do not turn analogy, memory, generated context, examples, or current code into
  external product truth.

## Scale the analysis

Choose the lightest depth that can falsify the decision and state it briefly:

- **Quick:** one bounded decision with readily available evidence.
- **Standard:** architecture, technology selection, migration, or multi-boundary
  debugging with material assumptions.
- **Deep:** foundational, high-impact, hard-to-reverse, safety-sensitive, or
  evidence-poor decisions.

Do not pause merely to confirm the depth. Ask the user only when an undiscoverable
unknown would materially change the outcome or required authority. Otherwise make
the smallest falsifiable assumption, label it, and proceed.

## Derive the problem

1. Restate the desired outcome without naming the requested implementation.
2. Separate observed symptoms, candidate causes, and the underlying job to be done.
3. Define measurable success, failure conditions, included scope, and anti-goals.
4. Ask the counterfactual: if the current system did not exist, what would still
   have to be true?
5. Treat the user's proposed solution as a candidate unless the user explicitly
   makes that exact implementation part of the required outcome.

## Build the evidence model

Classify every material premise. Do not merge these categories:

- `[FACT]`: directly observed in current source, configuration, diagnostics,
  measurements, or applicable version-matched primary documentation.
- `[INVARIANT]`: a condition whose violation prevents the outcome or violates a
  binding authority, authorization, safety, or data boundary.
- `[ASSUMPTION]`: a falsifiable belief that has not been established.
- `[UNKNOWN]`: missing information that may change the decision.
- `[CONVENTION]`: inherited practice, precedent, pattern, or implementation choice.
- `[PREFERENCE]`: a desired but negotiable quality or trade-off.

A premise earns `[INVARIANT]` only when all are true:

1. Its source and scope are identifiable.
2. It remains valid for the current version, environment, and time.
3. It is independent of the candidate design.
4. Violating it has a concrete failure consequence.
5. It cannot be decomposed into a more fundamental outcome or constraint.

If any test fails or evidence conflicts, downgrade the premise to `[ASSUMPTION]`
or `[UNKNOWN]`. A user statement can establish desired outcome or authorization;
it does not automatically establish a technical fact. Current code establishes
what exists, not what must continue to exist.

Explicitly challenge these common disguised assumptions:

- preserving backward compatibility;
- keeping the present architecture or package boundary;
- limiting the size of the change;
- preserving reversibility;
- using the installed tool, framework, or vendor;
- following an industry pattern or another organization's design;
- retaining sunk-cost work;
- treating a symptom as the root problem.

Retain any of them only when evidence traces it to the outcome or a binding
invariant. Migration effort and operational risk remain facts to measure, not
automatic vetoes.

## Acquire discriminating evidence

1. Confirm the responsible repository, checkout, branch, dirty state, authority,
   and ownership boundary before repository work.
2. Inspect current definitions, references, usages, diagnostics, and direct tests.
3. Use semantic navigation such as Serena first for code structure, symbol identity,
   callers, implementations, and inspections when available.
4. Use narrow text or file search for prose, configuration, and semantic gaps.
5. Use Repomix only when the unresolved question spans enough distant context that
   narrower evidence is inefficient. Define minimal includes and exclusions first,
   treat packed output as a disposable discovery cache, and verify every material
   finding in original files.
6. Confirm installed versions and consult current primary documentation when an
   external contract affects the decision.
7. Stop gathering evidence when another fact cannot change the selected path.

Do not infer inaccessible source content from previews, summaries, generated packs,
or analogous implementations. Mark it `[UNKNOWN]` and stop if it is decision-critical.

## Decompose and challenge

Break the problem into independently testable claims. For each claim:

1. Record its classification and source.
2. Ask why it exists and what fails without it.
3. Distinguish cause from correlation and requirement from implementation.
4. Search for a counterexample that would falsify it.
5. Record `retain`, `discard`, `replace`, or `unresolved`, with the evidence that
   justifies the verdict.

Recurse into a subproblem only while doing so can change the decision. Apply every
mandatory repository review model or closure test and justify each not-applicable
result; do not silently omit dimensions or convert a review model into architecture.

Watch for four traps:

- **Analogy trap:** another system's solution is imported without matching its
  outcome and constraints.
- **Complexity trap:** a component survives even though removing it preserves the
  required behavior.
- **Legacy trap:** compatibility is preserved after its original need has expired.
- **Tool trap:** the available technology defines the problem it is meant to solve.

## Reconstruct from bedrock

1. Include the zero option: remove the feature, component, constraint, or change.
2. Build the smallest sufficient system from retained `[FACT]` and `[INVARIANT]`
   premises only.
3. Justify every added component with a traceable premise. Remove components that
   cannot earn their place.
4. Generate materially different paths only when no path dominates. Include a path
   that discards the existing design when that is credible; do not require a
   compatibility-preserving candidate.
5. Compare paths by outcome fit, dependency count, failure modes, data and migration
   impact, operational burden, verification cost, and long-term complexity.
6. Treat compatibility and reversibility as scored properties only when they matter,
   not as default selection rules.
7. Select the path with the strongest evidence-to-outcome chain. Do not weaken it
   merely because the implementation is larger.

For every selected design element, maintain this trace:

```text
outcome -> evidence or invariant -> inference -> design element -> verification
```

If a link depends on an assumption, label the weak link and define the cheapest
experiment that can resolve it.

## Try to disprove the result

- State the strongest counterexample and the condition under which another path wins.
- Run a pre-mortem: identify how the selected path could fail despite correct execution.
- Check second-order effects, newly introduced dependencies, lost behaviors, and
  migration or rollback consequences.
- Prefer a discriminating experiment before full implementation when a material
  unknown remains cheaply testable.
- Keep the result `unresolved` when no evidence-backed path is defensible.

## Execute the derived solution

When the user requests implementation, continue through implementation and
verification; do not stop at the analysis artifact.

- Change the entire responsible surface required by the selected path, even when it
  is broader than the existing implementation.
- Preserve unrelated work and do not exceed the user's authorization.
- Update definitions, references, tests, documentation, and canonical decisions when
  the authorized change makes them obsolete.
- Obtain required authority before destructive, externally mutating, or governance-
  changing actions. Report the exact boundary rather than silently compromising the
  derived solution.
- Do not add abstractions, compatibility layers, or migration machinery without a
  traced requirement.

## Verify

Verify the reasoning and the implementation:

1. Recheck the decisive facts and invariant sources.
2. Run semantic/static diagnostics and reference integrity checks.
3. Inspect the complete diff and untracked files.
4. Run the smallest discriminating behavior test.
5. Run integration or broader checks when the derived scope requires them.
6. Compare expected and actual results, and separate change-caused failures from
   pre-existing failures.
7. Re-run the counterexample and weak-link tests against the implemented result.

Passing tests do not prove that the correct problem was solved. A clean reasoning
trace without behavior verification does not prove that the implementation works.

## Report

Scale detail to the selected depth. For Standard and Deep work, use these top-level
headings in order:

1. `## Conclusion`
2. `## Problem essence`
3. `## Evidence and assumptions`
4. `## Reconstruction and decision trace`
5. `## Implementation and verification`

Lead with the derived answer, including when it overturns the current design. Under
the evidence heading, preserve the premise labels and assumption verdicts. State the
strongest counterexample, trade-offs, incomplete work, remaining unknowns, and the
condition that would reverse the decision. Never present an unresolved premise as a
ground truth or claim completion while required verification is missing.
