import type { Metadata } from "next";
import { personPageMetadata, personStaticParams, renderPersonPage } from "@/lib/person-route";

export async function generateStaticParams() {
  return personStaticParams("actor");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  return personPageMetadata("actor", params);
}

export default async function PublicActorPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  return renderPersonPage("actor", params);
}
