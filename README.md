# KairoSphere

Industrial supplier intelligence, sourcing, procurement and warehouse operations for Suriname, with a design intended to support international trade workflows.

KairoSphere manages the operating path from supplier discovery through purchasing, receiving, inventory control, invoice matching and supplier performance.

## Application modules

- Organization-based workspace creation and authenticated access.
- Supplier discovery, onboarding, qualification and supplier records.
- Product catalogue and warehouse registers.
- RFQ, supplier quotation, requisition and purchase-order registers.
- Receiving, inventory movement ledger, invoice control and supplier reviews.
- Operational dashboard with sourcing, purchase exposure and control queues.
- Explicit currency separation and organization-scoped row-level security.

## Workflow and architecture

Supplier discovery → qualification → product catalogue → RFQ → quotation comparison → requisition → approval → purchase order → delivery → receiving and inspection → inventory ledger → invoice three-way match → settlement evidence → supplier performance.

See the [workflow](docs/SUPPLIER_TO_PROCUREMENT_WORKFLOW.md), [operating architecture](docs/architecture/operating-model.md), [page/route/module bindings](docs/architecture/page-route-module-bindings.md), [data contracts](docs/architecture/data-contracts.md), [evolution and data fitness doctrine](docs/architecture/evolution-and-data-fitness.md), and [retirement register](docs/engineering/retirement-register.md).

## Run locally

Requirements: Node.js 20.19 or later.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the intended Supabase project. Browser code may use only the publishable key; never use a service-role or secret key.
3. Review the timestamped SQL migrations and confirm the target environment before applying them. Migrations in this repository are source files; they have not necessarily been applied to any live project.
4. Enable Supabase email/password authentication. The application defaults confirmation emails to the canonical GitHub Pages URL so links work when opened on another device; set `VITE_AUTH_REDIRECT_URL` only when intentionally overriding that destination. Add the Pages URL to Supabase Auth's allowed redirect URLs. Add `http://localhost:5173/**` only when testing local-origin redirects.
5. Run `npm ci`, `npm test`, and `npm run dev`.
6. Run `npm run build` to produce the production bundle.

## GitHub Pages

The Pages workflow builds and tests on pushes to `main`. Configure Actions variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as appropriate for the target project. The Supabase Auth redirect allowlist must include:

`https://jakelethard-star.github.io/KairoSphere122-0605e52e/`

## Operating controls and implementation boundary

Operational records belong to an organization and are protected by RLS. Inventory is an append-only movement ledger with derived balances; currencies are never silently combined or converted. A supplier prospect is not verified, a requisition is not approval, and an invoice is not paid without independent settlement evidence. KairoSphere records payment evidence but does not execute money movement. Unknown, estimated and unverified information remains distinguishable.

The current application provides the authenticated shell, organization creation, module navigation, operational registers and dashboard. Detailed RFQ line editing, quote scoring, approval actions, PO conversion, receipt-to-ledger posting and invoice three-way matching remain planned increments; a visible register does not mean its full workflow is implemented.
