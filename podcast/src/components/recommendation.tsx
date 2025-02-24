import React from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Props {
  topics?: string[]
}

const Recommendations: React.FC<Props> = ({ topics = [] }) => {
  const cleanedTopics = topics.map(topic => topic.replace(/\*\*/g, "").replace(/\*/g, ""))

  if (!cleanedTopics.length) {
    return null
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recommended Topics</h2>
        <ScrollArea className="h-[200px]">
          <ul className="space-y-2">
            {cleanedTopics.map((topic, index) => (
              <li
                key={index}
                className="p-3 bg-gray-700 rounded-lg transition-colors hover:bg-gray-600"
              >
                {topic}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </Card>
  )
}

export default Recommendations