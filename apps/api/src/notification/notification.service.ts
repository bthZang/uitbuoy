import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { And, LessThan, MoreThan, Repository } from 'typeorm';
import { NotificationDevice } from './entities/notification-device.entity';
import { UpdatedNotificationDevice } from './args/notification-device.arg';
import { timeDiff } from '@/common/utils/timeDiff';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationDevice)
        private readonly repo: Repository<NotificationDevice>,
    ) {}

    async update(
        user: User,
        config: UpdatedNotificationDevice,
    ): Promise<NotificationDevice> {
        return this.repo.save({ ...config, user });
    }

    async remove(user: User, token: string): Promise<number> {
        return (await this.repo.delete({ token, user: { id: user.id } }))
            .affected;
    }

    async notifyEvents(): Promise<number> {
        let expo = new Expo({
            useFcmV1: true,
        });

        const devices = await this.repo
            .createQueryBuilder()
            .leftJoinAndSelect('NotificationDevice.user', 'User')
            .leftJoinAndSelect('User.courses', 'Course')
            .leftJoinAndSelect('Course.events', 'EventEntity')
            .where(
                'NotificationDevice.lastNotificationDate < :now - NotificationDevice.beforeDay * 86400000',
                {
                    now: new Date().getTime(),
                },
            )
            .orWhere('NotificationDevice.lastNotificationDate is null')
            .getMany();

        const messages: ExpoPushMessage[] = [];

        devices.map((device) => {
            this.repo.save({
                ...device,
                lastNotificationDate: new Date().getTime(),
            });
            device.user.courses.map((course) => {
                course.events.map((event) => {
                    if (
                        new Date().getTime() >
                        event.timestart * 1000 - device.beforeDay * 86_400_000
                    ) {
                        const { time, type } = timeDiff(
                            new Date(event.timestart * 1000),
                        );
                        messages.push({
                            to: device.token,
                            sound: 'default',
                            title: `[Còn ${time} ${type}] - ${event.name}`,
                            body: `Bài tập ${event.activityname} sẽ hết hạn vào lúc ${new Intl.DateTimeFormat(
                                'vi-VN',
                                {
                                    timeStyle: 'short',
                                    dateStyle: 'full',
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                },
                            ).format(new Date(event.timestart * 1000))}`,
                            data: { event, time, type },
                            channelId: 'assignment_due',
                        });
                    }
                });
            });
        });

        // expo.sendPushNotificationsAsync(messages);

        let chunks = expo.chunkPushNotifications(messages);

        chunks.forEach(async (chunk) => {
            try {
                const ticketChunk =
                    await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {}
        });

        return messages.length;
    }

    async notifyChatMessage(
        userId: number,
        sender: User,
        message: string,
    ): Promise<number> {
        let expo = new Expo({
            useFcmV1: true,
        });

        const device = await this.repo.findOne({
            where: {
                user: {
                    id: userId,
                },
            },
        });

        const messages: ExpoPushMessage[] = [];

        messages.push({
            to: device.token,
            sound: 'default',
            title: `Tin nhắn mới`,
            body: `${sender.fullname}: ${message}`,
            data: { sender, message },
            channelId: 'assignment_due',
        });

        let chunks = expo.chunkPushNotifications(messages);

        chunks.forEach(async (chunk) => {
            try {
                const ticketChunk =
                    await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {}
        });

        return messages.length;
    }
}
