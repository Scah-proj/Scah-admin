import type { ReactNode } from "react";
import { Lato } from "next/font/google";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${lato.className} flex min-h-screen flex-col md:flex-row`}
    >
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-5 md:px-9 md:py-8">
        <Header />
        {children}
      </main>
    </div>
  );
}
