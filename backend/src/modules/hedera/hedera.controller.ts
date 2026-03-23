import { Controller, Get, Param } from '@nestjs/common';
import { HederaService } from './hedera.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('hedera')
@Controller('hedera')
export class HederaController {
  constructor(private readonly hederaService: HederaService) {}

  /**
   * GET /hedera/stats — Hedera network contribution metrics
   * Shows platform's impact on Hedera network (TPS, accounts, NFTs, etc.)
   * Critical for hackathon "Success" criterion (20% weight)
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Hedera network stats',
    description: 'Returns ConfirmIT platform contribution to Hedera network activity',
  })
  async getNetworkStats() {
    return this.hederaService.getNetworkStats();
  }

  /**
   * GET /hedera/verify/:transactionId
   * True bidirectional integration: Verifies data against Hedera Mirror Node
   */
  @Get('verify/:transactionId')
  @ApiOperation({
    summary: 'Verify transaction against Mirror Node',
    description: 'Fetches real on-chain data and compares with local records',
  })
  @ApiParam({ name: 'transactionId', description: 'Hedera Transaction ID to verify' })
  async verifyAnchorByMirrorNode(@Param('transactionId') transactionId: string) {
    return this.hederaService.verifyAnchorByMirrorNode(transactionId);
  }

  /**
   * GET /hedera/feed
   * Returns live HCS events directly from the Hedera Mirror Node
   */
  @Get('feed')
  @ApiOperation({
    summary: 'Live HCS Event Feed',
    description: 'Fetches the latest trust events directly from the public Hedera ledger',
  })
  async getLiveFeed() {
    return this.hederaService.getLiveFeed();
  }
}
