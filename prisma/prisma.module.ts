import { Module, Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  // Add your service methods here
}

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}