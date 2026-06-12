import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';

export interface ChatMessageInput {
  room: string;
  kind?: string; // 'CITY' | 'DM'
  businessId?: string;
  businessName?: string;
  clientId?: string;
  clientName?: string;
  senderId: string;
  senderName: string;
  senderRole?: string; // 'CLIENT' | 'BUSINESS'
  text: string;
}

export interface ConversationSummary {
  clientId: string;
  clientName: string;
  room: string;
  lastMessage: string;
  lastAt: Date;
}

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async saveMessage(input: ChatMessageInput): Promise<Message> {
    const msg = new this.messageModel({ kind: 'CITY', ...input });
    return msg.save();
  }

  async getRoomHistory(room: string): Promise<Message[]> {
    return this.messageModel.find({ room }).sort({ createdAt: 1 }).limit(100).exec();
  }

  // Inbox admin: clienții distincți care au scris afacerii, cu ultimul mesaj.
  async getConversationsForBusiness(businessId: string): Promise<ConversationSummary[]> {
    const docs = await this.messageModel
      .find({ kind: 'DM', businessId })
      .sort({ createdAt: 1 })
      .exec();

    const byClient = new Map<string, ConversationSummary>();
    for (const m of docs) {
      if (!m.clientId) continue;
      byClient.set(m.clientId, {
        clientId: m.clientId,
        clientName: m.clientName ?? 'Client',
        room: m.room,
        lastMessage: m.text,
        lastAt: (m as any).createdAt,
      });
    }
    return Array.from(byClient.values()).sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
  }
}
