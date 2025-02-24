import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  topics?: string[];
}

const Recommendations: React.FC<Props> = ({ topics = [] }) => {
  // Remove ** or * from topic titles
  const cleanedTopics = topics.map(topic => topic.replace(/\*\*/g, "").replace(/\*/g, ""));

  if (!cleanedTopics.length) {
    return <p className="text-gray-500 text-center">No recommendations found.</p>;
  }

  return (
    <Card className="p-4 w-full max-w-md mx-auto shadow-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-center mb-2">Recommended Topics</h2>
      <ScrollArea className="max-h-60 overflow-y-auto">
        <ul className="space-y-2">
          {cleanedTopics.map((topic, index) => (
            <li
              key={index}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all shadow-sm"
            >
              {topic}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
};

export default Recommendations;