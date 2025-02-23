"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Speaker {
  name: string;
  voice: string;
  pitch: number;
  loudness: number;
  tone: string;
}

export default function PodcastApp() {
  const [topic, setTopic] = useState<string>("");
  const [duration, setDuration] = useState<string>("5");
  const [numSpeakers, setNumSpeakers] = useState<number>(1);
  const [speakers, setSpeakers] = useState<Record<string, Speaker>>({});
  const [script, setScript] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Fetch available voices when component mounts
    const fetchVoices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/get-voices");
        const data = await res.json();
        setAvailableVoices(data.voices);
      } catch (error) {
        console.error("Failed to fetch voices:", error);
        setError("Failed to load available voices");
      }
    };

    fetchVoices();
  }, []);

  // Initialize or update speaker when numSpeakers changes
  useEffect(() => {
    setSpeakers(prev => {
      const newSpeakers: Record<string, Speaker> = {};
      for (let i = 1; i <= numSpeakers; i++) {
        const speakerKey = `Speaker ${i}`;
        newSpeakers[speakerKey] = prev[speakerKey] || {
          name: speakerKey,
          voice: availableVoices[0] || "Bella",
          pitch: 1.0,
          loudness: 1.0,
          tone: "Neutral"
        };
      }
      return newSpeakers;
    });
  }, [numSpeakers, availableVoices]);

  const handleSpeakerChange = (index: number, field: keyof Speaker, value: string | number) => {
    const speakerKey = `Speaker ${index + 1}`;
    setSpeakers(prev => ({
      ...prev,
      [speakerKey]: { ...prev[speakerKey], [field]: value }
    }));
  };

  const fetchScript = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5000/generate_script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          duration,
          speakers: Object.keys(speakers),
          mood: "Engaging",
          location: "Studio"
        }),
      });
    
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScript(data.script);
    } catch (error) {
      setError("Failed to generate script. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudio = async () => {
    if (!script) {
      setError("No script available for audio generation.");
      return;
    }
  
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, speakers }),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
  
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      setError("Failed to generate audio. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        🎙️ Podcast Generator
      </h1>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4">
        <Input 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          placeholder="Enter Podcast Topic" 
          className="p-2 border rounded-md"
        />
        
        <div className="flex gap-4">
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-32">
              {duration} minutes
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={numSpeakers.toString()} onValueChange={(value) => setNumSpeakers(Number(value))}>
            <SelectTrigger className="w-32">
              {numSpeakers} Speaker{numSpeakers > 1 ? "s" : ""}
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} Speaker{n > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: numSpeakers }).map((_, i) => (
          <Card key={i} className="p-4 shadow-lg rounded-lg">
            <CardContent className="space-y-2">
              <h2 className="text-lg font-semibold">🎤 Speaker {i + 1}</h2>
              <Input 
                value={speakers[`Speaker ${i + 1}`]?.name || ""}
                onChange={(e) => handleSpeakerChange(i, "name", e.target.value)}
                placeholder="Speaker Name"
                className="p-2 border rounded-md"
              />
              
              <Select 
                value={speakers[`Speaker ${i + 1}`]?.voice || availableVoices[0]}
                onValueChange={(value) => handleSpeakerChange(i, "voice", value)}
              >
                <SelectTrigger className="w-full">
                  {speakers[`Speaker ${i + 1}`]?.voice || "Select Voice"}
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input 
                type="number"
                value={speakers[`Speaker ${i + 1}`]?.pitch || 1.0}
                onChange={(e) => handleSpeakerChange(i, "pitch", Number(e.target.value))}
                placeholder="Pitch (1.0 default)"
                step="0.1"
                min="0.5"
                max="2.0"
                className="p-2 border rounded-md"
              />
              
              <Input 
                type="number"
                value={speakers[`Speaker ${i + 1}`]?.loudness || 1.0}
                onChange={(e) => handleSpeakerChange(i, "loudness", Number(e.target.value))}
                placeholder="Loudness (1.0 default)"
                step="0.1"
                min="0.5"
                max="2.0"
                className="p-2 border rounded-md"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={fetchScript} 
          disabled={isLoading || !topic}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          {isLoading ? "Generating..." : "Generate Script"}
        </Button>
        
        {script && (
          <Button 
            onClick={fetchAudio} 
            disabled={isLoading || !script}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            {isLoading ? "Generating..." : "Generate Podcast"}
          </Button>
        )}
      </div>

      {script && (
        <Card className="mt-4 p-4 shadow-lg">
          <CardContent>
            <p className="whitespace-pre-wrap">{script}</p>
          </CardContent>
        </Card>
      )}

      {audioUrl && (
        <div className="mt-4 flex justify-center">
          <audio 
            src={audioUrl} 
            controls 
            className="w-full max-w-lg" 
            onError={() => setError("Failed to load audio")}
          />
        </div>
      )}
    </div>
  );
}