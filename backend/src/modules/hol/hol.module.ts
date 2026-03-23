import { Module } from '@nestjs/common';
import { HolController } from './hol.controller';

@Module({
  controllers: [HolController],
})
export class HolModule {}
