import { ORPCError } from "@orpc/server";
import type { z } from "zod";
import type { PostSchema } from "../contracts/post.contract.js";
import type { Context } from "../lib/context.js";
import {
  type IPaginationParams,
  type IPaginationResponse,
  paginate,
} from "../lib/pagination.js";

type Post = z.infer<typeof PostSchema>;
type PostCreateData = Omit<Post, "id" | "createdAt" | "updatedAt">;
type PostUpdateData = Omit<Post, "createdAt" | "updatedAt">;

export class PostService {
  constructor(private context: Context) {}

  async findAll(params: IPaginationParams): Promise<IPaginationResponse<Post>> {
    const [total, posts] = await this.context.db.$transaction([
      this.context.db.post.count(),
      this.context.db.post.findMany({
        ...paginate(params),
      }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        lastPage: Math.ceil(total / params.limit),
        currentPage: params.page,
        totalPerPage: params.limit,
        prevPage: params.page > 1 ? params.page - 1 : null,
        nextPage:
          params.page < Math.ceil(total / params.limit)
            ? params.page + 1
            : null,
      },
    };
  }

  async findById(id: number): Promise<Post> {
    const post = await this.context.db.post.findUnique({
      where: { id },
    });

    if (!post) {
      console.error("Post not found", id);
      throw new ORPCError("NOT_FOUND", {
        message: "Post not found",
      });
    }

    return post;
  }

  async create(data: PostCreateData): Promise<Post> {
    return await this.context.db.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
      },
    });
  }

  async update(data: PostUpdateData): Promise<Post> {
    try {
      const post = await this.context.db.post.update({
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content,
          published: data.published,
        },
      });
      return post;
    } catch (error) {
      console.error("Post not found", data.id, error);
      throw new ORPCError("NOT_FOUND", {
        message: "Post not found",
      });
    }
  }

  async delete(id: number): Promise<Post> {
    try {
      const post = await this.context.db.post.delete({
        where: { id },
      });
      return post;
    } catch (error) {
      console.error("Post not found", id, error);
      throw new ORPCError("NOT_FOUND", {
        message: "Post not found",
      });
    }
  }
}
