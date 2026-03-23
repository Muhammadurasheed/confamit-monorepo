# @confirmit/sdk

<p>
  <img src="https://img.shields.io/npm/v/@confirmit/sdk" alt="NPM Version" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Hedera-Integrated-purple" alt="Hedera Ecosystem" />
</p>

The official Node.js / TypeScript SDK for ConfirmIT — the AI-powered trust verification infrastructure built on the Hedera Hashgraph.

Stop your users from getting scammed. Implement forensic receipt verification and fraud-registry account checks with three lines of code.

## Installation

```bash
npm install @confirmit/sdk
# or
pnpm add @confirmit/sdk
# or
yarn add @confirmit/sdk
```

## Quick Start

Initialize the client with your designated API Key.

```typescript
import { ConfirmIT, ConfirmITError } from '@confirmit/sdk';

const confirmit = new ConfirmIT('sk_live_your_api_key', {
  maxRetries: 3, // Automatically back off and retry on 429s
  timeout: 30000 // 30 second timeout per request
});
```

### 1. Verify a Receipt (with Hedera Anchoring)

Run an uploaded receipt through our 5-agent AI forensic pipeline (OCR, ELA tracking, Metadata analysis). By passing `anchorOnHedera: true`, the cryptographically signed result is permanently written to the Hedera Consensus Service.

```typescript
try {
  const result = await confirmit.verifyReceipt('https://yourbucket.com/receipt-img.jpg', {
    anchorOnHedera: true
  });

  if (result.verdict === 'fraudulent') {
    console.log(`🚨 Receipt tampered! Trust Score: ${result.trustScore}/100`);
    console.log(`Issues:`, result.issues);
  } else {
    // Verified 
    console.log(`✅ Authentic receipt! Hedera TX: ${result.hederaAnchor?.transactionId}`);
  }
} catch (error) {
  if (error instanceof ConfirmITError) {
    console.error(`API Error ${error.status}: ${error.code} - ${error.message}`);
  }
}
```

### 2. Verify an Account Before Transfer

Verify if an account is clean before hitting your payout provider's API. 

```typescript
const account = await confirmit.checkAccount('0123456789', '058');

if (account.riskLevel === 'high') {
  console.log(`Account flagged! ${account.fraudReports.recent30Days} reports in the last 30 days.`);
} else if (account.verifiedBusiness) {
  console.log(`Great! This account belongs to a Verified Business on our network limit.`);
}
```

### 3. Validate Secure Webhooks

When you subscribe to async Trust Score changes or Hedera finality updates, securely validate that the webhook originated from ConfirmIT using your webhook signing secret.

```typescript
import express from 'express';
import { ConfirmIT } from '@confirmit/sdk';

const app = express();

// Important: Parse the raw body payload when verifying signatures
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-confirmit-signature'] as string;
  const payload = req.body.toString();
  const secret = process.env.CONFIRMIT_WEBHOOK_SECRET;

  const isValid = ConfirmIT.validateWebhook(signature, payload, secret);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Handle verified event
  const event = JSON.parse(payload);
  console.log('Received safe event:', event.type);
  res.status(200).send();
});
```

## Security & Transparency

ConfirmIT is the only fraud-verification protocol in Africa that mathematically proves its own decisions. We process AI verdicts directly into the **Hedera File Service (HFS)** and commit them directly to the **Hedera Consensus Service (HCS)** so our logs can never be silently altered or deleted. Every trust action has a visible `/verify` blockchain footprint.
