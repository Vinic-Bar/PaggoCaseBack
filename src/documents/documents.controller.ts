import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';  // Importação do DocumentsService

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}  // Injeção do serviço

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(__dirname, '../../uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); 
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'Nenhum arquivo upado' };
    }

    const filePath = `/uploads/${file.filename}`;
    await this.documentsService.saveDocument(filePath); 

    return {
      message: 'Arquivo enviado com sucesso',
      filePath: filePath,
    };
  }
}