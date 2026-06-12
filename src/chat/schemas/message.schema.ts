import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  // 'city:<City>' pentru grup, 'dm:<businessId>:<clientId>' pentru 1-la-1
  @Prop({ required: true, index: true })
  room: string;

  @Prop({ default: 'CITY' })
  kind: string; // 'CITY' | 'DM'

  // Doar pentru DM
  @Prop() businessId?: string;
  @Prop() businessName?: string;
  @Prop() clientId?: string;
  @Prop() clientName?: string;

  // Cine a trimis mesajul (identitate reală)
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop()
  senderRole?: string; // 'CLIENT' | 'BUSINESS'

  @Prop({ required: true })
  text: string;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
