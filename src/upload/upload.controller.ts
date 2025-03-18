import { Controller, Post, Get, UseInterceptors, UploadedFile, Req, Res, Param, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadService } from './upload.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('Token não fornecido');
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não definido');
      }
      const decoded: any = jwt.verify(token, jwtSecret);
      console.log('Decoded Token:', decoded);
      
      const userId = Number(decoded.userId);
      if (isNaN(userId)) {
        throw new Error('userId inválido no token');
      }

      const { filePath, invoiceId } = await this.uploadService.saveFile(file, userId);
      res.json({ filePath, invoiceId });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro ao fazer upload' });
    }
  }

  @Post('save-query')
  async saveQuery(@Body() body: { invoiceId: number; query: string; response: string }) {
    console.log('Recebendo invoiceId:', body.invoiceId);

    if (!body.invoiceId) {
      throw new BadRequestException('invoiceId é obrigatório.');
    }

    return this.uploadService.saveQuery(body.invoiceId, body.query, body.response);
  }

  @Post('update-invoice-text')
  async updateInvoiceText(@Body() body: { invoiceId: number; text: string }) {
    try {
      await this.uploadService.updateInvoiceText(body.invoiceId, body.text);
      return { message: 'Texto da fatura atualizado com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar o texto da fatura:', error);
      throw new Error('Erro ao atualizar o texto da fatura');
    }
  }

  @Get('documents')
  async getUserDocuments(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('Token não fornecido');
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não definido');
      }
      const decoded: any = jwt.verify(token, jwtSecret);
      console.log('Decoded Token:', decoded);
      
      const userId = Number(decoded.userId);
      if (isNaN(userId)) {
        throw new Error('userId inválido no token');
      }

      const documents = await this.uploadService.getUserDocuments(userId);
      console.log('Documentos enviados para o cliente:', documents);
      res.json(documents);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      res.status(500).json({ error: 'Erro ao buscar documentos' });
    }
  }

  @Get('download/:id')
  async downloadDocument(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      const invoiceId = Number(id);
      if (isNaN(invoiceId)) {
        throw new Error('ID do documento inválido');
      }
  
      const filePath = await this.uploadService.generateDocument(invoiceId);
  
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Documento não encontrado' });
        return;
      }
  
      res.download(filePath, `document_${invoiceId}.pdf`, (err) => {
        if (err) {
          console.error('Erro ao baixar documento:', err);
          res.status(500).json({ error: 'Erro ao baixar documento' });
        }
      });
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      res.status(500).json({ error: 'Erro ao gerar documento' });
    }
  }  
}