"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { ServiceCard } from "./service-card"

const features = [
  {
    number: "4",
    title: "Fleet Manager",
    tags: ["CRUD", "REST API", "SQLite"],
    description:
      "Full CRUD dashboard for managing industrial machines. Add, edit, and remove machines with real-time status tracking and field configuration.",
    detail: "Endpoints: GET/POST /api/machines, PUT/DELETE /api/machines/:id",
  },
  {
    number: "3",
    title: "ML Prediction",
    tags: ["Random Forest", "Python", "Flask"],
    description:
      "Random Forest classifier trained on machine sensor data to predict failure risk levels with confidence scores and probability breakdowns.",
    detail: "Scikit-Learn pipeline, Flask REST API on port 5000, 4-feature classification",
  },
  {
    number: "2",
    title: "Schema Config",
    tags: ["Dynamic Fields", "Validation"],
    description:
      "Dynamic field configuration system allowing users to define custom machine attributes with validation rules.",
    detail: "Field types: Text, Number, Dropdown options with display order tracking",
  },
  {
    number: "1",
    title: "Risk Analysis",
    tags: ["Scoring", "Feature Importance", "Charts"],
    description:
      "Interactive prediction interface where users select a machine and run real-time risk analysis.",
    detail: "Outputs: Risk Level (Low/Medium/High), Confidence %, Probability distribution per class",
  },
]

export function Services() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="bg-[#FAFAFA] min-h-screen py-32 relative border-t border-zinc-200/80">
      <div className="container mx-auto px-4 mb-20 flex items-end justify-between">
        <div>
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-2 font-semibold">
            Click any layer to expand details
          </span>
          <h2 className="font-serif text-[12vw] leading-none text-zinc-900 uppercase font-black">
            Features
          </h2>
        </div>
        <Star className="w-24 h-24 text-zinc-900 animate-pulse hidden md:block" fill="currentColor" />
      </div>

      <div className="flex flex-col border-b border-zinc-200">
        {features.map((item, i) => (
          <ServiceCard
            key={i}
            number={item.number}
            title={item.title}
            tags={item.tags}
            description={item.description}
            detail={item.detail}
            isExpanded={expandedIndex === i}
            onToggle={() => toggleExpand(i)}
          />
        ))}
      </div>
    </section>
  )
}
