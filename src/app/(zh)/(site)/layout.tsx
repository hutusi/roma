import { RumBeacon } from "@/components/site/rum-beacon";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Hoisted to <head> by React; here (not layout metadata) so it survives
          pages that set their own `alternates`, e.g. the home page's hreflang. */}
      <link rel="alternate" type="application/rss+xml" title="八部半" href="/rss.xml" />
      <RumBeacon />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
