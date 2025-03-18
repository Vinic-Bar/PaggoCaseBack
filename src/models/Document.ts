import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

interface Query {
  query: string;
  response: string;
}

interface Document extends MongooseDocument {
  userId: number;
  imageUrl: string;
  text: string;
  createdAt: Date;
  llmResponse: string;
  queries: Query[];
}

const DocumentSchema = new Schema<Document>({
  userId: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  llmResponse: { type: String, required: false },
  queries: [
    {
      query: { type: String, required: true },
      response: { type: String, required: true },
    },
  ],
});

const DocumentModel = mongoose.model<Document>('Document', DocumentSchema);

export { DocumentModel as Document };