import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Team Task - SaaS Task Management",
  description: "Hierarchical task management system for Admin, Manager, and Staff.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
