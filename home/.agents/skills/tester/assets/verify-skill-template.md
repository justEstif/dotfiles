---
name: verify-<app>
description: Drives <app> through <surface> and proves behavior with captured evidence. Use when verifying a change to <app> end to end.
---

# verify-<app>

## Launch

<Exact command that starts the app from an empty data dir, and the signal that it is usable.>

## Doctor

<One read-only check: process up, right build, port owned by this run, auth valid.>

## Drive

<The harness recipe with this repo's real selectors, commands, or routes.>

## Evidence

<What to capture for a proof, and where it goes.>

## Cleanup

<How to tear down what this run started. Evidence survives teardown.>

## Helpers

<Each shipped script and its invocation.>

## Features

See `features/README.md`.
