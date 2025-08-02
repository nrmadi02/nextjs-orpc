"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@repo/db";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { orpc } from "@/utils/orcp";

type Post = z.infer<typeof schema.PostSchema>;
type PostCreateData = Omit<Post, "id" | "createdAt" | "updatedAt">;
type PostUpdateData = Omit<Post, "createdAt" | "updatedAt">;

export default function PostsPage() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Form untuk create
  const createForm = useForm<PostCreateData>({
    resolver: zodResolver(
      schema.PostSchema.omit({ id: true, createdAt: true, updatedAt: true })
    ),
    defaultValues: {
      title: "",
      content: "",
      published: false,
    },
  });

  // Form untuk update
  const updateForm = useForm<PostUpdateData>({
    resolver: zodResolver(
      schema.PostSchema.omit({ createdAt: true, updatedAt: true })
    ),
    defaultValues: {
      id: 0,
      title: "",
      content: "",
      published: false,
    },
  });

  const postQuery = useQuery(orpc.post.listPost.queryOptions());
  const createMutation = useMutation(orpc.post.createPost.mutationOptions());
  const updateMutation = useMutation(orpc.post.updatePost.mutationOptions());
  const deleteMutation = useMutation(orpc.post.deletePost.mutationOptions());

  const createPost = async (data: PostCreateData) => {
    try {
      await createMutation.mutateAsync(data);
      postQuery.refetch();
      createForm.reset();
      setIsFormVisible(false);
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const updatePost = async (data: PostUpdateData) => {
    try {
      await updateMutation.mutateAsync(data);
      postQuery.refetch();
      setEditingPost(null);
      updateForm.reset();
      toast.success("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post. Please try again.");
    }
  };

  const deletePost = async (id: number) => {
    // Using toast for confirmation instead of alert
    toast("Are you sure you want to delete this post?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
            postQuery.refetch();
            toast.success("Post deleted successfully!");
          } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post. Please try again.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    updateForm.reset({
      id: post.id,
      title: post.title,
      content: post.content || "",
      published: post.published,
    });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    updateForm.reset();
  };

  const handleNewPost = () => {
    setIsFormVisible(true);
    createForm.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-gray-900">
                Posts Management
              </h1>
              <p className="mt-2 text-gray-600">Manage your blog posts here</p>
            </div>
            <button
              type="button"
              onClick={handleNewPost}
              disabled={postQuery.isLoading}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Create Form */}
        {isFormVisible && (
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="border-gray-200 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-lg">
                  Create New Post
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  disabled={createMutation.isPending}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block font-medium text-gray-700 text-sm"
                >
                  Title *
                </label>
                <input
                  {...createForm.register("title")}
                  type="text"
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                  placeholder="Enter post title"
                />
                {createForm.formState.errors.title && (
                  <p className="mt-1 text-red-600 text-sm">
                    {createForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block font-medium text-gray-700 text-sm"
                >
                  Content
                </label>
                <textarea
                  {...createForm.register("content")}
                  rows={4}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                  placeholder="Enter post content"
                />
                {createForm.formState.errors.content && (
                  <p className="mt-1 text-red-600 text-sm">
                    {createForm.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <Controller
                  name="published"
                  control={createForm.control}
                  render={({ field }) => (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={createMutation.isPending}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="ml-2 text-gray-700 text-sm">
                        Published
                      </span>
                    </label>
                  )}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={async () => {
                    const isValid = await createForm.trigger();
                    if (isValid) {
                      createPost(createForm.getValues());
                    }
                  }}
                  disabled={createMutation.isPending}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {createMutation.isPending ? "Creating..." : "Create Post"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  disabled={createMutation.isPending}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-gray-200 border-b px-6 py-4">
            <h3 className="font-medium text-gray-900 text-lg">All Posts</h3>
          </div>

          {postQuery.isLoading ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading posts...</p>
              </div>
            </div>
          ) : postQuery.isError ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-red-100 p-3">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Failed to load posts
                  </p>
                  <p className="mt-1 text-gray-600 text-sm">
                    Please try refreshing the page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => postQuery.refetch()}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : postQuery.data?.data.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">No posts yet</p>
                  <p className="mt-1 text-gray-600 text-sm">
                    Create your first post to get started
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNewPost}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {postQuery.data?.data.map((post) => (
                <div key={post.id} className="p-6">
                  {editingPost?.id === post.id ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="mb-2 block font-medium text-gray-700 text-sm"
                        >
                          Title *
                        </label>
                        <input
                          {...updateForm.register("title")}
                          type="text"
                          disabled={updateMutation.isPending}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />
                        {updateForm.formState.errors.title && (
                          <p className="mt-1 text-red-600 text-sm">
                            {updateForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="content"
                          className="mb-2 block font-medium text-gray-700 text-sm"
                        >
                          Content
                        </label>
                        <textarea
                          {...updateForm.register("content")}
                          rows={4}
                          disabled={updateMutation.isPending}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />
                      </div>

                      <div className="flex items-center">
                        <Controller
                          name="published"
                          control={updateForm.control}
                          render={({ field }) => (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                disabled={updateMutation.isPending}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className="ml-2 text-gray-700 text-sm">
                                Published
                              </span>
                            </label>
                          )}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={async () => {
                            const isValid = await updateForm.trigger();
                            if (isValid) {
                              updatePost(updateForm.getValues());
                            }
                          }}
                          disabled={updateMutation.isPending}
                          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 font-medium text-sm text-white leading-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={updateMutation.isPending}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 text-sm leading-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Post */
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="mb-1 font-medium text-gray-900 text-lg">
                            {post.title}
                          </h4>
                          <div className="mb-2 flex items-center space-x-4 text-gray-500 text-sm">
                            <span className="flex items-center">
                              {post.published ? (
                                <>
                                  <Eye className="mr-1 h-4 w-4 text-green-500" />
                                  Published
                                </>
                              ) : (
                                <>
                                  <EyeOff className="mr-1 h-4 w-4 text-gray-400" />
                                  Draft
                                </>
                              )}
                            </span>
                            <span>ID: {post.id}</span>
                            {post.createdAt && (
                              <span>
                                Created:{" "}
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {post.content && (
                            <p className="mb-3 text-gray-700">{post.content}</p>
                          )}
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(post)}
                            disabled={
                              editingPost !== null || deleteMutation.isPending
                            }
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white p-2 font-medium text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePost(post.id)}
                            disabled={
                              editingPost !== null || deleteMutation.isPending
                            }
                            className="inline-flex items-center rounded-md border border-red-300 bg-white p-2 font-medium text-red-700 text-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables?.id === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
