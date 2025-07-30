

import "@/styles/main.scss";


import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";

import { AppConfig } from "@/utils/AppConfig";
import Layout from "@/components/Layout";
import type { Viewport } from "next";

import { LandingPageProvider } from "@/Context/LandingPageContext";

export const viewport: Viewport = {
  themeColor: "black",
};

export const metadata: Metadata = {
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  // ... (keep existing metadata)
};

export function generateStaticParams() {
  return AppConfig.locales.map((locale) => ({ locale }));
}

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);

  // Using internationalization in Client Components
 

  return (
    <html lang={props.params.locale} dir="ltr">
      <body className="relative">
        <LandingPageProvider>
          <Layout>{props.children}</Layout>
        </LandingPageProvider>
      </body>
    </html>
  );
}
