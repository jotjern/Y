import { useAuth } from "@/components/AuthContext";
import FollowButton from "@/components/FollowButton";
import Avatar from "@/components/Profile/Avatar";
import Username from "@/components/Username";
import { UserType } from "@/lib/types";
import CoverPhoto from "/coverphoto.jpg";

interface Props {
  user: UserType;
  large?: boolean;
}

const ProfileCard = ({ user, large }: Props) => {
  const { user: currentUser } = useAuth();

  if (large) {
    return (
      <a
        style={{
          backgroundImage: `url('${user.backgroundPicture || CoverPhoto}')`,
          backgroundSize: "100% 50%",
          backgroundPosition: "center top",
        }}
        href={`/project2/user/${user.username}`}
        className="flex min-h-48 w-full flex-col items-center justify-center rounded-lg border border-gray-400 bg-zinc-200 bg-cover bg-no-repeat shadow-xl hover:opacity-80 dark:border-gray-600 dark:bg-zinc-800 md:min-h-64"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex-shrink-0">
            <Avatar noHref user={user} large />
          </div>
          <h1 className="text-xl">
            {user?.firstName} {user.lastName}
          </h1>
          <Username user={user} noHref hideFullName noAvatar />
          <FollowButton targetUsername={user.username} />
        </div>
      </a>
    );
  }

  return (
    <a
      key={user.id}
      href={`/project2/user/${user.username}`}
      className="bg-white-100 flex w-full flex-col items-center gap-2 rounded-lg border px-2 py-6 shadow-lg hover:scale-105 dark:border-gray-700 dark:bg-gray-900"
    >
      <h1 className="text-xl">
        {user.firstName
          ? `${user?.firstName} ${user.lastName}`
          : user?.username}
      </h1>
      <Username hideFullName user={user} noHref />
      {user?.username !== currentUser?.username && (
        <FollowButton targetUsername={user.username} />
      )}
    </a>
  );
};

export default ProfileCard;
