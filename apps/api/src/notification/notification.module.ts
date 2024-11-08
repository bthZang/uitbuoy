import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationDevice } from './entities/notification-device.entity';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationDevice])],
    providers: [NotificationResolver, NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
