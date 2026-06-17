# Diagramify Mini

Diagramify Mini is a cloud-ready mini diagram editor built with React, TypeScript, Vite, and AWS Cognito. It demonstrates protected authentication flows, local diagram persistence behind a storage abstraction, Dockerized production builds, GitHub Actions CI, and an AWS-ready deployment plan.

## Why This Project Exists

This project was built as an internship-focused proof of practical frontend, cloud, and DevOps readiness. The goal is not to be a full diagramming platform. The goal is to show that a small product can still use clear architecture, secure authentication boundaries, repeatable builds, CI, deployment planning, and cost-aware AWS decisions.

## Features

- Email/password sign-up and sign-in with AWS Cognito.
- Email verification code flow.
- Protected dashboard route for authenticated users.
- Mini diagram editor with locally persisted diagrams.
- Diagram storage abstraction through `DiagramStore`.
- Docker production build using a static server.
- GitHub Actions build workflow for pull requests and pushes to `main`.
- AWS deployment plan for Amplify Hosting or S3 + CloudFront.

## PlantUML Preview Security Note

PlantUML preview is rendered through the public PlantUML server in v1. Sensitive diagrams should not be rendered through the public server. A self-hosted PlantUML renderer is planned for production use.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- AWS Cognito via `amazon-cognito-identity-js`
- localStorage for current diagram persistence
- Docker
- GitHub Actions

## Architecture Overview

Current flow:

```text
React/Vite -> Cognito -> Protected Dashboard -> Editor -> DiagramStore -> localStorage
```

`DiagramStore` is the key persistence boundary. The app currently uses `localDiagramStore`, but the dashboard and editor depend on the interface rather than directly depending on browser storage. This keeps the project small today while leaving a clean path to a future DynamoDB-backed store.

Future cloud persistence flow:

```text
React/Vite -> Cognito -> API Gateway -> Lambda -> DynamoDB
```

See [docs/architecture.md](docs/architecture.md) for diagrams and deeper architecture notes.

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
VITE_COGNITO_USER_POOL_ID=ap-south-1_example
VITE_COGNITO_CLIENT_ID=exampleclientid
VITE_COGNITO_REGION=ap-south-1
```

Start the app:

```bash
npm run dev
```

## Environment Variables

Required Vite environment variables:

| Variable | Purpose |
| --- | --- |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Cognito SPA app client ID |
| `VITE_COGNITO_REGION` | AWS region, currently `ap-south-1` |

Do not commit `.env.local`. Vite exposes `VITE_*` values to the browser bundle, so these values should be treated as public configuration, not AWS credentials.

## Docker Setup

Build the image:

```bash
docker build -t diagramify-mini .
```

Run the container:

```bash
docker run --rm -p 4173:4173 diagramify-mini
```

Or use Docker Compose:

```bash
docker compose up --build
```

Open `http://localhost:4173`.

## Build And Verification Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

The GitHub Actions workflow runs dependency installation and `npm run build`. It does not deploy and does not require AWS credentials.

## AWS Cognito Setup Summary

- Region: `ap-south-1`
- User pool authentication.
- Email/password only.
- Self-registration enabled.
- Email verification code flow.
- SPA app client with client secret disabled.
- Required env vars: `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION`.

See [docs/cognito-setup.md](docs/cognito-setup.md).

## Storage Plan

Current storage: browser `localStorage` through `localDiagramStore`.

Future storage: DynamoDB through a backend-backed `DiagramStore` implementation, likely using API Gateway and Lambda.

This staged approach keeps the first version easy to run locally and avoids AWS database cost until cloud persistence is needed.

## Deployment Plan

First deployment target: AWS Amplify Hosting for the static Vite build.

Future option: S3 + CloudFront for a more explicit static hosting setup.

No deployment workflow is included yet, and no AWS credentials are required in this repository. See [docs/deployment.md](docs/deployment.md).

## Cost Safety Notes

This project is designed to be free-tier safe:

- Set up AWS Budgets before deploying.
- Use a small monthly budget alert.
- Avoid NAT Gateway, RDS, and EC2 for this mini app.
- Avoid SMS MFA in Cognito.
- Keep the app static/serverless-first.
- Add DynamoDB only when cloud persistence is needed.
- Monitor the Billing dashboard after deployment.

See [docs/aws-cost-safety.md](docs/aws-cost-safety.md).

## What I Learned / DevOps Relevance

Diagramify Mini demonstrates how product work and DevOps thinking connect:

- Cognito authentication and protected route design.
- Local persistence behind an interface that can later move to DynamoDB.
- Repeatable production builds with Docker.
- CI validation with GitHub Actions.
- Static-first AWS deployment planning.
- Cost-safety decisions before adding cloud infrastructure.

The result is a small but reviewable app that shows practical engineering judgment without overbuilding.
