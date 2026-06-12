import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, ChatMessageInput } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Intră într-o cameră (oraș sau DM) și primește istoricul ei
  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { room }: { room: string },
  ) {
    if (!room) return;
    client.join(room);
    const messages = await this.chatService.getRoomHistory(room);
    client.emit('chat:history', { room, messages });
  }

  @SubscribeMessage('chat:leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() { room }: { room: string },
  ) {
    if (room) client.leave(room);
  }

  // Adminul se abonează la notificări pentru TOATE conversațiile afacerii sale,
  // ca să vadă în timp real și clienții noi (nu doar conversația deschisă).
  @SubscribeMessage('chat:inbox:subscribe')
  handleInboxSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() { businessId }: { businessId: string },
  ) {
    if (businessId) client.join(`biz:${businessId}`);
  }

  // Trimite un mesaj într-o cameră — îl salvăm și îl difuzăm doar acelei camere
  @SubscribeMessage('chat:send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessageInput,
  ) {
    if (!payload?.room || !payload?.text?.trim() || !payload?.senderId) return;
    const saved = await this.chatService.saveMessage(payload);
    this.server.to(payload.room).emit('chat:newMessage', saved);

    // Notifică inbox-ul afacerii (chiar dacă nu are conversația deschisă)
    if (payload.kind === 'DM' && payload.businessId) {
      this.server.to(`biz:${payload.businessId}`).emit('chat:inbox-updated');
    }
  }

  // Inbox admin: lista conversațiilor cu clienții
  @SubscribeMessage('chat:conversations:get')
  async handleConversations(
    @ConnectedSocket() client: Socket,
    @MessageBody() { businessId }: { businessId: string },
  ) {
    if (!businessId) return;
    const conversations = await this.chatService.getConversationsForBusiness(businessId);
    client.emit('chat:conversations', conversations);
  }
}
