import { Module } from '@nestjs/common';
import { GenModule } from './gen/gen.module';

@Module({
  imports: [GenModule]
})
export class RuoYiGeneratorModule {}
