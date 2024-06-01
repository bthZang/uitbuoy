import { PaginationArgs } from '@/common/args/pagination.arg';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SeService } from './crawl/se.service';
import { UITNewsService } from './crawl/uit-news.service';
import { NewsFeed } from './entities/news-feed.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class NewsFeedService {
    constructor(
        @InjectRepository(NewsFeed) private readonly repo: Repository<NewsFeed>,
        private readonly seService: SeService,
        private readonly uitNewsService: UITNewsService,
        @Inject('NEWS_SERVICE') private readonly crawler: ClientKafka,
    ) {}

    async crawlData(startPage: number = 0, pageNum: number = 1) {
        this.crawler.emit('newsfeed.crawl.all', {
            start: startPage,
            num: pageNum,
        });
        // await this.seService.crawlData(startPage, pageNum);
        // await this.uitNewsService.crawlData(startPage, pageNum);
    }

    async findOne(title: string) {
        return this.repo.findOne({
            where: { title },
            relations: { tags: true, files: true },
        });
    }

    async findAll(tags: string[], paginationArgs: PaginationArgs) {
        return this.repo.find({
            where: {
                ...(tags.length ? { tags: { name: In(tags) } } : {}),
            },
            relations: { tags: true, files: true },
            order: { date: 'desc' },
            skip: paginationArgs.skip,
            take: paginationArgs.limit,
        });
    }
}
