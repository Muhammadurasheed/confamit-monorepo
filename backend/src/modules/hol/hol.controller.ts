import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as admin from 'firebase-admin';

@ApiTags('hol-bounty')
@Controller('hol')
export class HolController {
  private readonly db = admin.firestore();
  private readonly logger = new Logger(HolController.name);

  /**
   * FAANG-Level Feature: HOL Bounty Agent Interface
   * Exposes a structured endpoint for the Hashgraph Online Agent Registry
   */
  @Post('query')
  @ApiOperation({
    summary: 'HOL Agent Natural Language Gateway',
    description: 'Interface for HOL agents to securely query the ConfirmIT trust registry',
  })
  async handleHolAgentQuery(@Body() body: any) {
    this.logger.log(`Received HOL Agent Query: ${JSON.stringify(body)}`);
    const { query, entity_type, entity_id } = body;

    try {
      if (entity_type === 'business' && entity_id) {
        const doc = await this.db.collection('businesses').doc(entity_id).get();
        if (doc.exists) {
          const data = doc.data();
          return {
            agent_response: `Business identity confirmed. Status: ${data.status.toUpperCase()}. Trust Score: ${data.trustScore || 'N/A'}/100. Verification Tier: ${data.verificationTier}.`,
            verified: data.status === 'verified',
            raw_data: data
          };
        }
      }

      if (entity_type === 'fraud_lookup' && body.account_number) {
        const querySnapshot = await this.db
            .collection('fraud_reports')
            .where('accountNumber', '==', body.account_number)
            .get();
        
        if (!querySnapshot.empty) {
          return {
            agent_response: `WARNING: Found ${querySnapshot.size} fraud reports associated with this account number.`,
            verified: false,
            risk_level: 'HIGH',
            report_count: querySnapshot.size
          };
        } else {
            return {
                agent_response: `No fraud reports found for this account.`,
                verified: null,
                risk_level: 'LOW',
            };
        }
      }
      
      return {
        agent_response: "I could not find a confirmed entity matching that query in the Hedera trust registry.",
        verified: false,
        raw_data: null
      };
    } catch (e) {
      this.logger.error(`HOL Query failed: ${e.message}`);
      return { agent_response: "System error querying the trust registry", error: e.message };
    }
  }
}
