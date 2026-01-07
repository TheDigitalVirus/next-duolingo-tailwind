"use client";

import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-700">{t("common.messages.courses.languageCourses")}</h1>
    </>
  );
};
