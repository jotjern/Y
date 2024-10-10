import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import { commentsMock, mockData, usersMock } from "@/lib/mockupData";
import { CommentType, PostType, UserType } from "@/lib/types";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type ViewState = "posts" | "likes" | "comments";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserType>(
    usersMock.find((user) => user.username === username) ?? usersMock[0],
  );
  const [posts, setPosts] = useState<PostType[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("posts");

  useEffect(() => {
    setUser(
      usersMock.find((user) => user.username === username) ?? usersMock[0],
    );
  }, [username]);

  const prevUserRef = useRef<UserType>();

  useEffect(() => {
    if (prevUserRef.current === user) return;
    prevUserRef.current = user;
    setPosts(mockData.filter((post) => user.postIds.includes(post.id)));
    setLikedPosts(
      mockData.filter((post) => user.likedPostIds.includes(post.id)),
    );
    setComments(
      commentsMock.filter((comment) => user.commentIds.includes(comment.id)),
    );
  }, [user]);

  useEffect(() => {
    console.log(currentView);
  }, [currentView]);

  return (
    <div>
      <header>
        <button
          className="m-2 flex gap-2 text-xl"
          onClick={() => window.history.back()}
        >
          <ArrowUturnLeftIcon className="size-6" />
          <p>Back</p>
        </button>
      </header>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Avatar username={user.username} />
          <h1 className="font-mono">{user.username}</h1>
        </div>
      </div>
      <section>
        <ToggleGroup
          value={currentView}
          onValueChange={(value: ViewState) => {
            if (value) setCurrentView(value);
          }}
          type="single"
          className="flex justify-around gap-1"
        >
          <ToggleGroupItem value="posts" aria-label="View Posts">
            <p>Posts</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="likes" aria-label="View Likes">
            <p>Likes</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="comments" aria-label="View Comments">
            <p>Comments</p>
          </ToggleGroupItem>
        </ToggleGroup>
        {currentView === "posts" && (
          <>
            {posts.map((post) => (
              <Post post={post} key={post.id}></Post>
            ))}
          </>
        )}
        {currentView === "likes" && (
          <>
            {likedPosts.map((post) => (
              <Post post={post} key={post.id}></Post>
            ))}
          </>
        )}
        {currentView === "comments" && (
          <>
            {comments.map((comment) => (
              <Post post={comment} key={comment.id}></Post>
            ))}
          </>
        )}
      </section>
    </div>
  );
};

export default Profile;
