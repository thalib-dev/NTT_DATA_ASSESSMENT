"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface ServiceCardProps {
  number: string
  title: string
  tags: string[]
  description: string
  detail?: string
  isExpanded: boolean
  onToggle: () => void
}

export function ServiceCard({
  number,
  title,
  tags,
  description,
  detail,
  isExpanded,
  onToggle,
}: ServiceCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`group border-t border-zinc-200 transition-all duration-300 cursor-pointer ${
        isExpanded ? "py-10 md:py-12 bg-zinc-100/90" : "py-6 md:py-8 hover:bg-zinc-100/60"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-start gap-4 md:gap-8">
          <span className="font-mono text-sm md:text-lg font-bold text-zinc-500 opacity-70 mt-2">
            L{number}
          </span>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-zinc-900 group-hover:translate-x-2 transition-transform duration-300">
                {title}
              </h3>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="p-2.5 text-zinc-900 border border-zinc-200 rounded-full bg-white shadow-2xs shrink-0"
              >
                <ChevronDown className="w-6 h-6 md:w-7 md:h-7" />
              </motion.div>
            </div>

            <div className="flex gap-2.5 flex-wrap mt-3.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 border border-zinc-200 rounded-full text-zinc-700 bg-white font-mono text-xs uppercase shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Dropdown Explanation Section */}
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? "auto" : 0,
                opacity: isExpanded ? 1 : 0,
                marginTop: isExpanded ? 20 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-zinc-200/80 space-y-3">
                <p className="font-mono text-sm md:text-base text-zinc-700 leading-relaxed max-w-3xl">
                  {description}
                </p>
                {detail && (
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-xl inline-block shadow-2xs">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                      Technical Spec & Architecture:
                    </span>
                    <span className="font-mono text-xs text-zinc-900 uppercase font-medium">
                      {detail}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
