import { NotificationService } from '@/notification/notification.service';
import { UserService } from '@/user/services/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Message, MessageDTO } from './message.entity';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
    ) {}

    @SubscribeMessage('chat')
    async chat(@MessageBody() data: MessageDTO) {
        const message: Message = await this.messageRepository.save({
            ...data,
            date: new Date(),
        });
        const sender = await this.userService.findById(parseInt(data.senderId));
        this.notificationService.notifyChatMessage(
            parseInt(data.receiverId),
            sender,
            data.content,
        );
        this.server.emit(`chat:${data.receiverId}`, message);
    }
}
