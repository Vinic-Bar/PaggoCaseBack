import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFile(file: Express.Multer.File, userId: number): Promise<{ filePath: string, invoiceId: number }> {
    try {
      const uploadPath = path.join('src/uploads', file.filename);
      console.log('Salvando arquivo em:', uploadPath);

      const existingInvoice = await this.prisma.invoice.findFirst({
        where: { imageUrl: uploadPath, userId },
      });

      if (existingInvoice) {
        console.log('Arquivo já existe no banco de dados:', uploadPath);
        return { filePath: uploadPath, invoiceId: existingInvoice.id };
      }

      const invoice = await this.prisma.invoice.create({
        data: {
          imageUrl: uploadPath,
          userId,
          text: '',
        },
      });

      console.log('Arquivo salvo no banco com sucesso:', uploadPath);
      return { filePath: uploadPath, invoiceId: invoice.id };
    } catch (error) {
      console.error('Erro ao salvar arquivo no banco:', error);
      throw new Error('Erro ao salvar arquivo no banco');
    }
  }

  async getUserDocuments(userId: number) {
    try {
      const documents = await this.prisma.invoice.findMany({
        where: { userId },
        include: { queries: true },
        orderBy: { createdAt: 'desc' },
      });
      console.log('Documentos recuperados:', documents);
      return documents;
    } catch (error) {
      console.error('Erro ao recuperar documentos:', error);
      throw new Error('Erro ao recuperar documentos');
    }
  }

  async generateDocument(invoiceId: number): Promise<string> {
    const document = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { queries: true },
    });

    if (!document) {
      throw new Error('Documento não encontrado');
    }

    const downloadsDir = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const doc = new PDFDocument();
    const filePath = path.join(downloadsDir, `document_${invoiceId}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Documento Enviado', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`ID: ${document.id}`);
    doc.fontSize(14).text(`Enviado em: ${new Date(document.createdAt).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(16).text('Texto Extraído:');
    doc.fontSize(12).text(document.text);
    doc.moveDown();
    doc.fontSize(16).text('Interações do LLM:');
    document.queries.forEach(query => {
      doc.fontSize(14).text(`Pergunta: ${query.query}`);
      doc.fontSize(14).text(`Resposta: ${query.response}`);
      doc.moveDown();
    });

    doc.end();

    return filePath;
  }

  async saveQuery(invoiceId: number, query: string, response: string) {
    if (!invoiceId) {
      throw new BadRequestException('invoiceId é obrigatório.');
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Nenhuma fatura encontrada com ID ${invoiceId}`);
    }

    await this.prisma.query.create({
      data: {
        invoiceId,
        query,
        response,
      },
    });
  }

  async updateInvoiceText(invoiceId: number, text: string): Promise<void> {
    try {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { text },
      });
      console.log('Texto da fatura atualizado com sucesso:', text);
    } catch (error) {
      console.error('Erro ao atualizar o texto da fatura:', error);
      throw new Error('Erro ao atualizar o texto da fatura');
    }
  }
}
