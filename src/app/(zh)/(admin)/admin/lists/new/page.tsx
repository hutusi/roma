import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { ListForm } from "../list-form";

export const metadata = { title: "新建片单" };

export default async function NewListPage() {
  await requireEditor();
  const mediaRows = await db
    .select({ id: media.id, url: media.url, alt: media.alt })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-bold text-xl">新建片单</h1>
      <div className="mt-6">
        <ListForm
          listId={null}
          media={mediaRows}
          defaultValues={{
            slug: "",
            title: "",
            theme: "",
            intro: null,
            titleEn: "",
            themeEn: "",
            introEn: null,
            sortOrder: 0,
          }}
        />
      </div>
    </div>
  );
}
