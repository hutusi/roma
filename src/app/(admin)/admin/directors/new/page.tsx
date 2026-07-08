import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { DirectorForm } from "../director-form";

export const metadata = { title: "新建导演" };

export default async function NewDirectorPage() {
  await requireEditor();
  const mediaRows = await db
    .select({ id: media.id, url: media.url, alt: media.alt })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-bold text-xl">新建导演</h1>
      <div className="mt-6">
        <DirectorForm
          directorId={null}
          media={mediaRows}
          defaultValues={{
            slug: "",
            name: "",
            nameZh: "",
            bio: "",
            careerEssay: null,
          }}
        />
      </div>
    </div>
  );
}
