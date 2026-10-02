import type { Metadata } from "next";
import "./globals.css";
import { Splash } from "@/components/Splash";

export const metadata: Metadata = {
  title: "Dandiyaa — Find your Dandiya partner",
  description: "An independent, consent-first student social experience for Dandiya night."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Splash />
        {children}
      </body>
    </html>
  );
}
