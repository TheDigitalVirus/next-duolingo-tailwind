// components/common.buttons.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import TrustedBrands from "@/components/trusted-brands";
import DuoHome from "@/public/duo-home.svg";
import { LoginModal } from "./modals/login-modal";
import { SignupModal } from "./modals/signup-modal";
import { useTranslation } from 'react-i18next';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleGetStarted = useCallback(() => {
    session ? router.push("/learn") : setActiveModal("signup");
  }, [session, router]);

  return (
    <>
      <section id="home" className="relative min-h-screen overflow-hidden bg-muted/50">
        <div className="relative z-10 mx-auto flex min-h-screen items-center px-4">
          <div className="mx-auto flex w-full max-w-247 flex-col items-center md:flex-row md:items-center md:justify-end md:gap-20 md:py-12">
            <div className="relative flex w-full flex-1 justify-center items-end md:justify-center md:-mr-16.25">
              <Image
                src={DuoHome}
                alt="Duolingo mascot"
                width={424}
                height={424}
                priority
                className="w-full max-w-68.25 md:max-w-106 aspect-square"
              />
            </div>

            <div className="flex flex-1 flex-col items-center">
              <h1
                className="mt-2 text-center font-bold leading-normal text-[32px]
                max-w-86.25 md:mt-4 md:max-w-120 lg:w-120"
              >
                <span className="block md:inline">{t("common.buttons.title")}</span>
              </h1>

              {/* _1-0oK */}
              <div className="mt-5 flex w-full max-w-82.5 flex-col gap-3 md:mt-10">
                {/* Primary */}
                <button
                  onClick={handleGetStarted}
                  className="h-12.5 w-full rounded-xl bg-[#58cc02] border-b-4 border-[#58a700]
                    text-[15px] font-bold uppercase tracking-[0.8px]
                    text-white
                    transition hover:brightness-110 active:translate-y-0.5"
                >
                  {t("common.buttons.start_button")}
                </button>

                {/* Secondary */}
                <button
                  onClick={() => setActiveModal("login")}
                  className="
                    h-12.5 w-full
                    rounded-xl
                    border border-[#e5e5e5]
                    bg-white
                    text-[15px] font-bold uppercase tracking-[0.8px]
                    text-[#1cb0f6]
                    transition hover:bg-gray-50 active:translate-y-0.5
                  "
                >
                   {t('common.buttons.login_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <TrustedBrands />
      </section>

      <LoginModal
        isOpen={activeModal === "login"}
        onClose={() => setActiveModal(null)}
        onSwitchToSignup={() => setActiveModal("signup")}
      />
      <SignupModal
        isOpen={activeModal === "signup"}
        onClose={() => setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal("login")}
      />
    </>
  );
}
