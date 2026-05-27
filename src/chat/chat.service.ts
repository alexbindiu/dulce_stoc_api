import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async saveMessage(senderName: string, text: string): Promise<Message> {
    const newMessage = new this.messageModel({ senderName, text });
    return newMessage.save();
  }

  async getRecentMessages(): Promise<Message[]> {
    // Aduce ultimele 50 de mesaje
    return this.messageModel.find().sort({ createdAt: 1 }).limit(50).exec();
  }
}