import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

const providers = [];

@Module({
  imports: [AuthModule],
  providers,
  exports: [],
})
export class RuoYiFrameworkModule {}
