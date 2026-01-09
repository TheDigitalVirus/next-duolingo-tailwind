import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import {
  UserStatus,
  SubscriptionTier,
  UserRole as PrismaUserRole,
} from "@prisma/client";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "boolean" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: "Please enter both email and password.",
            })
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true,
            avatar: true,
            userSubscription: true,
            enrollments: {
              where: {
                isActive: true,
                status: "ACTIVE",
              },
              include: {
                course: true,
              },
              take: 1,
            },
          },
        });

        if (!user) {
          throw new Error(
            JSON.stringify({
              code: 404,
              message: "User not found. Please register first.",
            })
          );
        }

        // Check if user has a password (OAuth users might not have one)
        if (!user.password) {
          throw new Error(
            JSON.stringify({
              code: 401,
              message:
                "This account uses social login. Please sign in with your social provider.",
            })
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error(
            JSON.stringify({
              code: 401,
              message: "Invalid credentials. Incorrect password.",
            })
          );
        }

        if (user.status !== UserStatus.ACTIVE) {
          throw new Error(
            JSON.stringify({
              code: 403,
              message: "Account not activated. Please verify your email.",
            })
          );
        }

        // Update user's last activity
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastActiveAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar?.url || null,
          role: user.role,
          status: user.status,
          subscriptionTier:
            user.userSubscription?.tier || SubscriptionTier.FREE,
          xp: user.xp,
          streak: user.streak,
          gems: user.gems,
          lastActiveAt: user.lastActiveAt,
          emailVerified: user.emailVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // User progress fields from User model
          hearts: user.hearts,
          totalPoints: user.totalPoints,
          level: user.level,
          totalStudyTime: user.totalStudyTime,
          dailyStudyTime: user.dailyStudyTime,
          perfectExercises: user.perfectExercises,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          // Active enrollment
          activeCourseId: user.enrollments[0]?.courseId || null,
          activeCourseTitle: user.enrollments[0]?.course?.title || null,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
          include: {
            role: true,
            avatar: true,
            userSubscription: true,
            enrollments: {
              where: {
                isActive: true,
                status: "ACTIVE",
              },
              include: {
                course: true,
              },
              take: 1,
            },
          },
        });

        if (existingUser) {
          // Update user data and last activity
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.name,
              lastActiveAt: new Date(),
            },
          });

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            image: existingUser.avatar?.url || null,
            role: existingUser.role,
            status: existingUser.status,
            subscriptionTier:
              existingUser.userSubscription?.tier || SubscriptionTier.FREE,
            xp: existingUser.xp,
            streak: existingUser.streak,
            gems: existingUser.gems,
            lastActiveAt: existingUser.lastActiveAt,
            emailVerified: existingUser.emailVerifiedAt,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
            hearts: existingUser.hearts,
            totalPoints: existingUser.totalPoints,
            level: existingUser.level,
            totalStudyTime: existingUser.totalStudyTime,
            dailyStudyTime: existingUser.dailyStudyTime,
            perfectExercises: existingUser.perfectExercises,
            currentStreak: existingUser.currentStreak,
            longestStreak: existingUser.longestStreak,
            activeCourseId: existingUser.enrollments[0]?.courseId || null,
            activeCourseTitle:
              existingUser.enrollments[0]?.course?.title || null,
          };
        }

        // Get or create STUDENT role (not USER, as per our schema)
        let studentRole = await prisma.userRole.findUnique({
          where: { name: "STUDENT" },
        });

        if (!studentRole) {
          studentRole = await prisma.userRole.create({
            data: {
              name: "STUDENT",
              description: "Default student role",
            },
          });
        }

        // Find a default course to enroll the user in
        const defaultCourse = await prisma.course.findFirst({
          where: {
            isPublic: true,
            category: "LANGUAGE",
            level: "BEGINNER",
          },
          orderBy: { id: "asc" },
        });

        // Create a new user with default values according to new schema
        const newUser = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            roleId: studentRole.id,
            status: UserStatus.ACTIVE,
            xp: 0,
            streak: 0,
            gems: 0,
            hearts: 5,
            totalPoints: 0,
            level: 1,
            totalStudyTime: 0,
            dailyStudyTime: 0,
            perfectExercises: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveAt: new Date(),
            emailVerifiedAt: new Date(),
            // Create default subscription
            userSubscription: {
              create: {
                tier: SubscriptionTier.FREE,
              },
            },
          },
          include: {
            role: true,
            userSubscription: true,
          },
        });

        // Enroll user in default course if available
        let activeCourseId = null;
        let activeCourseTitle = null;

        if (defaultCourse) {
          // Get first lesson of the course
          const firstLesson = await prisma.lesson.findFirst({
            where: {
              unit: {
                courseId: defaultCourse.id,
              },
            },
            orderBy: {
              order: "asc",
            },
            include: {
              unit: true,
            },
          });

          // Create enrollment
          const enrollment = await prisma.userEnrollment.create({
            data: {
              userId: newUser.id,
              courseId: defaultCourse.id,
              status: "ACTIVE",
              isActive: true,
              progressPercent: 0,
              completedLessons: [],
              completedChallenges: [],
              coursePoints: 0,
              courseHearts: 5,
              perfectChallenges: 0,
              totalTimeSpent: 0,
              enrolledAt: new Date(),
              startedAt: new Date(),
              lastAccessedAt: new Date(),
              currentUnitId: firstLesson?.unitId,
              currentLessonId: firstLesson?.id,
            },
          });

          activeCourseId = defaultCourse.id;
          activeCourseTitle = defaultCourse.title;
        }

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          image: null,
          role: newUser.role,
          status: newUser.status,
          subscriptionTier:
            newUser.userSubscription?.tier || SubscriptionTier.FREE,
          xp: newUser.xp,
          streak: newUser.streak,
          gems: newUser.gems,
          lastActiveAt: newUser.lastActiveAt,
          emailVerified: newUser.emailVerifiedAt,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
          hearts: newUser.hearts,
          totalPoints: newUser.totalPoints,
          level: newUser.level,
          totalStudyTime: newUser.totalStudyTime,
          dailyStudyTime: newUser.dailyStudyTime,
          perfectExercises: newUser.perfectExercises,
          currentStreak: newUser.currentStreak,
          longestStreak: newUser.longestStreak,
          activeCourseId,
          activeCourseTitle,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        // Update token when user updates their profile
        token = { ...token, ...session.user };
      } else if (user) {
        // Populate token with user data on login
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
        token.status = user.status;
        token.subscriptionTier = user.subscriptionTier;
        token.xp = user.xp;
        token.streak = user.streak;
        token.gems = user.gems;
        token.lastActiveAt = user.lastActiveAt;
        token.emailVerified = user.emailVerified;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;

        // New user progress fields
        token.hearts = user.hearts;
        token.totalPoints = user.totalPoints;
        token.level = user.level;
        token.totalStudyTime = user.totalStudyTime;
        token.dailyStudyTime = user.dailyStudyTime;
        token.perfectExercises = user.perfectExercises;
        token.currentStreak = user.currentStreak;
        token.longestStreak = user.longestStreak;

        // Active enrollment info
        token.activeCourseId = user.activeCourseId;
        token.activeCourseTitle = user.activeCourseTitle;
      }

      // Update lastActiveAt in database periodically
      if (token.id) {
        const now = new Date();
        const lastActive = token.lastActiveAt
          ? new Date(token.lastActiveAt)
          : null;

        // Update every 5 minutes to avoid overloading the database
        if (
          !lastActive ||
          now.getTime() - lastActive.getTime() > 5 * 60 * 1000
        ) {
          try {
            await prisma.user.update({
              where: { id: token.id as string },
              data: { lastActiveAt: now },
            });
            token.lastActiveAt = now;
          } catch (error) {
            console.error("Error updating lastActiveAt:", error);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = token.role as PrismaUserRole;
        session.user.status = token.status as UserStatus;
        session.user.subscriptionTier =
        token.subscriptionTier as SubscriptionTier;
        session.user.xp = token.xp as number;
        session.user.streak = token.streak as number;
        session.user.gems = token.gems as number;
        session.user.lastActiveAt = token.lastActiveAt as Date;
        session.user.emailVerified = token.emailVerified as Date;
        session.user.createdAt = token.createdAt as Date;
        session.user.updatedAt = token.updatedAt as Date;

        // New user progress fields
        session.user.hearts = token.hearts as number;
        session.user.totalPoints = token.totalPoints as number;
        session.user.level = token.level as number;
        session.user.totalStudyTime = token.totalStudyTime as number;
        session.user.dailyStudyTime = token.dailyStudyTime as number;
        session.user.perfectExercises = token.perfectExercises as number;
        session.user.currentStreak = token.currentStreak as number;
        session.user.longestStreak = token.longestStreak as number;

        // Active enrollment info
        session.user.activeCourseId = token.activeCourseId as number | null;
        session.user.activeCourseTitle = token.activeCourseTitle as
          | string
          | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/home",
  },
};

export default authOptions;
