// app/(main)/onboarding/page.tsx
import { Suspense } from "react";

import { OnboardingContent } from "./components/onboarding-content";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-green-50 to-white p-4">
          <div className="flex flex-col items-center gap-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            <p className="text-gray-600">Carregando questionário...</p>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
