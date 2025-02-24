import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
  }

  try {
    const { location, emotion } = await req.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Suggest interesting topics for someone in ${location} feeling ${emotion}.` }] }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    // Ensure valid text extraction
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestions found.";

    // Convert the raw text into an array safely
    const topics: string[] = rawText
      .split("\n")
      .map((topic) => topic.trim()) // Remove extra spaces
      .filter((topic) => topic.length > 0); // Remove empty strings

    return NextResponse.json({ topics }, { status: 200 });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}