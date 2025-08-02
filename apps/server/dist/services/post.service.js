import { ORPCError } from "@orpc/server";
export class PostService {
    context;
    constructor(context) {
        this.context = context;
    }
    async findAll() {
        return await this.context.db.post.findMany();
    }
    async findById(id) {
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
    async create(data) {
        return await this.context.db.post.create({
            data: {
                title: data.title,
                content: data.content,
                published: data.published,
            },
        });
    }
    async update(data) {
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
        }
        catch (error) {
            console.error("Post not found", data.id, error);
            throw new ORPCError("NOT_FOUND", {
                message: "Post not found",
            });
        }
    }
    async delete(id) {
        try {
            const post = await this.context.db.post.delete({
                where: { id },
            });
            return post;
        }
        catch (error) {
            console.error("Post not found", id, error);
            throw new ORPCError("NOT_FOUND", {
                message: "Post not found",
            });
        }
    }
}
