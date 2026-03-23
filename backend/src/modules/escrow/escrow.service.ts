import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { HederaService } from '../hedera/hedera.service';
import axios from 'axios';

export interface EscrowState {
  id: string;
  buyerEmail: string;
  vendorAccount: string;
  vendorName: string;
  amount: number;
  itemName: string;
  status: 'AWAITING_FUNDS' | 'FUNDS_LOCKED' | 'RELEASED';
  createdAt: string;
  lockedAt?: string;
  releasedAt?: string;
  receiptUrl?: string;
  releasePin: string;
  hederaLogs: string[];
  finalProofTx?: string;
  finalProofUrl?: string;
  lastLockProofTx?: string;
  lastLockProofUrl?: string;
  paystackReference?: string;
  paymentMethod: 'paystack' | 'hbar';
  hbarTransactionId?: string;
  bankName?: string;
  bankAccountNumber?: string;
}

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(private readonly hederaService: HederaService) {}

  async createEscrow(data: { 
    buyerEmail: string, 
    vendorAccount: string, 
    vendorName: string,
    amount: number, 
    itemName: string,
    paystackReference?: string,
    paymentMethod?: 'paystack' | 'hbar',
    bankName?: string,
    bankAccountNumber?: string,
    uid?: string // Added for credit deduction
  }) {
    const db = admin.firestore();
    const serviceFee = 200; // Fixed 200 credits/naira fee
    
    // Verify Paystack payment if reference is provided
    if (data.paystackReference) {
      this.logger.log(`🔍 Verifying Paystack reference: ${data.paystackReference}`);
      try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        this.logger.log(`📡 Sending verification request to Paystack...`);
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${data.paystackReference}`,
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
            },
            timeout: 10000, // 10s timeout
          }
        );

        this.logger.log(`✅ Paystack response status: ${response.data.data.status}`);
        if (response.data.data.status !== 'success') {
          throw new BadRequestException('Paystack payment verification failed');
        }
        
        // Verify amount matches (Paystack amount is in kobo)
        if (response.data.data.amount !== data.amount * 100) {
          this.logger.error(`❌ Amount mismatch. Expected: ${data.amount * 100}, Got: ${response.data.data.amount}`);
          throw new BadRequestException('Payment amount mismatch');
        }
        this.logger.log(`💰 Payment amount verified: ${data.amount}`);
      } catch (error) {
        this.logger.error(`❌ Paystack verification error: ${error.message}`, error.stack);
        throw new BadRequestException('Could not verify Paystack payment. Service might be slow or key invalid.');
      }
    }

    this.logger.log(`💰 Verifying Trust Credits for user: ${data.uid}`);
    if (data.uid) {
      const userRef = db.collection('users').doc(data.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists || (userDoc.data()?.credits || 0) < serviceFee) {
        this.logger.error(`❌ Insufficient credits for user ${data.uid}`);
        throw new BadRequestException('Insufficient Trust Credits. Please top up in your dashboard.');
      }

      // Atomic deduction
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-serviceFee),
        total_spent: admin.firestore.FieldValue.increment(serviceFee)
      });
      this.logger.log(`✅ Deducted ${serviceFee} credits from user profile`);

      // Anchor Fee Deduction to Hedera HCS
      try {
        await this.hederaService.anchorFraudReportToHCS(
          data.uid,
          'billing',
          'fee_deduction',
          data.uid,
          {
            summary: `🛡️ [BILLING] Fee Deduction: 200 CTT`,
            fee: serviceFee,
            action: 'ESCROW_INIT',
            timestamp: new Date().toISOString()
          }
        );
      } catch (e) {
        this.logger.error('Failed to anchor fee deduction to Hedera', e);
      }
    }

    this.logger.log(`📝 Initializing Firestore document for vault...`);
    const escrowRef = db.collection('escrows').doc();
    this.logger.log(`🆔 Generated Vault ID: ${escrowRef.id}`);
    
    // Generate a secure 4-digit PIN early
    const releasePin = Math.floor(1000 + Math.random() * 9000).toString();

    // Fire-and-forget anchoring to Hedera HCS (Ledger proof in background)
    const vendorAnchor = data.vendorAccount || '0.0.0';
    this.hederaService.anchorFraudReportToHCS(
      vendorAnchor, 
      'escrow', 
      'init_vault', 
      escrowRef.id,
      {
        summary: `🎉 [ESCROW] Init: ${data.itemName} (₦${data.amount.toLocaleString()})`,
        buyer: data.buyerEmail,
        vendor: data.vendorName,
        item: data.itemName,
        amount: data.amount,
        method: data.paymentMethod || 'paystack'
      }
    )
      .then(anchor => {
        this.logger.log(`✅ Vault ${escrowRef.id} anchored to HCS with tx: ${anchor.transactionId}`);
        escrowRef.update({ 
          hederaLogs: admin.firestore.FieldValue.arrayUnion(anchor.transactionId),
          lastLockProofTx: anchor.transactionId,
          lastLockProofUrl: anchor.explorerUrl
        });
      })
      .catch(e => this.logger.error(`❌ Non-blocking anchoring failed for vault ${escrowRef.id}`, e));

    const escrowData: EscrowState = {
      id: escrowRef.id,
      buyerEmail: data.buyerEmail,
      vendorAccount: data.vendorAccount || '0.0.0',
      vendorName: data.vendorName,
      amount: data.amount,
      itemName: data.itemName,
      status: data.paystackReference ? 'FUNDS_LOCKED' : 'AWAITING_FUNDS',
      createdAt: new Date().toISOString(),
      lockedAt: (data.paystackReference || data.paymentMethod === 'hbar') ? new Date().toISOString() : undefined,
      releasePin,
      hederaLogs: [],
      paystackReference: data.paystackReference,
      paymentMethod: data.paymentMethod || 'paystack',
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber
    };

    this.logger.log(`💾 Persisting Escrow Vault to Firestore...`);
    await escrowRef.set(escrowData);
    this.logger.log(`🎉 Escrow Vault ${escrowRef.id} successfully established!`);
    return escrowData;
  }

  async getEscrow(id: string) {
    const db = admin.firestore();
    const doc = await db.collection('escrows').doc(id).get();
    if (!doc.exists) throw new NotFoundException('Escrow vault not found');
    return doc.data() as EscrowState;
  }

  async depositFunds(id: string) {
    const db = admin.firestore();
    const escrowRef = db.collection('escrows').doc(id);
    const doc = await escrowRef.get();
    if (!doc.exists) throw new NotFoundException('Escrow vault not found');
    
    const data = doc.data() as EscrowState;
    if (data.status !== 'AWAITING_FUNDS') throw new BadRequestException('Vault is not awaiting funds');

    // Anchor Lock to Hedera HCS (Simulating Hedera Smart Contract Lock)
    const message = `[ESCROW_LOCK] ID:${id} - Funds Secured in Trustless Vault`;
    let txId = null;
    let explorerUrl = null;
    const vendorAnchor = data.vendorAccount || '0.0.0';
    try {
      const anchor = await this.hederaService.anchorFraudReportToHCS(
        vendorAnchor, 
        'escrow', 
        'funds_locked', 
        id,
        {
          summary: `🔒 [ESCROW] Locked: ${data.itemName} (₦${data.amount.toLocaleString()})`,
          item: data.itemName,
          amount: data.amount,
          buyer: data.buyerEmail
        }
      );
      txId = anchor.transactionId;
      explorerUrl = anchor.explorerUrl;
    } catch (e) {
      this.logger.error('Failed to anchor escrow lock', e);
    }

    const updates = {
      status: 'FUNDS_LOCKED',
      lockedAt: new Date().toISOString(),
      hederaLogs: txId ? admin.firestore.FieldValue.arrayUnion(txId) : data.hederaLogs,
      lastLockProofTx: txId,
      lastLockProofUrl: explorerUrl,
    };

    await escrowRef.update(updates);
    return { ...data, ...updates, success: true };
  }

  async releaseFunds(id: string, receiptUrl: string) {
    const db = admin.firestore();
    const escrowRef = db.collection('escrows').doc(id);
    const doc = await escrowRef.get();
    if (!doc.exists) throw new NotFoundException('Escrow vault not found');
    
    const data = doc.data() as EscrowState;
    if (data.status !== 'FUNDS_LOCKED') throw new BadRequestException('Vault is not in a LOCKED state');

    // Anchor Release to Hedera HCS (Simulating Oracle-triggered Smart Contract Release)
    const message = `[ESCROW_RELEASE] ID:${id} - AI Oracle Verified Delivery Receipt. Funds Releasing to Vendor.`;
    let txId = null;
    let explorerUrl = null;
    const vendorAnchor = data.vendorAccount || '0.0.0';
    try {
      const anchor = await this.hederaService.anchorFraudReportToHCS(
        vendorAnchor, 
        'escrow', 
        'funds_released', 
        id,
        {
          summary: `✅ [ESCROW] Released: ${data.itemName} (₦${data.amount.toLocaleString()})`,
          item: data.itemName,
          amount: data.amount,
          vendor: data.vendorName,
          receipt_url: receiptUrl
        }
      );
      txId = anchor.transactionId;
      explorerUrl = anchor.explorerUrl;
    } catch (e) {
      this.logger.error('Failed to anchor escrow release', e);
    }

    const updates = {
      status: 'RELEASED',
      releasedAt: new Date().toISOString(),
      receiptUrl,
      hederaLogs: txId ? admin.firestore.FieldValue.arrayUnion(txId) : data.hederaLogs,
      finalProofTx: txId,
      finalProofUrl: explorerUrl
    };

    await escrowRef.update(updates);
    return { ...data, ...updates, success: true };
  }

  // The Malicious-Buyer-Proof OTP Handshake
  async releaseFundsWithPin(id: string, pin: string) {
    const db = admin.firestore();
    const escrowRef = db.collection('escrows').doc(id);
    const doc = await escrowRef.get();
    if (!doc.exists) throw new NotFoundException('Escrow vault not found');
    
    const data = doc.data() as EscrowState;
    if (data.status !== 'FUNDS_LOCKED') throw new BadRequestException('Vault is not in a LOCKED state');
    
    if (data.releasePin !== pin) {
      throw new BadRequestException('Invalid Release PIN. Access Denied.');
    }

    // Anchor Release to Hedera HCS 
    const message = `[ESCROW_RELEASE] ID:${id} - Cryptographic OTP PIN Verified. Funds Releasing to Vendor.`;
    let txId = null;
    let explorerUrl = null;
    const vendorAnchor = data.vendorAccount || '0.0.0';
    try {
      const anchor = await this.hederaService.anchorFraudReportToHCS(
        vendorAnchor, 
        'escrow', 
        'funds_released_via_pin', 
        id,
        {
          summary: `🔑 [ESCROW] PIN Release: ${data.itemName} (₦${data.amount.toLocaleString()})`,
          item: data.itemName,
          amount: data.amount,
          vendor: data.vendorName,
          settlement: data.paymentMethod
        }
      );
      txId = anchor.transactionId;
      explorerUrl = anchor.explorerUrl;
    } catch (e) {
      this.logger.error('Failed to anchor escrow release via PIN', e);
    }

    // Release funds based on payment method
    let settlementResult = null;
    if (data.paymentMethod === 'hbar') {
      try {
        // HBAR Native Settlement
        settlementResult = await this.hederaService.sendHbar(
          data.vendorAccount === '0.0.0' ? process.env.TREASURY_ACCOUNT_ID : data.vendorAccount,
          data.amount / 500, // Simulating HBAR equivalent (Scale as needed)
          `[ConfirmIT] Release for Vault ${id}`
        );
      } catch (e) {
        this.logger.error('Native HBAR release failed', e);
      }
    }

    const updates = {
      status: 'RELEASED',
      releasedAt: new Date().toISOString(),
      hederaLogs: txId ? admin.firestore.FieldValue.arrayUnion(txId) : data.hederaLogs,
      finalProofTx: settlementResult?.transactionId || txId,
      finalProofUrl: settlementResult?.explorerUrl || explorerUrl
    };

    await escrowRef.update(updates);
    return { ...data, ...updates, success: true };
  }

}

