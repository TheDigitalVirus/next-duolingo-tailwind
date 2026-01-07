"use client";

import Header from "@/components/header";
import Home from "@/components/home";
import Features from "@/components/features";
import Features2 from "@/components/features2";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <Home />
      <Features />
      <Features2 />
      <Footer />
    </div>
  );
}
