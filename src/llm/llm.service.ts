import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LlmService {
  private readonly apiKey = process.env.HUGGING_FACE_API_KEY;

  constructor(private readonly prisma: PrismaService) {}

  async getExplanation(text: string, query: string, invoiceId: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('HUGGING_FACE_API_KEY não está definido');
    }

    const prompt = `Texto: ${text}\nPergunta: ${query}\nResposta:`;

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/gpt2', // Use o modelo desejado
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(response.data); // Para depuração

      let explanation: string;
      if (response.data && response.data.generated_text) {
        explanation = response.data.generated_text.trim();
      } else if (response.data && response.data[0] && response.data[0].generated_text) {
        explanation = response.data[0].generated_text.trim();
      } else {
        console.error('Formato de resposta inesperado:', response.data);
        throw new Error('Formato de resposta inesperado da API da Hugging Face');
      }

      return explanation;
    } catch (error) {
      console.error('Error calling Hugging Face API:', error.response?.data || error.message);
      throw new Error(`Erro ao chamar a API da Hugging Face: ${error.response?.data?.error || error.message}`);
    }
  }
}
