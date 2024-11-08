import { CrawlArgs } from '@/common/args/crawl.arg';
import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { EducationProgramConfiguration } from './configuration/educationProgram.configuration';
import { SubjectConfiguration } from './configuration/subject.cofiguration';
import { EducationProgram } from './entities/educationProgram.entity';
import { Subject } from './entities/subject.entity';
import { SubjectService } from './services/subject.service';
import { Section } from './entities/section.entity';
import { ElectiveSubjectsResult } from '@/course/dto/elective-subject-result.dto copy';
import { QueryArgs } from '@/common/args/query.arg';
import { ElectiveObjectArgs } from '@/common/args/electiveSubjects.arg';
import { GiveLearningPathSubjectCodesResult } from '@/course/dto/give-learning-path-subject-codes-result.dto';
import { LearningPathArgs } from '@/common/args/learningPath.arg';

@Resolver(() => Subject)
export class SubjectResolver {
    constructor(
        private readonly subjectService: SubjectService,
        private readonly subjecConfig: SubjectConfiguration,
        private readonly educationProgramConfig: EducationProgramConfiguration,
    ) {}

    // @Query(() => EducationProgram)
    // async test() {
    //     return this.subjecService.test();
    // }

    @Query(() => Subject, { nullable: true })
    @UseGuards(JwtAuthGuard)
    async subject(
        @Args('code', { type: () => String, nullable: false }) code: string,
    ) {
        return this.subjectService.findSubjectInfo(code);
    }

    @Query(() => [Section])
    @UseGuards(JwtAuthGuard)
    async sections(@CurrentUser() user: User) {}

    @ResolveField(() => [Subject])
    async requiredSubjects(@Parent() subject: Subject): Promise<Subject[]> {
        const codes: string[] = JSON.parse(
            subject.requiredCode.replace('{', '[').replace('}', ']'),
        );
        const subjects =
            await this.subjectService.findSubjectsDataByCodes(codes);
        return subjects;
    }

    @ResolveField(() => [Subject])
    async previousSubjects(@Parent() subject: Subject): Promise<Subject[]> {
        const codes: string[] = JSON.parse(
            subject.previousCode.replace('{', '[').replace('}', ']'),
        );
        const subjects =
            await this.subjectService.findSubjectsDataByCodes(codes);
        return subjects;
    }

    @ResolveField(() => [Subject])
    async equivalentSubjects(@Parent() subject: Subject): Promise<Subject[]> {
        const codes: string[] = JSON.parse(
            subject.equivalentCode.replace('{', '[').replace('}', ']'),
        );
        const subjects =
            await this.subjectService.findSubjectsDataByCodes(codes);
        return subjects;
    }

    @Query(() => [EducationProgram], {
        description: 'Return all education programs of UIT students',
    })
    async crawlEducationProgram(
        @Args() crawlArgs: CrawlArgs,
    ): Promise<EducationProgram[]> {
        return this.educationProgramConfig.saveEducationProgramData(crawlArgs);
    }

    @Query(() => [Subject], {
        description: 'Return all subjects of UIT students',
    })
    async crawlSubject() {
        return this.subjecConfig.saveSubject();
    }

    @Query(() => [Subject])
    @UseGuards(JwtAuthGuard)
    findOne(@Args('code') code: string) {
        return this.subjectService.findSubjectDataByCode(code);
    }

    @Query(() => [Subject])
    @UseGuards(JwtAuthGuard)
    findAll(@CurrentUser() user: User, @Args('nameVN') nameVN: string) {
        return this.subjectService.findSubjectData(user.token, nameVN);
    }

    @Query(() => [Subject])
    @UseGuards(JwtAuthGuard)
    findAllEducationProgram(
        @CurrentUser() user: User,
        @Args('major') major: string,
    ) {
        return this.subjectService.findEducationProgram(user.token, major);
    }

    @Query(() => [ElectiveSubjectsResult], {
        description: 'Return all elective subjects recommend for user',
    })
    @UseGuards(JwtAuthGuard)
    async recommendElectiveSubject(
        @CurrentUser() user: User,
        @Args() queryArgs: QueryArgs,
        @Args() electiveObjectArgs: ElectiveObjectArgs,
    ): Promise<ElectiveSubjectsResult[]> {
        return this.subjectService.recommendElectiveSubject(
            user,
            queryArgs,
            electiveObjectArgs,
        );
    }

    @Query(() => GiveLearningPathSubjectCodesResult, {
        description: 'Return learning code of elective subjects',
    })
    @UseGuards(JwtAuthGuard)
    async giveLearningPathSubjectCodes(
        @CurrentUser() user: User,
        @Args() queryArgs: QueryArgs,
    ): Promise<GiveLearningPathSubjectCodesResult> {
        return this.subjectService.giveLearningPathSubjectCodes(
            user,
            queryArgs,
        );
    }

    @Query(() => [Subject], {
        description: 'Return all subjects recommend for user',
    })
    @UseGuards(JwtAuthGuard)
    async recommendSubject(
        @CurrentUser() user: User,
        @Args() learningPathArgs: LearningPathArgs,
        @Args() queryArgs: QueryArgs,
    ) {
        queryArgs.isRecent = false;

        const giveLearningPathSubjectCodesResult =
            await this.subjectService.giveLearningPathSubjectCodes(
                user,
                queryArgs,
            );
        // const result: Subject[] = [];
        const result: Subject[] =
            await this.subjectService.findSubjectsDataByCodes(
                giveLearningPathSubjectCodesResult[learningPathArgs.option],
            );

        return result;
    }
}
