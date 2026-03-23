import { Module } from '@nestjs/common';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [HederaModule],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
