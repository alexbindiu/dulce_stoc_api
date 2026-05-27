import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

// Ascultăm pe același port și configurăm CORS
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Când un user deschide chat-ul, îi trimitem istoricul din MongoDB
  @SubscribeMessage('chat:join')
  async handleJoin(@ConnectedSocket() client: Socket) {
    const history = await this.chatService.getRecentMessages();
    client.emit('chat:history', history);
  }

  // Când un user trimite un mesaj
  @SubscribeMessage('chat:sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { senderName: string; text: string }
  ) {
    // 1. Salvăm în NoSQL (MongoDB)
    const savedMessage = await this.chatService.saveMessage(payload.senderName, payload.text);
    
    // 2. Trimitem mesajul instant către TOȚI userii conectați (Real-Time)
    this.server.emit('chat:newMessage', savedMessage);
  }
}