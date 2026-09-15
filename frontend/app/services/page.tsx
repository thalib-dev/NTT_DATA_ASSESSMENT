"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MachinesTab } from "@/components/machines-tab"
import { FieldsTab } from "@/components/fields-tab"
import { PredictTab } from "@/components/predict-tab"
import { Cpu, Server, SlidersHorizontal } from "lucide-react"

export default function ProjectPage() {
  const [activeTab, setActiveTab] = useState<"machines" | "fields" | "predict">("machines")

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <h1 className="font-serif text-[10vw] md:text-[6vw] leading-[0.85] uppercase tracking-tighter text-zinc-900">
          Machine Data
          <br />
          <span className="text-zinc-500">Control Panel</span>
        </h1>
        <p className="font-mono text-zinc-600 mt-6 max-w-2xl text-sm md:text-base">
          Interactive full-stack predictive maintenance console. Manage machine fleets, configure dynamic schemas, and run Random Forest ML risk predictions.
        </p>

        {/* Tab Selector Buttons */}
        <div className="mt-12 flex flex-wrap gap-3 border-b border-zinc-200 pb-4">
          <button
            onClick={() => setActiveTab("machines")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-sm uppercase transition-all font-semibold ${
              activeTab === "machines"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Server size={18} />
            Machines Fleet
          </button>

          <button
            onClick={() => setActiveTab("fields")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-sm uppercase transition-all font-semibold ${
              activeTab === "fields"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <SlidersHorizontal size={18} />
            Schema Fields
          </button>

          <button
            onClick={() => setActiveTab("predict")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-sm uppercase transition-all font-semibold ${
              activeTab === "predict"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Cpu size={18} />
            ML Risk Predictor
          </button>
        </div>
      </section>

      {/* Tab Content Section */}
      <section className="px-4 md:px-8 pb-32 max-w-7xl mx-auto">
        {activeTab === "machines" && <MachinesTab />}
        {activeTab === "fields" && <FieldsTab />}
        {activeTab === "predict" && <PredictTab />}
      </section>

      <Footer />
    </main>
  )
}
