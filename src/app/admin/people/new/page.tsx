import { getEditorMedia } from "@/db/queries/admin";
import { requireEditor } from "@/lib/auth-guards";
import { PersonForm } from "../person-form";

export const metadata = { title: "新建人物" };

export default async function NewPersonPage() {
  await requireEditor();
  const mediaRows = await getEditorMedia();

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
            editorialNote: "",
            editorialNoteEn: "",
          }}
        />
      </div>
    </div>
  );
}
