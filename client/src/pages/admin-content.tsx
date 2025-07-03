import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";

export default function AdminContentEditor() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const CONTACT_KEYS = ["contact_email", "contact_phone", "contact_location", "contact_person"];

  const aboutEditor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      ListItem,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-[200px] p-4 border rounded font-sans text-sm text-gray-800 bg-white",
      },
    },
    onUpdate: ({ editor }) => {
      handleChange("about_description", editor.getHTML());
    },
  });

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setContent(map);

        if (map.faq) {
          try {
            const parsed = JSON.parse(map.faq);
            if (Array.isArray(parsed)) setFaqItems(parsed);
          } catch (_) {
            console.warn("Invalid FAQ JSON");
          }
        }

        if (map.about_description && aboutEditor) {
          aboutEditor.commands.setContent(map.about_description);
        }

        setLoading(false);
      });
  }, [aboutEditor]);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string, type: string = "text") => {
    let value = content[key] || "";
    if (key === "faq") {
      value = JSON.stringify(faqItems);
      type = "json";
    }

    const toastId = toast({
      title: "Saving...",
      description: `Saving ${key}...`,
      variant: "default",
    });

    try {
      await fetch(`/api/content/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, type }),
      });

      toast({
        id: toastId.id,
        title: `Saved "${key}" successfully!`,
        variant: "success",
      });
    } catch {
      toast({
        id: toastId.id,
        title: `Failed to save "${key}"`,
        description: "An error occurred while saving.",
        variant: "destructive",
      });
    }
  };

  const handleSaveContact = async () => {
    try {
      await Promise.all(
        CONTACT_KEYS.map((key) =>
          fetch(`/api/content/${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: content[key] || "", type: "text" }),
          })
        )
      );
      toast({ title: "Saved contact information!" });
    } catch {
      toast({
        title: "Failed to save contact information",
        description: "An error occurred while saving.",
        variant: "destructive",
      });
    }
  };

  const addFaqItem = () => setFaqItems([...faqItems, { question: "", answer: "" }]);
  const removeFaqItem = (index: number) => setFaqItems(faqItems.filter((_, i) => i !== index));
  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  };

  if (loading) return <div>Loading content...</div>;

  return (
    <div className="space-y-8 p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800">Website Content Editor</h2>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">About Section</h3>
        <Input
          value={content.about_title || ""}
          onChange={(e) => handleChange("about_title", e.target.value)}
          placeholder="Enter About Title..."
        />
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Bold", action: () => aboutEditor?.chain().focus().toggleBold().run(), isActive: () => aboutEditor?.isActive("bold") },
            { label: "Italic", action: () => aboutEditor?.chain().focus().toggleItalic().run(), isActive: () => aboutEditor?.isActive("italic") },
            { label: "Underline", action: () => aboutEditor?.chain().focus().toggleUnderline().run(), isActive: () => aboutEditor?.isActive("underline") },
            { label: "• List", action: () => aboutEditor?.chain().focus().toggleBulletList().run(), isActive: () => aboutEditor?.isActive("bulletList") },
            { label: "H2", action: () => aboutEditor?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => aboutEditor?.isActive("heading", { level: 2 }) },
          ].map((btn, i) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              className={btn.isActive?.() ? "bg-gray-200" : ""}
              onClick={btn.action}
            >
              {btn.label}
            </Button>
          ))}
        </div>
        <EditorContent editor={aboutEditor} />
        <div className="flex gap-4">
          <Button onClick={() => handleSave("about_title")}>Save Title</Button>
          <Button onClick={() => handleSave("about_description", "html")}>Save Description</Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">FAQ</h3>
        {faqItems.map((item, index) => (
          <div key={index} className="space-y-2 border p-4 rounded-md bg-gray-50">
            <Input
              placeholder="FAQ Question"
              value={item.question}
              onChange={(e) => handleFaqChange(index, "question", e.target.value)}
            />
            <Textarea
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
              rows={3}
            />
            <Button variant="destructive" size="sm" onClick={() => removeFaqItem(index)}>
              Remove
            </Button>
          </div>
        ))}
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={addFaqItem}>+ Add FAQ Item</Button>
          <Button onClick={() => handleSave("faq")}>Save FAQ</Button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        {CONTACT_KEYS.map((key) => (
          <div key={key}>
            <label className="block font-semibold capitalize mb-1">{key.replace("contact_", "").replace("_", " ")}</label>
            <Input
              value={content[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Enter ${key.replace("contact_", "").replace("_", " ")}`}
            />
          </div>
        ))}
        <Button className="mt-4" onClick={handleSaveContact}>
          Save Contact Info
        </Button>
      </div>

      {/* Resale Info Text */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Resale Info</h3>
        <Input
          value={content.resale_info_text || ""}
          onChange={(e) => handleChange("resale_info_text", e.target.value)}
          placeholder="Enter resale info..."
        />
        <Button onClick={() => handleSave("resale_info_text")}>Save</Button>
      </div>
    </div>
  );
}
