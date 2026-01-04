// components/trusted-brands.tsx
"use client";

import Image from "next/image";
import Marquee from "@/components/ui/marquee";
import { I18N_LANGUAGES } from "@/i18n/config";
import { motion } from "framer-motion";

export default function TrustedBrands() {
  return (
    <section className="absolute bottom-0 left-0 right-0 h-20 border-y-2 border-border/50 bg-muted/50 hidden md:flex">
      <div className="mx-auto flex h-full max-w-259 items-center px-10">

        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-6">

          <div className="overflow-hidden">
            <Marquee pauseOnHover speed={30}>
              {I18N_LANGUAGES.map((language) => (
                <motion.div
                  key={language.code}
                  className="mx-4 flex shrink-0 items-center gap-2 group cursor-pointer"
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-sm">
                    <Image
                      src={`/flags/${language.flag}`}
                      alt={language.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {language.name}
                  </span>
                </motion.div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
