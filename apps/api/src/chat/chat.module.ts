import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatResolver, RoomResolver } from './chat.resolver';
import { UserModule } from '@/user/user.module';
import { NotificationModule } from '@/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        UserModule,
        NotificationModule,
    ],
    providers: [ChatGateway, ChatResolver, RoomResolver],
})
export class ChatModule {}
