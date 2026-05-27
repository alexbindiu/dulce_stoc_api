"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let GeneratorGateway = class GeneratorGateway {
    constructor() {
        this.connectedClients = 0;
    }
    handleConnection(client) {
        this.connectedClients++;
        console.log(`[WS] Client connected: ${client.id} (total: ${this.connectedClients})`);
    }
    handleDisconnect(client) {
        this.connectedClients--;
        console.log(`[WS] Client disconnected: ${client.id} (total: ${this.connectedClients})`);
    }
    broadcastBatch(products, stats) {
        this.server.emit('products:batch-added', { products, stats });
    }
    broadcastStatus(status, intervalMs, batchSize) {
        this.server.emit('generator:status', { status, intervalMs, batchSize });
    }
};
exports.GeneratorGateway = GeneratorGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GeneratorGateway.prototype, "server", void 0);
exports.GeneratorGateway = GeneratorGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], GeneratorGateway);
//# sourceMappingURL=generator.gateway.js.map