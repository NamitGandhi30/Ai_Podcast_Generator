"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PodcastForm() {
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("Bella");
  const [loudness, setLoudness] = useState(1.0);

  useEffect(() => {
    fetch("http://localhost:5000/available_voices")
      .then((res) => res.json())
      .then((data) => setAvailableVoices(data.voices || []))
      .catch(() => setAvailableVoices([]));
  }, []);

  const generatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setScript("");
    setAudioUrl("");
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const scriptRes = await fetch("http://localhost:5000/generate_script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: formData.get("topic"),
          duration: formData.get("duration"),
          speakers: formData.get("speakers"),
        }),
      });
      const scriptData = await scriptRes.json();
      setScript(scriptData.script);

      const audioRes = await fetch("http://localhost:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: scriptData.script,
          voice: selectedVoice,
          loudness: loudness,
        }),
      });
      const audioBlob = await audioRes.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (error) {
      setError("An error occurred while generating your podcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="max-w-lg mx-auto p-6 bg-white shadow-2xl rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-6">🎙️ Create Your Podcast</h2>
        <form onSubmit={generatePodcast} className="space-y-4">
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" name="topic" type="text" required className="focus:ring-2 focus:ring-blue-500" />
          
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input id="duration" name="duration" type="number" min="1" required />

          <Label htmlFor="speakers">Number of Speakers</Label>
          <Input id="speakers" name="speakers" type="number" min="1" required />

          <Label htmlFor="voice">Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem key={voice} value={voice}>
                  {voice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="loudness">Loudness</Label>
          <Input id="loudness" name="loudness" type="range" min="0.5" max="2.0" step="0.1" value={loudness} onChange={(e) => setLoudness(parseFloat(e.target.value))} />

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate Podcast"}
          </Button>
        </form>

        {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">⚠️ {error}</div>}
        {script && <div className="mt-6 p-4 bg-gray-100 rounded-lg">📜 {script}</div>}
        {audioUrl && (
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h3 className="font-semibold text-lg">🎧 Listen:</h3>
            <audio controls className="w-full mt-2">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </Card>
    </div>
  );
}
