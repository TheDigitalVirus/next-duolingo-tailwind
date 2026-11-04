// app/(main)/layout.tsx
"use client";

import { useEffect, type PropsWithChildren, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import { LeftBar } from "./components/left-bar";
import { BottomBar } from "./components/bottom-bar";
import { DarkPageBackground } from "./components/dark-page-background";
import { getSelectedTabFromPathname, isMainAppRoute } from "./components/nav-items";
import { RightBar } from "@/components/RightBar";
import { TopBar } from "@/components/TopBar";
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
  const isMainPage = showLayout && isMainAppRoute(pathname);

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
          {isMainPage ? (
            // `dark` ativa as variantes dark:/tokens do tema só nesta área,
            // para o conteúdo combinar com o fundo escuro e a RightBar.
            <div className="dark text-foreground">
              <DarkPageBackground />
              <TopBar />
              <div className="flex justify-center gap-12 px-4 sm:px-6">
                <div className="w-full min-w-0 max-w-2xl">{children}</div>
                <RightBar />
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
      {showLayout && <BottomBar selectedTab={selectedTab} />}
    </>
  );
};

export default MainLayout;
