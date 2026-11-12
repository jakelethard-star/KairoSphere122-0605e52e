# Application migration record

- Date: 2026-11-08
- Destination: `jakelethard-star/KairoSphere122-0605e52e`
- Integration branch: `migration/kairosphere-application-20261108`
- Base commit: `71a24cda5b9ba867050ad6d12b199385e81386ea`
- Source: `KairoSphere144/laughing-waffle`
- Source revision: `4f12778267b1c3f94c0ebc7b28f8d5ef1e741bb6`

## Imported
Application UI, Vite configuration, dependencies and lockfile, Supabase client and data adapter, SQL migration source files, tests, CI and Pages workflows, editor configuration, license, README, agent instructions, and evolution/data-fitness doctrine.

The source revision has successful source-repository CI evidence (run 42219371572). This is source-side evidence, not a claim that the destination has passed its own CI.

## Destination adjustments
- Vite production base path updated to `/KairoSphere122-0605e52e/`.
- README Pages/Auth redirect guidance updated to the destination Pages URL.
- Placeholder `.github/workflows/blank.yml` is replaced by application CI and Pages workflows.
- Existing destination `SECURITY.md` retained.
- Existing `master` branch left untouched.

## Not migrated
No environment secret files, live Supabase users/data/settings, account configuration, or deployment settings. SQL migrations are source files only and have not been applied. The source repository is unchanged.

## Verification boundary
The destination branch must run its own CI. GitHub Pages deployment and the new Supabase Auth redirect require destination-side configuration/verification. Neither is claimed complete here.
