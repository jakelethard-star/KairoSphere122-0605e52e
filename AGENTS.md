# KairoSphere engineering operating contract

## Product and current milestone

KairoSphere is an industrial supplier intelligence, sourcing, procurement, warehouse and invoice-control workspace, initially serving Suriname. Its canonical workflow is supplier discovery → qualification → catalogue → RFQ → supplier quotations → comparison → requisition → approval → purchase order → delivery → receiving/inspection → inventory ledger → invoice matching → settlement evidence → supplier performance.

The current milestone is the organization-scoped procurement shell: responsive route navigation, organization creation, operational registers, schema/RLS, tests and a successful production build. The next increment is RFQ line items and invitations, comparable supplier quote evaluation, approval actions and controlled requisition-to-PO conversion. Do not describe planned actions as implemented.

## Architecture

- Vite browser app using vanilla JavaScript modules.
- Supabase Auth and the publishable key only in browser code.
- Organizations and `organization_members` define tenant boundaries.
- PostgreSQL constraints, same-organization relationships and RLS enforce data integrity and access.
- Pure validation belongs in `src/domain`; Supabase access belongs in `src/data`; route modules belong in `src/modules`.
- Inventory is an append-only movement ledger with derived balances.

See `docs/SUPPLIER_TO_PROCUREMENT_WORKFLOW.md`, `docs/architecture/operating-model.md`, `docs/architecture/page-route-module-bindings.md` and `docs/architecture/data-contracts.md`.

## Product and data invariants

- No cross-organization access; enforce authorization in the database as well as the UI.
- Never expose service-role keys, database passwords or other secrets in browser code or commits.
- Never silently combine or convert currencies.
- A supplier prospect is not a verified supplier; a quotation or requisition is not an approved purchase order.
- Only accepted receipt quantities affect stock. Invoice paid status requires independent settlement evidence.
- Do not fabricate business facts, verification, delivery, inspection, payment or integration results.
- Keep estimates, confirmed values, samples, unverified information and unknowns distinguishable.
- Financial functionality is recordkeeping and analysis only; do not implement payment execution or money movement as an assumed feature.
- Preserve client confidentiality and collect only data with a defined operational purpose and lifecycle.

## Evolution and consequential actions

Read `docs/architecture/evolution-and-data-fitness.md` before substantial architecture, schema, migration or data-cleanup work. Preserve learning, not obsolete implementation. Use synthetic fixtures first; classify affected data as retain, transform, quarantine or retire. Do not silently move uncertain data into production workflows.

Ordinary reversible code changes and reviewable-branch design decisions are within scope. Production migrations/cutovers, destructive data operations, access or security changes, public deployment, spending, financial transactions and external commitments require explicit human approval. Prepare the change and verification evidence without executing those actions.

Keep migration files immutable once applied; use a new migration for subsequent changes. Do not weaken RLS or permissions to make a feature work. Preserve the existing GitHub Pages deployment path unless a verified replacement is approved.

## Engineering workflow

Inspect the checked-out branch, working tree, README, source, migrations, tests and workflows before changing code. Do not assume another branch's architecture or claim live configuration from source files. Make focused changes and add regression tests for changed behavior.

Run `npm ci`, `npm test` and `npm run build` against the exact reviewed commit. Report exact commands and outcomes, remaining unknowns, environment setup and any manual integration steps. Review the final diff for tenant boundaries, data exposure and deployment impact. Never claim a test, migration, deployment or external action succeeded without direct evidence.
