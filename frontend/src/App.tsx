import HashtagBlock from "@/components/Hashtags/HashtagBlock";
import Post from "@/components/Post/Post";
import Repost from "@/components/Post/Repost";
import HashtagBlockSkeleton from "@/components/Skeletons/HashtagBlockSkeleton";
import PostSkeleton from "@/components/Skeletons/PostSkeleton";
import ProfileBlockSkeleton from "@/components/Skeletons/ProfileBlockSkeleton";
import Divider from "@/components/ui/Divider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import ProfileBlock from "@/components/Users/ProfileBlock";
import CreatePostField from "@/form/CreatePostField";
import { useAuth } from "@/hooks/AuthContext";
import { isFileAllowed } from "@/lib/checkFile";
import { HashtagType, PostItem, UserType } from "@/lib/types";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { GET_USERS } from "@/queries/user";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import { HashtagIcon } from "@heroicons/react/24/outline";
import {
  ClockIcon,
  ContactIcon,
  FlameIcon,
  MessageSquareMoreIcon,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 16;

type FilterType = "LATEST" | "FOLLOWING" | "POPULAR" | "CONTROVERSIAL";

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [filter, setFilter] = useState<FilterType>(
    (localStorage.getItem("postFilter") as FilterType) ?? "LATEST",
  );

  useEffect(() => {
    localStorage.setItem("postFilter", filter);
  }, [filter]);

  useEffect(() => {
    document.title = "Y";
  }, []);

  useEffect(() => {
    setShowLoginPrompt(filter === "FOLLOWING" && !user);
  }, [filter, user]);

  const { data, loading, error, fetchMore, networkStatus, refetch } = useQuery<{
    getPosts: PostItem[];
  }>(GET_POSTS, {
    variables: { page: 1, filter, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    skip: filter === "FOLLOWING" && !user,
  });

  const posts = data?.getPosts || [];

  const { data: usersData, error: usersError } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1, excludeFollowing: true },
  });

  const { data: hashtagsData, error: hashtagsError } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { page: 1 },
  });

  const [createPost, { loading: createLoading }] = useMutation<
    { createPost: PostItem },
    { body: string; file: File | null }
  >(CREATE_POST, {
    context: {
      headers: {
        "x-apollo-operation-name": "createPost",
      },
    },
    onError: (err) => {
      console.error("Error creating post:", err);
      toast.error(`Error adding post: ${err.message}`);
    },
    onCompleted: () => {
      setPostBody("");
      setFile(null);
      toast.success("Post added successfully!");
      setFilter("LATEST");
      refetch();
    },
  });

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postBody.trim() === "" && file === null) {
      toast.error("Post content cannot be empty.");
      return;
    }

    if (file && !isFileAllowed(file)) return;

    try {
      await createPost({
        variables: {
          body: postBody.trim(),
          file: file,
        },
      });
    } catch (error) {
      toast.error(`Error adding post: ${(error as Error).message}`);
    }
  };

  // Infinite scroll to load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading || networkStatus === NetworkStatus.fetchMore)
      return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getPosts) {
        if (fetchMoreData.getPosts.length < 16) {
          setHasMore(false);
        }
        if (fetchMoreData.getPosts.length > 0) {
          setPage((prev) => prev + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, page, networkStatus]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 400 &&
        hasMore
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMorePosts]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    refetch({ page: 1, filter, limit: PAGE_SIZE });
  }, [filter, refetch]);

  useEffect(() => {
    if (filter !== "FOLLOWING") {
      setShowLoginPrompt(false);
    }
  }, [filter]);

  return (
    <div className="max-w-screen-3xl mx-auto flex w-full justify-center px-2 py-5 lg:justify-evenly lg:gap-4">
      <aside className="hidden w-full max-w-64 py-4 lg:flex">
        {hashtagsError && (
          <p className="mt-4 text-center text-red-500">
            Error loading hashtags: {hashtagsError.message}
          </p>
        )}

        <div className="flex w-full flex-col items-start gap-1">
          <h1 className="mx-1 text-3xl font-extralight">Trending</h1>
          <div className="flex w-full flex-col items-center gap-[0.0625rem] bg-gray-300 dark:bg-gray-700">
            {!hashtagsData
              ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <HashtagBlockSkeleton key={index} />
                ))
              : hashtagsData?.getTrendingHashtags.map((hashtag) => (
                  <HashtagBlock hashtag={hashtag} key={hashtag.tag} />
                ))}
          </div>
          <a
            href={`/project2/hashtag`}
            className="mt-4 inline-flex items-center justify-center self-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <HashtagIcon className="mr-2 size-5" aria-hidden="true" />
            <span>View All Hashtags</span>
          </a>
        </div>
      </aside>
      <main className="w-full max-w-xl">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={handleAddPost}
        >
          <CreatePostField
            placeholder="What's on your mind?"
            value={postBody}
            setValue={setPostBody}
            file={file}
            setFile={setFile}
            loading={createLoading}
            enabled={(postBody.trim() !== "" || file !== null) && user !== null}
          />
        </form>
        <Divider />
        <section>
          <ToggleGroup
            value={filter}
            onValueChange={(newFilter: FilterType) => {
              if (newFilter) {
                setFilter(newFilter);
                if (newFilter === "FOLLOWING" && !user) {
                  setShowLoginPrompt(true);
                }
              }
            }}
            type="single"
            variant="outline"
            role="radiogroup"
            className="mb-4 flex items-center justify-evenly gap-2"
          >
            <ToggleGroupItem
              value="LATEST"
              aria-label="Filter by latest posts"
              aria-checked={filter === "LATEST"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
            >
              <ClockIcon className="hidden size-4 sm:block md:size-6" />
              <p>Latest</p>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="FOLLOWING"
              aria-label="Filter by posts from people you follow"
              aria-checked={filter === "FOLLOWING"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
              onClick={() => {
                if (!user) setShowLoginPrompt(true);
              }}
            >
              <ContactIcon className="hidden size-4 sm:block md:size-6" />
              <p>Following</p>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="POPULAR"
              aria-label="Filter by popular posts"
              aria-checked={filter === "POPULAR"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
            >
              <FlameIcon className="hidden size-4 sm:block md:size-6" />
              <p>Popular</p>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="CONTROVERSIAL"
              aria-label="Filter by controversial posts"
              aria-checked={filter === "CONTROVERSIAL"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
            >
              <MessageSquareMoreIcon className="hidden size-4 sm:block md:size-6" />
              <p>Controversial</p>
            </ToggleGroupItem>
          </ToggleGroup>
        </section>
        {showLoginPrompt && (
          <div className="my-4 flex flex-col justify-center gap-5">
            <p>You need to log in to view following posts</p>
            <button
              onClick={() => {
                window.location.href = "/project2/login";
              }}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Log In</span>
            </button>
          </div>
        )}
        {!showLoginPrompt && (
          <div className="flex flex-col gap-4">
            {error && (
              <p className="mt-4 text-center text-red-500">
                Error loading posts: {error?.message}
              </p>
            )}
            {usersError && (
              <p className="mt-4 text-center text-red-500">
                Error loading users: {usersError.message}
              </p>
            )}

            {loading &&
              posts.length === 0 &&
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}

            {posts &&
              posts.map((post) =>
                post.__typename === "Post" ? (
                  <Post key={post.id} post={post} />
                ) : (
                  <Repost key={post.id} repost={post} />
                ),
              )}
            {loading && posts.length > 0 && hasMore && (
              <p className="mt-4 text-center">Loading more posts...</p>
            )}
            {!loading && posts.length === 0 && (
              <p className="mt-4 text-center">No posts available.</p>
            )}
          </div>
        )}

        {!hasMore && (
          <p className="mt-4 justify-self-center text-gray-500 dark:text-gray-400">
            You've reached the end of the posts.
          </p>
        )}
      </main>

      <aside className="hidden w-full max-w-80 py-4 lg:flex">
        <div className="flex w-full flex-col items-start gap-1">
          <h1 className="mx-2 text-3xl font-extralight">People to follow</h1>
          <div className="flex w-full flex-col items-center gap-[0.0625rem] bg-gray-300 dark:bg-gray-700">
            {!usersData?.getUsers
              ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ProfileBlockSkeleton key={index} />
                ))
              : usersData?.getUsers.map((recommendedUser) => (
                  <ProfileBlock
                    user={recommendedUser}
                    key={recommendedUser.id}
                  />
                ))}
          </div>
          <a
            href={`/project2/users`}
            className="mt-4 inline-flex justify-center self-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Users className="mr-2 h-5 w-5" aria-hidden="true" />
            <span>View All Users</span>
          </a>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
