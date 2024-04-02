import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto';
import { PrismaService } from '../shared/services/prisma.service';
const slug = require('slug');
import { Prisma } from '@prisma/client';

const articleAuthorSelect = {
  email: true,
  username: true,
  bio: true,
  image: true,
};

const commentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  body: true,
  author: { select: articleAuthorSelect },
};

const articleInclude = {
  author: { select: articleAuthorSelect },
};

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, query: any): Promise<any> {
    const andQueries = this.buildFindAllQuery(query);
    const articles = await this.prisma.article.findMany({
      where: { AND: andQueries },
      orderBy: { createdAt: 'desc' },
      include: articleInclude,
      ...('first' in query ? { take: 1 } : {}),
      ...('skip' in query ? { skip: +query.offset } : {}),
    });
    const articlesCount = await this.prisma.article.count({
      where: { AND: andQueries },
      orderBy: { createdAt: 'desc' },
    });

    return { articles, articlesCount };
  }

  private buildFindAllQuery(
    query,
  ): Prisma.Enumerable<Prisma.ArticleWhereInput> {
    const queries = [];

    if ('tag' in query) {
      queries.push({
        tagList: {
          contains: query.tag,
        },
      });
    }

    if ('author' in query) {
      queries.push({
        author: {
          username: {
            equals: query.author,
          },
        },
      });
    }

    if ('favorited' in query) {
      queries.push({
        favoritedBy: {
          some: {
            username: {
              equals: query.favorited,
            },
          },
        },
      });
    }

    return queries;
  }

  async findOne(userId: number, slug: string): Promise<any> {
    const article: any = await this.prisma.article.findUnique({
      where: { slug },
      include: articleInclude,
    });

    return { article };
  }

  async addComment(userId: number, slug: string, { body }): Promise<any> {
    const comment = await this.prisma.comment.create({
      data: {
        body,
        article: {
          connect: { slug },
        },
        author: {
          connect: { id: userId },
        },
      },
      select: commentSelect,
    });

    return { comment };
  }

  async deleteComment(slug: string, id: string): Promise<any> {
    // @Todo: no clue why API specs require a slug if the comment id is unique?!
    await this.prisma.comment.delete({ where: { id: +id } });
  }

  async findComments(slug: string): Promise<any> {
    const comments = await this.prisma.comment.findMany({
      where: { article: { slug } },
      orderBy: { createdAt: 'desc' },
      select: commentSelect,
    });
    return { comments };
  }

  async create(userId: number, payload: CreateArticleDto): Promise<any> {
    const data = {
      ...payload,
      slug: this.slugify(payload.title),
      tagList: payload.tagList.join(','),
      author: {
        connect: { id: userId },
      },
    };
    const article: any = await this.prisma.article.create({
      data,
      include: articleInclude,
    });

    return { article };
  }

  async update(userId: number, slug: string, data: any): Promise<any> {
    const article: any = await this.prisma.article.update({
      where: { slug },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: articleInclude,
    });

    return { article };
  }

  async delete(slug: string): Promise<void> {
    await this.prisma.article.delete({ where: { slug } });
  }

  slugify(title: string) {
    return (
      slug(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
