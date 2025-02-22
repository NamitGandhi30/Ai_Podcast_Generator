"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Loader2 } from "lucide-react";

export default function PodcastForm() {
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const generatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingScript(true);
    setScript("");
    setAudioUrl("");

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

      const scriptData = await scriptResponse.json();
      setScript(scriptData.script);

      // Step 2: Generate Audio
      setLoadingAudio(true);
      const audioResponse = await fetch("http://localhost:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: scriptData.script, voice: "Bella" }),
      });

      const audioData = await audioResponse.json();
      if (audioData.audio_url) {
        setAudioUrl(audioData.audio_url);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingScript(false);
      setLoadingAudio(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold text-center mb-4">🎙️ Generate Your Podcast</h2>

      <form onSubmit={generatePodcast} className="space-y-4">
        <div>
          <Label htmlFor="topic" className="text-gray-700">Topic</Label>
          <Input id="topic" name="topic" type="text" defaultValue="Technology" className="w-full mt-1" required />
        </div>

        <div>
          <Label htmlFor="duration" className="text-gray-700">Duration (minutes)</Label>
          <Input id="duration" name="duration" type="number" defaultValue="10" min="1" className="w-full mt-1" required />
        </div>

        <div>
          <Label htmlFor="speakers" className="text-gray-700">Number of Speakers</Label>
          <Input id="speakers" name="speakers" type="number" defaultValue="2" min="1" className="w-full mt-1" required />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loadingScript}>
          {loadingScript ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : "Generate Podcast"}
        </Button>
      </form>

      {script && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-lg">📜 Generated Script:</h3>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{script}</p>
        </div>
      )}

      {loadingAudio && (
        <div className="mt-4 text-center text-blue-500">🎤 Generating audio...</div>
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
