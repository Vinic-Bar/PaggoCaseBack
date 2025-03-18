import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OcrService {
  constructor(private readonly prisma: PrismaService) {}

  async extractText(imagePath: string, userId: number): Promise<string> {
    if (!userId) {
      throw new Error('userId não pode ser nulo ou indefinido');
    }

    try {
      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;

      return text;
    } catch (error) {
      console.error('Error during OCR processing:', error);
      throw error;
    }
  }
}