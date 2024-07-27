import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from '@/components/ui/sonner'

import { ClerkProvider } from "@clerk/nextjs";
import { enUS, ptBR } from "@clerk/localizations";
export const metadata: Metadata = {
  title: "AdvClub",
  description: "AdvClub",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { locale: string } }>) {
  const messages = await getMessages();

  return (
    <ClerkProvider afterSignOutUrl={'/login'} localization={params.locale === 'pt-BR' ? ptBR : enUS}>
    <html lang={params.locale} className={`${GeistSans.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
      </html>
    </ClerkProvider>
  );
}
