# Google Platform Integrations

Status: Active
Validated: 2026-09-25
Scope: Cross-product Google Play Console API and Google Search Console API access.

## Shared Google Cloud project

The shared Cloud project is `dokuntag-platform-ops`.

Enabled APIs:
- Google Play Android Developer API (`androidpublisher.googleapis.com`)
- Google Search Console API (`searchconsole.googleapis.com`)
- Site Verification API (`siteverification.googleapis.com`)

## Authentication model

Local operator access uses Google Application Default Credentials (ADC).
The ADC scope set includes:
- `cloud-platform`
- `webmasters.readonly`
- `androidpublisher`

A dedicated service account may be used for server-to-server automation after
it receives the minimum required Play Console permissions.
Do not commit service-account keys or ADC files.

## Known DOKUNTAG mappings

- DOKUNTAG Sub Android package: `com.dokuntag.app`
- Primary Search Console domain: `sc-domain:dokuntag.com`
- Publish Search Console properties include `publish.dokuntag.com`.
## Validation evidence

On 2026-09-25:
- Search Console property listing succeeded through ADC.
- Search Analytics returned real query data for the DOKUNTAG domain.
- Google Play `reviews.list` succeeded for `com.dokuntag.app`.
- Google Play subscription listing returned a successful empty response for the same package.

## Operating rules

1. Use the existing shared Cloud project; do not create duplicates.
2. Prefer read-only status checks before any mutation.
3. Store and release mutations remain product-governed and owner-gated.
4. Policy declarations and console-only review forms may still require Play Console UI.
5. Never expose credentials in chat, logs, Git history, CI artifacts, or screenshots.
6. Use `scripts/google-ops-status.ps1` for a non-mutating connection check.

## Local/private overlay

Machine-specific account identifiers, credential paths, and service-account key
locations belong only in the local DOKUNTAG infrastructure runbook, never in
this public repository.
