import React from "react";

type RegularLayoutProps = {
  children: React.ReactNode;
};

export default function RegularLayout({ children }: RegularLayoutProps) {
  return (
    <main className="bg-base relative flex min-h-screen flex-col gap-5 pt-14">
      {children}
    </main>
  );
}
