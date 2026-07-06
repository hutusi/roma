import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

/**
 * THE shared contract between the admin editor and the public renderer.
 * Both sides must use exactly this list: anything the editor can
 * produce, the static renderer must know how to render — and nothing
 * else ever renders. Extend both sides together or not at all.
 */
export const essayExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
    code: false,
    link: {
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer" },
    },
  }),
  Image.configure({ inline: false }),
];
