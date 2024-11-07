import { useAuth } from "@/components/AuthContext";
import BackButton from "@/components/BackButton";
import CreatePostField from "@/components/CreatePostField";
import Comment from "@/components/Post/Comment";
import Post from "@/components/Post/Post";
import Divider from "@/components/ui/Divider";
import { CommentType, PostType } from "@/lib/types";
import { CREATE_COMMENT, GET_COMMENTS } from "@/queries/comments";
import { EDIT_POST, GET_POST } from "@/queries/posts";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const COMMENT_PAGE_SIZE = 10;

const PostPage = () => {
  const { id, edit } = useParams<{ id: string; edit?: string }>();
  const editing = edit === "edit";
  const { user } = useAuth();

  const [editBody, setEditBody] = useState("");
  const [comment, setComment] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const {
    data: postData,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useQuery<{ getPost: PostType }>(GET_POST, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (!user || !postData || !editing) return;
    if (user.username !== postData.getPost.author) {
      window.location.href = `/project2/post/${id}`;
    }
  }, [user, postData, editing, id]);

  if (!editing && edit) {
    window.location.href = `/project2/post/${id}`;
  }

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
    fetchMore: fetchMoreComments,
    networkStatus: commentsNetworkStatus,
  } = useQuery<{ getComments: CommentType[] }>(GET_COMMENTS, {
    variables: { postID: id, page: 1 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const loadMoreComments = useCallback(async () => {
    if (!hasMore || commentsLoading) return;

    try {
      const { data: fetchMoreData } = await fetchMoreComments({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getComments) {
        if (fetchMoreData.getComments.length < COMMENT_PAGE_SIZE) {
          setHasMore(false);
        }
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMoreComments, hasMore, commentsLoading, page]);

  useEffect(() => {
    if (postData?.getPost && !postLoading) {
      setEditBody(postData.getPost.body);
    }
  }, [postData, postLoading]);

  const [createComment, { loading: createLoading, error: createError }] =
    useMutation<
      { createComment: CommentType },
      { body: string; parentID: string; file: File | null }
    >(CREATE_COMMENT, {
      onCompleted: () => {
        setComment("");
        setCommentFile(null);
        refetchComments();
        refetchPost();
        toast.success("Comment added successfully!");
      },
      onError: (err) => {
        console.error("Error creating comment:", err);
        toast.error(`Error adding comment: ${err.message}`);
      },
    });

  const [editPost, { loading: editLoading }] = useMutation<
    { editPost: PostType },
    { id: string; body: string; file: File | null }
  >(EDIT_POST, {
    onCompleted: () => {
      toast.success("Post edited successfully!");
      window.location.href = `/project2/post/${id}`;
    },
    onError: (err) => {
      console.error("Error editing post:", err);
      toast.error(`Error editing post: ${err.message}`);
    },
  });

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "") return;

    try {
      await createComment({
        variables: {
          body: comment,
          parentID: id!,
          file: commentFile,
        },
      });
    } catch (error) {
      toast.error(`Error adding comment: ${(error as Error).message}`);
    }
  };

  const handleEditPost = async (e: FormEvent) => {
    e.preventDefault();
    if (editBody.trim() === "") {
      toast.error("Post content cannot be empty.");
      return;
    }

    if (editBody === postData?.getPost.body && !file) {
      toast.error("No changes detected.");
      return;
    }

    try {
      await editPost({
        variables: {
          id: postData?.getPost.id || "",
          body: editBody,
          file: file,
        },
      });
    } catch (error) {
      toast.error(`Error editing post: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        commentsNetworkStatus !== NetworkStatus.fetchMore &&
        hasMore
      ) {
        loadMoreComments();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [commentsLoading, page, hasMore, commentsNetworkStatus, loadMoreComments]);

  if (postLoading) {
    return <p>Loading...</p>;
  }
  if (postError) {
    return <p>Error loading post: {postError.message}</p>;
  }

  if (!postData || !postData.getPost) {
    return <h1>Post not found</h1>;
  }

  return (
    <div className="w-full">
      <BackButton overrideRedirect />
      <main className="flex flex-col items-center px-4 pt-5">
        {editing ? (
          <form
            className="flex w-full max-w-xl flex-col items-start gap-4"
            onSubmit={handleEditPost}
          >
            <CreatePostField
              placeholder="What else is on your mind?"
              value={editBody}
              setValue={setEditBody}
              loading={editLoading}
              file={file}
              setFile={setFile}
              existingImageURL={
                postData.getPost.imageUrl
                  ? `${BACKEND_URL}${postData.getPost.imageUrl}`
                  : undefined
              }
              className={
                (editBody !== postData.getPost.body || file) && user
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
              }
            />
          </form>
        ) : (
          <Post post={postData.getPost} doesntRedirect />
        )}
        <Divider />
        {!editing && (
          <form
            className="flex w-full max-w-xl flex-col items-center gap-2"
            onSubmit={handleAddComment}
          >
            <CreatePostField
              placeholder="Write your reply..."
              value={comment}
              setValue={setComment}
              loading={createLoading}
              file={commentFile}
              setFile={setCommentFile}
              className={
                comment && user
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
              }
            />
          </form>
        )}
        {createError && (
          <p className="text-red-500">
            Error adding comment: {createError.message}
          </p>
        )}
        
        {commentsData?.getComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}


        {commentsError && (
          <p>Error loading comments: {commentsError.message}</p>
        )}

        {commentsLoading ||
          (commentsNetworkStatus === NetworkStatus.loading && (
            <p>Loading comments...</p>
          ))}

        {!hasMore && (
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            You've reached the end of the comments.
          </p>
        )}

        {!commentsLoading && commentsData?.getComments.length === 0 && (
          <p className="mt-4">No comments available.</p>
        )}
      </main>
    </div>
  );
};

export default PostPage;
