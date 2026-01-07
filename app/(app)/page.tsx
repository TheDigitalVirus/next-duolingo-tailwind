"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Page from "./pages/page";

export default function HomePage() {
    const { status } = useSession();
    const router = useRouter();
    const [isCheckingQuestionnaire, setIsCheckingQuestionnaire] = useState(false);

    useEffect(() => {
        const redirectAuthenticatedUser = async () => {
            if (status !== "authenticated") return;

            setIsCheckingQuestionnaire(true);
            try {
                const response = await fetch("/api/user/questionnaire");

                if (!response.ok)
                    throw new Error("Failed to fetch questionnaire status");

                const { hasCompletedQuestionnaire } = await response.json();
                router.push(hasCompletedQuestionnaire ? "/learn" : "/select-courses");
            } catch (error) {
                console.error("Questionnaire check failed:", error);
                setIsCheckingQuestionnaire(false);
            }
        };

        redirectAuthenticatedUser();
    }, [status, router]);

    if (
        status === "loading" ||
        (status === "authenticated" && isCheckingQuestionnaire)
    ) {
        return <> <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
                <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
        </div></>;
    }

    if (status === "unauthenticated") {
        return <Page />;
    }

    return <> <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
            <p className="mt-2 text-gray-600">Redirecionando...</p>
        </div>
    </div></>;
}