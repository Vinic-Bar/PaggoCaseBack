import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post()
  async getExplanation(@Body() body: { text: string; query: string; invoiceId: number }) {
    const { text, query, invoiceId } = body;
    const explanation = await this.llmService.getExplanation(text, query, invoiceId);
    return { explanation };
  }
}
