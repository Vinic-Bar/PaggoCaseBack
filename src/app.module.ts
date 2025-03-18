import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { OcrModule } from './ocr/ocr.module';
import { UserModule } from './user/user.module';
import { LlmModule } from './llm/llm.module';
import { UploadService } from './upload/upload.service';
import { UploadController } from './upload/upload.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './src/uploads', // Atualizado para a nova pasta
        filename: (req, file, callback) => {
          const filename = `${Date.now()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, 'uploads'), // Atualizado para a nova pasta
      serveRoot: '/uploads',
    }),
    OcrModule,
    UserModule,
    UploadModule,
    LlmModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, PrismaService],
})
export class AppModule {}
