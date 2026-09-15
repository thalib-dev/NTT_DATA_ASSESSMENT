"use client"

import { Marquee } from "./marquee"

export function MarqueeSection() {
  return (
    <section className="bg-zinc-100 text-zinc-900 border-y border-zinc-200/80 py-20 overflow-hidden -skew-y-2 origin-left">
      <Marquee text="NODE.JS • PYTHON • MACHINE LEARNING •" direction={1} className="opacity-90 text-zinc-900" />
      <Marquee text="FLASK • SQLITE • RANDOM FOREST •" direction={-1} className="text-zinc-500 opacity-80" />
    </section>
  )
}
