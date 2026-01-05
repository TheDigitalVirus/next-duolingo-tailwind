import { ReactNode, Suspense } from "react";
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { TooltipsProvider } from "@/providers/tooltips-provider";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] });

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Duolingo Clone',
    default: 'Duolingo Clone - O jeito de aprender mais popular do mundo',
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased text-base text-foreground bg-background',
          inter.className,
        )}
      >
        <QueryProvider>
          <AuthProvider>
            <SettingsProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                storageKey="duo-theme"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
              >
                <I18nProvider>
                  <TooltipsProvider>
                    <Suspense>{children}</Suspense>
                    <Toaster />
                  </TooltipsProvider>
                </I18nProvider>
              </ThemeProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
