import type { Metadata } from "next";
import Link from "next/link";

import { ActorSwitcher } from "@/components/ActorSwitcher";
import { getCurrentActor } from "@/lib/localAuth";

import "./globals.css";

export const metadata: Metadata = {
  title: "RapidAid Content Control",
  description: "Development-only medical content workflow prototype",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const actor = await getCurrentActor();
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div><span className="brand-mark">R</span><strong>RapidAid</strong><span className="product-name">Content Control</span></div>
          <ActorSwitcher actorId={actor.actorId} />
        </header>
        <div className="shell">
          <aside className="sidebar" aria-label="Admin navigation">
            <nav>
              <Link href="/protocols">Protocols</Link>
              <Link href="/review">Clinical review</Link>
              <Link href="/release">Release approval</Link>
              <Link href="/audit">Audit history</Link>
            </nav>
            <div className="environment-note"><strong>LOCAL DEVELOPMENT</strong><span>Synthetic content only</span></div>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
