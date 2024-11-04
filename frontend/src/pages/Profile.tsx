import Avatar from "@/components/Avatar";
import Post from "@/components/Post/Post";
import PostWithReply from "@/components/Post/PostWithReply";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { Button } from "@/components/ui/button";
import { CommentType, PostType, UserType } from "@/lib/types";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { GET_USER_QUERY } from "@/queries/user";
import { useQuery } from "@apollo/client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useParams } from "react-router-dom";
import CoverPhoto from "/coverphoto.jpg";
import FollowButton from "@/components/FollowButton";
import { UserIcon, UsersIcon } from "lucide-react";
import FollowingUsersModal from "@/components/FollowingUsersModal";

type ViewState = "posts" | "likes" | "comments";

interface Props {
  username?: string;
  isMe?: boolean;
}

const Profile = ({ username, isMe }: Props) => {
  const { username: paramUsername } = useParams<{ username: string }>();
  if (!username) {
    username = paramUsername;
  }
  const [currentView, setCurrentView] = useState<ViewState>("posts");
  const [modalContent, setModalContent] = useState<{
    title: string;
  } | null>(null);

  const openModal = (title: string) => {
    setModalContent({ title });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_QUERY, {
    variables: { username },
    skip: !username,
  });

  const user: UserType | undefined = userData?.getUser;

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.postIds || [] },
    skip: !user || !user.postIds.length,
  });

  const posts: PostType[] = postsData?.getPostsByIds || [];

  const {
    data: likedPostsData,
    loading: likedPostsLoading,
    error: likedPostsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.likedPostIds || [] },
    skip: !user || !user.likedPostIds.length,
  });

  const likedPosts: PostType[] = likedPostsData?.getPostsByIds || [];

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.commentIds || [] },
    skip: !user || !user.commentIds.length,
  });

  const comments: CommentType[] = commentsData?.getCommentsByIds || [];

  const parentPostIds = comments.map((comment) => comment.parentID);
  const {
    data: parentPostsData,
    loading: parentPostsLoading,
    error: parentPostsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: parentPostIds },
    skip: !parentPostIds.length,
  });

  const parentPosts: PostType[] = parentPostsData?.getPostsByIds || [];

  if (userLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="w-full px-5">
      <header>
        <Button
          className="m-2 flex gap-2 text-xl"
          onClick={() => window.history.back()}
          variant="ghost"
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
          <p>Back</p>
        </Button>
      </header>
      <section className="relative mb-36">
        <img
          src={CoverPhoto}
          alt="Cover photo"
          className="h-56 w-full object-cover"
        />
        <div className="absolute -bottom-[3.75rem] left-[10%] flex-col items-center pl-6 md:-bottom-20">
          <Avatar
            username={user?.username || "unknown"}
            large
            navbar
            disableHover
          />

          <div className="flex items-center justify-center gap-2">
            <h1 className="font-mono text-lg">
              <span className="font-sans">@</span>
              {user?.username || "Unknown User"}
            </h1>
            {!isMe && (
              <FollowButton
                targetUsername={user?.username || ""}
                className="size-6"
              />
            )}
          </div>
        </div>
      </section>
      <section>
        <div className="mb-8 rounded-lg bg-gray-100 p-4 shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => openModal("Followers")}
              className="flex items-center space-x-2 rounded p-2 transition-colors duration-200 hover:bg-gray-400 hover:bg-opacity-20"
              aria-label={`View ${user?.followers.length} followers`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {user?.followers.length}
              </span>
              <span className="text-sm">Followers</span>
            </button>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
            <button
              onClick={() => openModal("Following")}
              className="flex items-center space-x-2 rounded p-2 transition-colors duration-200 hover:bg-gray-400 hover:bg-opacity-20"
              aria-label={`View ${user?.following.length} following`}
            >
              <UsersIcon className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {user?.following.length}
              </span>
              <span className="text-sm">Following</span>
            </button>
          </div>
        </div>

        <ToggleGroup
          value={currentView}
          onValueChange={(value: ViewState) => {
            if (value) setCurrentView(value);
          }}
          type="single"
          variant="outline"
          className="flex justify-around gap-1"
        >
          <ToggleGroupItem value="posts" aria-label="View Posts">
            <p>{user?.postIds.length} Posts</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="likes" aria-label="View Likes">
            <p>{user?.likedPostIds.length} Likes</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="comments" aria-label="View Comments">
            <p>{user?.commentIds.length} Comments</p>
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="mt-4 flex w-full flex-col items-center">
          {currentView === "posts" && (
            <>
              {postsLoading && <p>Loading posts...</p>}
              {postsError && <p>Error loading posts: {postsError.message}</p>}
              {posts.map((post) => (
                <Post post={post} key={post.id} />
              ))}
              {!postsLoading && posts.length === 0 && (
                <p>No posts to display.</p>
              )}
            </>
          )}
          {currentView === "likes" && (
            <>
              {likedPostsLoading && <p>Loading liked posts...</p>}
              {likedPostsError && (
                <p>Error loading liked posts: {likedPostsError.message}</p>
              )}
              {likedPosts.map((post) => (
                <Post post={post} key={post.id} />
              ))}
              {!likedPostsLoading && likedPosts.length === 0 && (
                <p>No liked posts to display.</p>
              )}
            </>
          )}
          {currentView === "comments" && (
            <>
              {(commentsLoading || parentPostsLoading) && (
                <p>Loading comments...</p>
              )}
              {commentsError && (
                <p>Error loading comments: {commentsError.message}</p>
              )}
              {parentPostsError && (
                <p>Error loading parent posts: {parentPostsError.message}</p>
              )}
              <div className="flex w-full flex-col gap-6">
                {comments.map((comment) => (
                  <PostWithReply
                    key={comment.id}
                    post={
                      parentPosts.find(
                        (post) => post.id === comment.parentID,
                      ) ?? parentPosts[0]
                    }
                    reply={comment}
                  />
                ))}
              </div>
              {!commentsLoading && comments.length === 0 && (
                <p>No comments to display.</p>
              )}
            </>
          )}
        </div>
      </section>
      <FollowingUsersModal
        isOpen={!!modalContent}
        onClose={closeModal}
        title={modalContent?.title || ""}
        users={
          modalContent?.title === "Followers"
            ? (user?.followers ?? [])
            : modalContent?.title === "Following"
              ? (user?.following ?? [])
              : []
        }
      ></FollowingUsersModal>
    </div>
  );
};

export default Profile;
