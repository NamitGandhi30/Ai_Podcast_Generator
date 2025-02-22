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
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [error, setError] = useState("");
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("Bella");

  useEffect(() => {
    // Fetch available voices when component mounts
    fetch("http://localhost:5000/available_voices")
      .then((res) => res.json())
      .then((data) => {
        setAvailableVoices(data.voices);
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0]);
        }
      })
      .catch((err) => console.error("Error fetching voices:", err));
  }, []);

  const generatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingScript(true);
    setScript("");
    setAudioUrl("");
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      // Step 1: Generate Script
      const scriptResponse = await fetch("http://localhost:5000/generate_script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: formData.get("topic"),
          duration: formData.get("duration"),
          speakers: formData.get("speakers"),
        }),
      });

      if (!scriptResponse.ok) {
        const errorData = await scriptResponse.json();
        throw new Error(errorData.error || "Failed to generate script");
      }

      const scriptData = await scriptResponse.json();
      setScript(scriptData.script);

      // Step 2: Generate Audio
      setLoadingAudio(true);
      const audioResponse = await fetch("http://localhost:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: scriptData.script,
          voice: selectedVoice,
        }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const blob = await audioResponse.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoadingScript(false);
      setLoadingAudio(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold text-center mb-4">
        🎙️ Generate Your Podcast
      </h2>

      <form onSubmit={generatePodcast} className="space-y-4">
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            name="topic"
            type="text"
            defaultValue="Technology"
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            defaultValue="10"
            min="1"
            required
          />
        </div>

        <div>
          <Label htmlFor="speakers">Number of Speakers</Label>
          <Input
            id="speakers"
            name="speakers"
            type="number"
            defaultValue="2"
            min="1"
            required
          />
        </div>

        <div>
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
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loadingScript || loadingAudio}
        >
          {loadingScript || loadingAudio ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Generating...
            </>
          ) : (
            "Generate Podcast"
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          ⚠️ Error: {error}
        </div>
      )}

      {script && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-lg">📜 Generated Script:</h3>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{script}</p>
        </div>
      )}

      {audioUrl && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold text-lg">🎧 Listen to Your Podcast:</h3>
          <audio controls className="w-full mt-2">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </Card>
  );
}