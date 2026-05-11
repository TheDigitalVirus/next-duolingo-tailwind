// app/(main)/layout.tsx
"use client";

import { useEffect, type PropsWithChildren, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import { LeftBar } from "./components/left-bar";
import { BottomBar } from "./components/bottom-bar";
import { getSelectedTabFromPathname } from "./components/nav-items";
import { useSession } from "next-auth/react";

const MainLayout = ({ children }: PropsWithChildren) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAuthAndQuestionnaire = async () => {
      if (status === "unauthenticated") {
        router.push("/");
        return;
      }

      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/questionnaire");

          if (response.ok) {
            const data = await response.json();
            const hasCompletedQuestionnaire = data.hasCompletedQuestionnaire;

            if (!hasCompletedQuestionnaire &&
              pathname !== "/select-courses" &&
              pathname !== "/onboarding") {
              router.push("/select-courses");
              return;
            }

            if (hasCompletedQuestionnaire &&
              (pathname === "/select-courses" || pathname === "/onboarding")) {
              router.push("/learn");
              return;
            }
          }
        } catch (error) {
          console.error("Error checking questionnaire:", error);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkAuthAndQuestionnaire();
  }, [status, router, pathname]);

  const isSelectCoursesPage = pathname === "/select-courses";
  const isOnboardingPage = pathname === "/onboarding";
  const selectedTab = getSelectedTabFromPathname(pathname);

  if (!session && status !== "loading") {
    router.replace("/");
    return null;
  }

  // Não mostrar sidebar e header nas páginas de seleção de curso e onboarding
  const showLayout = !isSelectCoursesPage && !isOnboardingPage;

  return (
    <>
      <main
        className={`
        h-full 
        ${showLayout ? `pt-12.5 lg:pt-0 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}` : ""}
      `}
      >
        <div
          className={`
          mx-auto h-full 
          ${showLayout ? "pt-6" : ""}
        `}
        >
          {showLayout && (
            <LeftBar
              selectedTab={selectedTab}
              collapsed={isSidebarCollapsed}
              onCollapsedChange={setIsSidebarCollapsed}
            />
          )}
          {children}
        </div>
      </main>
      {showLayout && <BottomBar selectedTab={selectedTab} />}
    </>
  );
};

export default MainLayout;
