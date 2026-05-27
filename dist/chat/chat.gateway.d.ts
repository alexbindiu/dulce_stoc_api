import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleJoin(client: Socket): Promise<void>;
    handleMessage(client: Socket, payload: {
        senderName: string;
        text: string;
    }): Promise<void>;
}
