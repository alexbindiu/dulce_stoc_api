import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);