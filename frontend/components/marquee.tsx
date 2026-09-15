"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MarqueeProps {
  text: string
  direction?: number
  duration?: number
  className?: string
  textClassName?: string
}

export function Marquee({ text, direction = 1, duration = 140, className, textClassName }: MarqueeProps) {
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap py-3", className)}>
      <motion.div
        className="flex gap-16 items-center"
        animate={{ x: direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, ease: "linear", duration: duration }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className={cn("font-serif font-black uppercase tracking-wider text-3xl md:text-4xl", textClassName)}>
            {text} •
          </span>
        ))}
      </motion.div>
    </div>
  )
}
