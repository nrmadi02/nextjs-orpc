import { oc } from "@orpc/contract";
import z from "zod";
import { schema } from "@repo/db";
import { baseContract } from "./base.contract.js";

export const PostSchema = schema.PostSchema;

const PostCreateInput = PostSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
const PostUpdateInput = PostSchema.omit({ createdAt: true, updatedAt: true });
const PostIdInput = z.object({ id: z.number() });

export const postContract = {
	createPost: oc.input(PostCreateInput).output(baseContract(PostSchema)),
	listPost: oc.output(baseContract(PostSchema.array())),
	getPost: oc.input(PostIdInput).output(baseContract(PostSchema)),
	updatePost: oc.input(PostUpdateInput).output(baseContract(PostSchema)),
	deletePost: oc.input(PostIdInput).output(baseContract(PostSchema)),
};
