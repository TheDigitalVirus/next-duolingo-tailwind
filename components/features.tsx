"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

import DuoImage from "@/public/duo.svg";
import DuoPro from "@/public/duo-pro.svg";
import FireImage from "@/public/fire.svg";
import CorrectImage from "@/public/correct.svg";
import CrownImage from "@/public/crown.svg";
import WomanImage from "@/public/woman.svg";

const Features = () => {
  const { t } = useTranslation();

  const reasons = [
    {
      id: "effective",
      icon: FireImage,
      title: t("features.reasons.effective.title"),
      description: t("features.reasons.effective.description"),
      iconAlt: "fire icon",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-950/30",
    },
    {
      id: "personalized",
      icon: CorrectImage,
      title: t("features.reasons.personalized.title"),
      description: t("features.reasons.personalized.description"),
      iconAlt: "correct icon",
      iconColor: "text-green-600 dark:text-green-500",
      bgColor: "bg-green-100 dark:bg-green-950/30",
    },
    {
      id: "motivated",
      icon: CrownImage,
      title: t("features.reasons.motivated.title"),
      description: t("features.reasons.motivated.description"),
      iconAlt: "crown icon",
      iconColor: "text-yellow-600 dark:text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
    },
    {
      id: "fun",
      icon: WomanImage,
      title: t("features.reasons.fun.title"),
      description: t("features.reasons.fun.description"),
      iconAlt: "woman icon",
      iconColor: "text-purple-600 dark:text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-950/30",
    },
  ];

  const superFeatures = [
    t("features.super.unlimited_hearts"),
    t("features.super.personalized_practice"),
    t("features.super.mastery_quizzes"),
  ];

  const handleNavClick = (item: string) => {
    if (item === "home") {
      // Scroll to top of page for Home link
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      const targetId = item.toLowerCase().replace(" ", "-");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <div id='features' className="min-h-screen bg-muted/50 font-sans">
      <section className="py-12 md:py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t("features.heading.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {t("features.heading.description")}
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => handleNavClick('home')}>
              {t("common.buttons.start_button")}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="relative w-65 sm:w-75 md:w-85 lg:w-95">
              <Image
                src={DuoImage}
                alt={t("common.buttons.mascot_alt")}
                width={400}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-6 -right-6 bg-card p-4 rounded-2xl shadow-xl border"
              >
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-2" />
                  <span className="font-bold text-lg text-foreground">
                    4.8 ★
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("features.app_rating")}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("features.reasons.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t("features.reasons.description")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-card border hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div
                        className={cn(
                          "shrink-0 rounded-full p-3",
                          reason.bgColor
                        )}
                      >
                        <Image
                          src={reason.icon}
                          alt={reason.iconAlt}
                          width={28}
                          height={28}
                          className="w-7 h-7 md:w-full md:h-auto"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {reason.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-2/5 flex justify-center"
          >
            <div className="relative w-65 sm:w-75 md:w-85 lg:w-95">
              <Image
                src={DuoPro}
                alt={t("features.super.alt")}
                width={350}
                height={350}
                className="w-full h-auto drop-shadow-2xl"
              />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-4 -right-4 bg-linear-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg"
              >
                <span className="font-bold">{t("features.super.badge")}</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full md:w-3/5 text-center md:text-left px-4 md:px-0"
          >
            <h2 className="text-2xl leading-tight font-bold text-foreground mb-4 md:text-4xl md:mb-6">
              {t("features.super.title")}
            </h2>

            <div className="flex flex-col items-center mb-4 md:items-start">
              <p className="text-sm leading-snug text-muted-foreground dark:text-slate-300 md:text-xl">
                {t("features.super.free")}
              </p>
            </div>

            <p className="text-base text-muted-foreground mb-3 leading-relaxed md:text-lg">
              {t("features.super.description")}
            </p>

            {/* Badge */}
            <div className="flex justify-center md:justify-start mb-6 md:mb-8">
              <span
                className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold uppercase
                              tracking-wide text-green-700 dark:bg-green-900/40 dark:text-green-300"
              >
                {t("features.super.trial")}
              </span>
            </div>

            <div className="space-y-3 mb-6 md:space-y-4 md:mb-8">
              {superFeatures.map((item) => (
                <div key={item} className="flex items-start md:items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mr-3 mt-0.5 md:mt-0" />
                  <span className="text-sm md:text-base text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="w-full max-w-md mx-auto bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white 
              px-6 py-4 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:px-8 md:py-6 md:text-lg md:mx-0"
              onClick={() => handleNavClick('home')}
            >
              {t("features.super.button")}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;