// app/(main)/layout.tsx
"use client";

import { useEffect, type PropsWithChildren, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

const MainLayout = ({ children }: PropsWithChildren) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

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

                        // Se está tentando acessar uma rota protegida mas não completou o questionário
                        if (!hasCompletedQuestionnaire &&
                            pathname !== "/select-courses" &&
                            pathname !== "/onboarding") {
                            router.push("/select-courses");
                            return;
                        }

                        // Se completou o questionário e está tentando acessar select-courses ou onboarding
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

    if (status === "loading" || isChecking) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    // Não mostrar sidebar e header nas páginas de seleção de curso e onboarding
    const showLayout = !isSelectCoursesPage && !isOnboardingPage;

    return (
        <>
            {showLayout && <nav className="fixed top-0 z-50 flex h-12.5 w-full items-center border-b bg-green-500 px-4 lg:hidden">
                <Sheet>
                    <SheetTrigger>
                        <Menu className="text-white" />
                    </SheetTrigger>

                    <SheetContent className="z-100 p-0" side="left">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </nav>}
            {showLayout && <Sidebar className="hidden lg:flex" />}
            <main
                className={`
        h-full 
        ${showLayout ? "pt-12.5 lg:pl-64 lg:pt-0" : ""}
      `}
            >
                <div
                    className={`
          mx-auto h-full 
          ${showLayout ? "pt-6" : ""}
        `}
                >
                    {children}
                </div>
            </main>
        </>
    );
};

export default MainLayout;