import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  return (
    <div className="flex items-center">
      <Globe className="h-4 w-4 mr-2 text-gray-600" />
      <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
        <SelectTrigger className="w-32 border-none shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}