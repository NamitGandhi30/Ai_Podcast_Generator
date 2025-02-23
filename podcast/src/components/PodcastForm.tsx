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

  // Fetch available voices from backend
  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await fetch("http://127.0.0.1:5000/get-voices");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Fetched voices:", data);

        if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
          setAvailableVoices(data.voices);
          setSelectedVoice(data.voices[0]); // Default to first voice
        } else {
          throw new Error("No voices found.");
        }
      } catch (error: any) {
        console.error("Error fetching voices:", error);
        setError(error.message || "Failed to fetch available voices.");
        setAvailableVoices([]);
      }
    }

    fetchVoices();
  }, []);

  // Generate podcast script and audio
  const generatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setScript("");
    setAudioUrl("");
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const topic = formData.get("topic") as string;
    const duration = Number(formData.get("duration"));
    const speakers = formData.get("speakers") as string; // Keep speakers as string

    if (!topic || isNaN(duration) || !speakers) {
      setError("Invalid input. Please enter valid values.");
      setLoading(false);
      return;
    }

    const payload = { topic, duration, speakers };

    try {
      console.log("Generated Payload:", payload);

      // Generate script
      const scriptRes = await fetch("http://localhost:5000/generate_script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!scriptRes.ok) throw new Error(`Script API Error: ${scriptRes.statusText}`);

      const scriptData = await scriptRes.json();
      if (!scriptData.script) throw new Error("No script was generated.");

      setScript(scriptData.script);
      console.log("Script Response:", scriptData.script);

      // Generate audio
      const audioRes = await fetch("http://localhost:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: scriptData.script,
          voice: selectedVoice,
          loudness: loudness,
        }),
      });

      if (!audioRes.ok) throw new Error(`Audio API Error: ${audioRes.statusText}`);

      const audioBlob = await audioRes.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An error occurred while generating your podcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6 bg-white shadow-2xl rounded-xl">
      <h2 className="text-3xl font-bold text-center mb-6">🎙️ Create Your Podcast</h2>
      <form onSubmit={generatePodcast} className="space-y-4">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" type="text" required />

        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input id="duration" name="duration" type="number" min="1" required />

        <Label htmlFor="speakers">Speakers (comma-separated names)</Label>
        <Input id="speakers" name="speakers" type="text" required placeholder="e.g., Alice, Bob" />

        <Label htmlFor="voice">Voice</Label>
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger>
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {availableVoices.length > 0 ? (
              availableVoices.map((voice) => (
                <SelectItem key={voice} value={voice}>{voice}</SelectItem>
              ))
            ) : (
              <SelectItem disabled value="loading">Loading voices...</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Label htmlFor="loudness">Loudness</Label>
        <Input
          id="loudness"
          name="loudness"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={loudness}
          onChange={(e) => setLoudness(parseFloat(e.target.value))}
        />

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white" disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate Podcast"}
        </Button>
      </form>

      {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">⚠️ {error}</div>}
      {script && <div className="mt-6 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">📜 {script}</div>}
      {audioUrl && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold text-lg">🎧 Listen:</h3>
          <audio controls className="w-full mt-2">
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
          <a href={audioUrl} download="podcast.mp3" className="block mt-2 text-blue-600 underline">
            Download Audio
          </a>
        </div>
      )}
    </Card>
  );
}
