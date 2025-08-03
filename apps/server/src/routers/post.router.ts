import { postContract } from "../contracts/post.contract.js";
import {
  createResponse,
  implementRouter,
  paginationResponse,
} from "../lib/orpc.js";
import secureMiddleware from "../middleware/secure.middleware.js";
import { PostService } from "../services/post.service.js";

const os = implementRouter(postContract).use(secureMiddleware);

export const postRouter = os.router({
  listPost: os.listPost.handler(async ({ context, input }) => {
    const postService = new PostService(context);
    const posts = await postService.findAll(input);

    return paginationResponse("Success, list post", posts.data, posts.meta);
  }),
  getPost: os.getPost.handler(async ({ context, input }) => {
    const postService = new PostService(context);
    const post = await postService.findById(input.id);

    return createResponse("Success, get post", post);
  }),
  createPost: os.createPost.handler(async ({ context, input }) => {
    const postService = new PostService(context);
    const post = await postService.create(input);

    return createResponse("Success, create post", post);
  }),
  updatePost: os.updatePost.handler(async ({ context, input }) => {
    const postService = new PostService(context);
    const post = await postService.update(input);

    return createResponse("Success, update post", post);
  }),
  deletePost: os.deletePost.handler(async ({ context, input }) => {
    const postService = new PostService(context);
    const post = await postService.delete(input.id);

    return createResponse("Success, delete post", post);
  }),
});
