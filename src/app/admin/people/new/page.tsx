import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { PersonForm } from "../person-form";

export const metadata = { title: "新建人物" };

export default async function NewPersonPage() {
  await requireEditor();
  const mediaRows = await db
    .select({ id: media.id, url: media.url, alt: media.alt })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-bold text-xl">新建人物</h1>
      <div className="mt-6">
        <PersonForm
          personId={null}
          media={mediaRows}
          defaultValues={{
            slug: "",
            name: "",
            nameZh: "",
            primaryRole: "director",
            bio: "",
            careerEssay: null,
            bioEn: "",
            careerEssayEn: null,
          }}
        />
      </div>
    </div>
  );
}
