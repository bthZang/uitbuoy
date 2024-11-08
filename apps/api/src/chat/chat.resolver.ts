import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Message, Room } from './message.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@/user/services/user.service';

@Resolver(() => Message)
export class ChatResolver {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    @Query(() => [Message])
    @UseGuards(JwtAuthGuard)
    async messages(@CurrentUser() user: User, @Args('id') id: string) {
        const messages = await this.messageRepository.find({
            where: [
                {
                    receiverId: id,
                    senderId: user.id.toString(),
                },
                {
                    receiverId: user.id.toString(),
                    senderId: id,
                },
            ],
            order: {
                date: 'DESC',
            },
        });
        return messages;
    }
}

@Resolver(() => Room)
export class RoomResolver {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        private readonly userService: UserService,
    ) {}

    @Query(() => [Room])
    @UseGuards(JwtAuthGuard)
    async rooms(@CurrentUser() user: User) {
        const result = await this.messageRepository
            .createQueryBuilder()
            .select('"senderId", "receiverId", MAX(date) as date')
            .where({ senderId: user.id.toString() })
            .orWhere({ receiverId: user.id.toString() })
            .orderBy('date')
            .groupBy('"senderId"')
            .addGroupBy('"receiverId"')
            .getRawMany();
        const users = new Set();
        result.forEach(({ receiverId, senderId }) => {
            users.add(receiverId);
            users.add(senderId);
        });
        users.delete(user.id.toString());
        const rooms = Array.from(users).map((id) => ({ id }));
        return rooms;
    }

    @ResolveField(() => User)
    async user(@Parent() room: Room) {
        return await this.userService.findById(parseInt(room.id, 10));
    }

    @ResolveField(() => Message)
    async lastMessage(@Parent() room: Room, @CurrentUser() user: User) {
        return this.messageRepository.findOne({
            where: [
                {
                    receiverId: room.id,
                    senderId: user.id.toString(),
                },
                {
                    receiverId: user.id.toString(),
                    senderId: room.id,
                },
            ],
            order: {
                date: 'DESC',
            },
        });
    }
}
