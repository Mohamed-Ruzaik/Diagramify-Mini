# AWS Cost Safety

Diagramify Mini is intentionally designed to stay free-tier safe while demonstrating AWS readiness.

## Before Deploying

Create an AWS Budget before deploying any resources:

1. Open AWS Billing and Cost Management.
2. Create a small monthly budget alert.
3. Use an email address you check regularly.
4. Monitor the Billing dashboard after deployment.

A small alert such as USD 1 to USD 5 is enough for early testing.

## Cost-Safe Choices

- Keep the app serverless/static-first.
- Start with AWS Amplify Hosting or S3 + CloudFront for static hosting.
- Use Cognito email/password authentication only.
- Use DynamoDB only when persistent cloud storage is needed.
- Keep the first version on browser `localStorage` to avoid database cost during review.

## Services To Avoid For This Mini App

- Avoid NAT Gateway because it can create steady hourly cost.
- Avoid RDS because this app does not need a relational database.
- Avoid EC2 unless there is a clear reason to run a server.
- Avoid SMS MFA in Cognito because SMS can create additional charges.
- Avoid always-on infrastructure for a static React app.

## Cognito Cost Notes

Use email/password authentication with email verification. Do not enable SMS MFA for this mini app. Keep the user pool simple and avoid paid advanced security features unless they are specifically needed later.

## DynamoDB Cost Notes

DynamoDB should be added only when cloud persistence is required. Start with low-volume, on-demand capacity and monitor usage after release. A simple per-user diagram table is enough for the planned future version.

## Monitoring Checklist

- Confirm AWS Budgets is active.
- Check the Billing dashboard after the first deployment.
- Review Amplify, Cognito, CloudFront, S3, and DynamoDB usage if those services are enabled.
- Remove unused resources after experiments.
- Keep credentials out of the repository.
