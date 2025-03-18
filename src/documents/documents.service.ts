import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentsService {
  async saveDocument(filePath: string) {
    // salvar o caminho do arquivo no banco de dados
    console.log('Arquivo salvo no caminho: ', filePath);
  }
}