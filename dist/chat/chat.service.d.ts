import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
export declare class ChatService {
    private messageModel;
    constructor(messageModel: Model<Message>);
    saveMessage(senderName: string, text: string): Promise<Message>;
    getRecentMessages(): Promise<Message[]>;
}
