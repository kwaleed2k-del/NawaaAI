"use client";

import { useState } from "react";
import { Hash, Loader2, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const TRENDING_PLACEHOLDER = [
  { tag: "#السعودية", reach: "2M+", category: "Local" },
  { tag: "#Riyadh", reach: "1.5M+", category: "City" },
  { tag: "#SaudiVision2030", reach: "800K+", category: "Vision" },
  { tag: "#موسم_الرياض", reach: "500K+", category: "Events" },
  { tag: "#SaudiFashion", reach: "400K+", category: "Fashion" },
];

export default function HashtagsPage() {
  const supabase = createClient();
  const { selectedCompany } = useAppStore();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [generating, setGenerating] = useState(false);
  const [sets, setSets] = useState<{ broad: string[]; niche: string[]; saudi: string[] } | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Enter a topic");
      return;
    }
    setGenerating(true);
    setSets(null);
    try {
      const res = await fetch("/api/hashtags/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), platform }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSets(json.sets ?? { broad: [], niche: [], saudi: [] });
      toast.success("Hashtag sets generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setSets({ broad: [], niche: [], saudi: [] });
    }
    setGenerating(false);
  }

  function copySet(arr: string[]) {
    navigator.clipboard.writeText(arr.join(" "));
    toast.success("Copied to clipboard");
  }

  const brandHashtags = selectedCompany
    ? [
        `#${(selectedCompany.name || "").replace(/\s+/g, "")}`,
        `#${(selectedCompany.name_ar || selectedCompany.name || "").replace(/\s+/g, "_")}`,
        "#NawaaSaudi",
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cairo'] text-2xl font-bold text-[#D0EBDA]">Hashtag Hub</h1>
        <p className="text-sm text-[#7B9E86]">الهاشتاقات — Generate and copy hashtag sets</p>
      </div>

      <Card className="border-[#172E1F] bg-[#0B1A0F]">
        <CardHeader>
          <CardTitle className="text-[#D0EBDA]">Trending in KSA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TRENDING_PLACEHOLDER.map((t) => (
              <button
                key={t.tag}
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(t.tag);
                  toast.success("Copied " + t.tag);
                }}
                className="flex items-center gap-2 rounded-full border border-[#172E1F] bg-[#061009] px-3 py-1.5 text-sm text-[#D0EBDA] hover:border-[#006C35]"
              >
                {t.tag}
                <span className="text-xs text-[#7B9E86]">{t.reach}</span>
                <Copy className="h-3 w-3" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#172E1F] bg-[#0B1A0F]">
        <CardHeader>
          <CardTitle className="text-[#D0EBDA]">Generate sets</CardTitle>
          <p className="text-sm text-[#7B9E86]">Topic + platform → Broad, Niche, Saudi local sets</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic or content description"
              className="flex-1 border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
            />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-lg border border-[#172E1F] bg-[#020B05] px-3 py-2 text-[#D0EBDA]"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="x">X</option>
            </select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-[#006C35] hover:bg-[#00A352]"
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
            Generate sets
          </Button>
          {sets && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#172E1F] bg-[#061009] p-4">
                <p className="mb-2 text-xs font-medium text-[#C9A84C]">Broad reach</p>
                <div className="flex flex-wrap gap-1">
                  {sets.broad.map((tag) => (
                    <span key={tag} className="rounded bg-[#172E1F] px-1.5 py-0.5 text-xs text-[#D0EBDA]">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-2 border-[#172E1F]" onClick={() => copySet(sets.broad)}>
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
              </div>
              <div className="rounded-xl border border-[#172E1F] bg-[#061009] p-4">
                <p className="mb-2 text-xs font-medium text-[#C9A84C]">Niche</p>
                <div className="flex flex-wrap gap-1">
                  {sets.niche.map((tag) => (
                    <span key={tag} className="rounded bg-[#172E1F] px-1.5 py-0.5 text-xs text-[#D0EBDA]">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-2 border-[#172E1F]" onClick={() => copySet(sets.niche)}>
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
              </div>
              <div className="rounded-xl border border-[#172E1F] bg-[#061009] p-4">
                <p className="mb-2 text-xs font-medium text-[#C9A84C]">Saudi local</p>
                <div className="flex flex-wrap gap-1">
                  {sets.saudi.map((tag) => (
                    <span key={tag} className="rounded bg-[#172E1F] px-1.5 py-0.5 text-xs text-[#D0EBDA]">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-2 border-[#172E1F]" onClick={() => copySet(sets.saudi)}>
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {brandHashtags.length > 0 && (
        <Card className="border-[#172E1F] bg-[#0B1A0F]">
          <CardHeader>
            <CardTitle className="text-[#D0EBDA]">Brand hashtags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {brandHashtags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  toast.success("Copied");
                }}
                className="rounded-full bg-[#006C35]/20 px-3 py-1.5 text-sm text-[#00A352] hover:bg-[#006C35]/30"
              >
                {tag}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
