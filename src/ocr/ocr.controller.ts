import { Controller, Post, Body, Res } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { Response } from 'express';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post()
  async extractText(@Body() body: { imagePath: string, userId: number }, @Res() res: Response): Promise<void> {
    const { imagePath, userId } = body;

    if (!imagePath || !userId) {
      res.status(400).json({ error: 'imagePath e userId são obrigatórios' });
      return;
    }

    try {
      const text = await this.ocrService.extractText(imagePath, userId);
      res.json({ text });
    } catch (error) {
      console.error('Error extracting text:', error);
      res.status(500).json({ error: 'Erro ao extrair o texto' });
    }
  }
}