# Deployment

This document describes how to run Diagramify Mini locally, build it for production, and prepare for AWS deployment without adding cloud cost too early.

## Local Development Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` with the variables listed below.

Start the development server:

```bash
npm run dev
```

## Required Environment Variables

The Vite app needs these Cognito values:

```bash
VITE_COGNITO_USER_POOL_ID=ap-south-1_example
VITE_COGNITO_CLIENT_ID=exampleclientid
VITE_COGNITO_REGION=ap-south-1
```

Do not commit `.env.local`. It is for local machine configuration only.

## Production Build

Build the static app:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Docker Run Steps

Build the container image:

```bash
docker build -t diagramify-mini .
```

Run the container:

```bash
docker run --rm -p 4173:4173 diagramify-mini
```

Open:

```text
http://localhost:4173
```

You can also use Docker Compose:

```bash
docker compose up --build
```

## AWS Amplify Hosting Plan

Amplify Hosting is the preferred first deployment target because the app is a static Vite SPA and does not need servers for the current version.

Planned steps:

1. Connect the GitHub repository to Amplify Hosting.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add the required `VITE_COGNITO_*` environment variables in Amplify.
5. Deploy from the main branch after CI passes.

No AWS credentials should be committed to the repository. Amplify should manage deployment access through AWS console configuration.

## Future S3 + CloudFront Plan

A later deployment option is S3 static hosting behind CloudFront.

Planned steps:

1. Run `npm run build`.
2. Upload `dist` assets to a private S3 bucket.
3. Serve the site through CloudFront.
4. Configure SPA fallback so dashboard/editor routes resolve to `index.html`.
5. Keep Cognito configuration in build-time environment variables.

This option gives more infrastructure control, but Amplify Hosting is simpler for the first production deployment.

## Current Deployment Status

Deployment is planned but not active yet. The repository currently includes CI and Docker proof, but no AWS credentials, deployment workflow, or cloud database implementation.
