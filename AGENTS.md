# DOKUNTAG Shared Operations Agent Instructions

Status: Active
Effective date: 2026-09-25
Scope: `idemfb/dokuntag`

## Purpose

This repository stores cross-product operational runbooks and safe helper scripts.
It is not a product source repository and it is never a secrets store.

## Startup

1. Read this file and `README.md`.
2. Read the runbook relevant to the requested external service.
3. If the local DOKUNTAG workspace is available, obey its root `AGENTS.md`, `AI-BOOTSTRAP.md`, repository-sync standard, and target-product rules.
4. Keep product-specific implementation and release decisions in the product repository.

## Safety

- Never commit OAuth tokens, refresh tokens, JSON credentials, private keys, passwords, or personal account identifiers.
- Default external-service checks to read-only.
- Google Play release, store-listing, tester, policy, or production mutations require the applicable owner gate.
- Search Console write/admin operations require explicit need; analytics should remain read-only by default.
- Do not create duplicate cloud projects or credentials when the documented shared integration already exists.
- Validate locally before any meaningful GitHub checkpoint.
