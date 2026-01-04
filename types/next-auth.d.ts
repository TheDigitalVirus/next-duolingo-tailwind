import 'next-auth';
import 'next-auth/jwt';
import { UserRole, UserStatus, SubscriptionTier } from '@prisma/client';

// Extend built-in types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
    subscriptionTier: SubscriptionTier;
    xp: number;
    streak: number;
    gems: number;
    lastActiveAt?: Date | null;
    emailVerified?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      status: UserStatus;
      subscriptionTier: SubscriptionTier;
      xp: number;
      streak: number;
      gems: number;
      lastActiveAt?: Date | null;
      emailVerified?: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
    subscriptionTier: SubscriptionTier;
    xp: number;
    streak: number;
    gems: number;
    lastActiveAt?: Date | null;
    emailVerified?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
}