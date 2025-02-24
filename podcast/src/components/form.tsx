"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface FormProps {
  onSubmit: (data: { genre: string; mood: string; duration: string }) => void
}

export default function Form({ onSubmit }: FormProps) {
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [duration, setDuration] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ genre, mood, duration })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Enter podcast genre" />
      <Select value={mood} onValueChange={setMood}>
        <SelectTrigger>
          <SelectValue placeholder="Select mood" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="happy">Happy</SelectItem>
          <SelectItem value="serious">Serious</SelectItem>
          <SelectItem value="informative">Informative</SelectItem>
        </SelectContent>
      </Select>
      <Select value={duration} onValueChange={setDuration}>
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="short">Short (15-30 min)</SelectItem>
          <SelectItem value="medium">Medium (30-60 min)</SelectItem>
          <SelectItem value="long">Long (60+ min)</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full">
        Get Recommendations
      </Button>
    </form>
  )
}

