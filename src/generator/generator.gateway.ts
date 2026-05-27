import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GeneratorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = 0;

  handleConnection(client: Socket) {
    this.connectedClients++;
    console.log(`[WS] Client connected: ${client.id} (total: ${this.connectedClients})`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    console.log(`[WS] Client disconnected: ${client.id} (total: ${this.connectedClients})`);
  }

  // Broadcast a batch of newly generated products to all connected clients
  broadcastBatch(products: any[], stats: { total: number; generated: number }) {
    this.server.emit('products:batch-added', { products, stats });
  }

  // Broadcast generator status changes
  broadcastStatus(status: 'started' | 'stopped', intervalMs: number, batchSize: number) {
    this.server.emit('generator:status', { status, intervalMs, batchSize });
  }
}
