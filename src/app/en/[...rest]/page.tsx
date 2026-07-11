import { notFound } from "next/navigation";

/** See (zh)/[...rest] — each root-layout tree catches its own strays. */
export default function EnCatchAll() {
  notFound();
}
