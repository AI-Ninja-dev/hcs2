import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeClinicStore | Your Health. Connected at Home.",
  description:
    "Connected home health technology for diabetes, blood pressure, cardiovascular monitoring and chronic care.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
