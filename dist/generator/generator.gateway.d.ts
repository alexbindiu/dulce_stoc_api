import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class GeneratorGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcastBatch(products: any[], stats: {
        total: number;
        generated: number;
    }): void;
    broadcastStatus(status: 'started' | 'stopped', intervalMs: number, batchSize: number): void;
}
