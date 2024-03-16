import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { ApiModule } from 'src/api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseConfiguration } from './configuration/course.cofiguration';

@Module({
    imports: [ApiModule, TypeOrmModule.forFeature([Course])],
    providers: [CourseResolver, CourseService, CourseConfiguration],
    exports: [CourseService],
})
export class CourseModule {}
