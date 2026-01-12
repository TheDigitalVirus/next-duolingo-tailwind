"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/providers/i18n-provider";
import { useTranslation } from "react-i18next";
import { LanguageDropDown } from "@/components/languageDropDown";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourseSelection {
  id: number;
  title: string;
  imageSrc: string;
  description: string;
  language: string;
  enrolledCount: number;
  estimatedHours: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} mi`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} mil`;
  }
  return num.toString();
};

export default function SelectCoursesPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<CourseSelection[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsCoursesLoading(true);
        const response = await apiFetch(`/api/courses?sourceLanguage=${language.code}`);

        if (response.ok) {
          const coursesData = await response.json();

          const enrichedCourses = coursesData.map((course: CourseSelection) => ({
            ...course,
            enrolledCount: course.enrolledCount > 0 && course.enrolledCount || 0,
          }));
          setCourses(enrichedCourses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    fetchCourses();
    setMounted(true);
  }, [language.code]);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(selectedCourseId === courseId ? null : courseId);
  };

  const handleStartLearning = async () => {
    if (!selectedCourseId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/activate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId }),
      });

      if (!response.ok) throw new Error("Failed to activate course");

      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
      );
      const queryParams = new URLSearchParams({
        courseId: selectedCourseId.toString(),
        courseTitle: selectedCourse?.title || "",
      });

      router.push(`/onboarding?${queryParams}`);
    } catch (error) {
      console.error("Error starting learning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitleText = () => {
    return t('common.selectCourses.title', { language: language.name });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 dark:from-background dark:to-muted/10 py-4 md:py-8">
      <div className="container mx-auto max-w-6xl px-3 md:px-4">
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground dark:text-foreground">
              {t('common.selectCourses.mobileTitle')}
            </h1>
            <div className="flex items-center gap-2.5">
              { isMobile && <LanguageDropDown variant="mobile-flag" /> }
              <Button
                className="h-9 w-9 rounded-full"
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {mounted && (resolvedTheme === 'dark' ?
                  <Sun className="size-4" /> :
                  <Moon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex mb-8 flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-foreground dark:text-foreground">
              {getTitleText()}
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {t('common.selectCourses.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2 bg-card dark:bg-card border border-input dark:border-input rounded-lg hover:bg-accent dark:hover:bg-accent transition-colors">
                <LanguageDropDown />
              </div>
            </div>

            {mounted && (
              <Button
                className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Grid de cursos */}
        <div className="mb-8 md:mb-12">
          {isCoursesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message={t('common.loadingCourses')} />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground dark:text-muted-foreground">{t('common.selectCourses.noCourses')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSelected={selectedCourseId === course.id}
                  onSelect={() => handleCourseSelect(course.id)}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        {/* Seção do curso selecionado */}
        {selectedCourseId && (
          <div className="mb-6 md:mb-8 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 md:p-6 text-center border border-primary/20 dark:border-primary/30 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-primary dark:text-primary mb-3 md:mb-4">
              {t('common.selectCourses.readyToStart')}
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <img
                src={courses.find(c => c.id === selectedCourseId)?.imageSrc}
                alt={courses.find(c => c.id === selectedCourseId)?.title}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <div className="text-center md:text-left">
                <p className="text-xl md:text-2xl font-bold text-foreground dark:text-foreground mb-1">
                  {courses.find(c => c.id === selectedCourseId)?.title}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
                  {formatNumber(courses.find(c => c.id === selectedCourseId)?.enrolledCount || 0)} {t('common.students')} •
                  {courses.find(c => c.id === selectedCourseId)?.estimatedHours}h
                </p>
              </div>
              <Button
                onClick={handleStartLearning}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-primary-foreground rounded-full shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    {t('common.loading')}
                  </span>
                ) : (
                  t('common.selectCourses.startLearning')
                )}
              </Button>
            </div>
          </div>
        )}

        {!selectedCourseId && (
          <div className="text-center">
            <Button
              onClick={handleStartLearning}
              disabled={true}
              className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/70 px-6 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold text-muted-foreground rounded-full shadow-lg transition-all duration-300 cursor-not-allowed"
              size="lg"
            >
              {t('common.selectCourses.selectCourseFirst')}
            </Button>
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
              {t('common.selectCourses.selectPrompt')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({
  course,
  isSelected,
  onSelect,
  t,
}: {
  course: CourseSelection;
  isSelected: boolean;
  onSelect: () => void;
  t: any;
}) {
  return (
    <div
      className={`relative rounded-xl md:rounded-2xl border-2 bg-card dark:bg-card p-3 md:p-4 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${isSelected
          ? 'border-primary dark:border-primary ring-2 ring-primary/20 dark:ring-primary/30'
          : 'border-border dark:border-input hover:border-primary/50 dark:hover:border-primary/30'
        }`}
      onClick={onSelect}
    >
      <div className="flex flex-col h-full">
        {course.enrolledCount > 1000000 && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary dark:bg-primary text-primary-foreground text-xs font-bold px-2 md:px-3 py-1 rounded-full">
            {t('common.selectCourses.popular')}
          </div>
        )}

        <div className="flex items-center mb-2 md:mb-3">
          <div className="relative mr-2 md:mr-3 h-10 w-10 md:h-12 md:w-12 shrink-0">
            <img
              src={course.imageSrc}
              alt={course.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-foreground dark:text-foreground truncate">
              {course.title}
            </h3>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-1">
              {course.description}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-2 md:pt-3 border-t border-border dark:border-input">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm font-bold text-primary dark:text-primary">
                  {formatNumber(course.enrolledCount)}
                </span>
                <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                  {t('common.students')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                {t('common.estimatedTime', { hours: course.estimatedHours })}
              </p>
            </div>

            <div className={`flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full border-2 ${isSelected
                ? 'border-primary dark:border-primary bg-primary dark:bg-primary'
                : 'border-border dark:border-input bg-card dark:bg-card'
              }`}>
              {isSelected && (
                <span className="text-xs font-bold text-primary-foreground dark:text-primary-foreground">✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}