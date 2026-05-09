"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export type LeaderboardUser = {
  id: string;
  name: string;
  points: number;
  avatarUrl: string;
  isCurrentUser: boolean;
};

const MOCK_USERS = [
  { id: "user_1", name: "Ana", points: 1240, avatarUrl: "/duo.svg" },
  { id: "user_2", name: "Carlos", points: 1180, avatarUrl: "/duo-pro.svg" },
  { id: "user_3", name: "Fernanda", points: 1090, avatarUrl: "/duo-page.svg" },
  { id: "user_4", name: "Lucas", points: 980, avatarUrl: "/duo-travel.svg" },
  { id: "user_5", name: "Patrícia", points: 870, avatarUrl: "/duo-home.svg" },
];

export const useLeaderboardUsers = () => {
  const { data: session } = useSession();

  return useMemo<LeaderboardUser[]>(() => {
    const sessionUserId = session?.user?.id;
    const sessionUserName = session?.user?.name ?? "Você";
    const sessionUserAvatar = session?.user?.image ?? "/duo.svg";

    const baseUsers = MOCK_USERS.map((user) => ({
      ...user,
      isCurrentUser: user.id === sessionUserId,
    }));

    if (!sessionUserId) {
      return baseUsers;
    }

    const hasCurrentUser = baseUsers.some((user) => user.id === sessionUserId);

    const users = hasCurrentUser
      ? baseUsers
      : [
          ...baseUsers,
          {
            id: sessionUserId,
            name: sessionUserName,
            points: 1020,
            avatarUrl: sessionUserAvatar,
            isCurrentUser: true,
          },
        ];

    return users.sort((a, b) => b.points - a.points);
  }, [session?.user?.id, session?.user?.image, session?.user?.name]);
};
