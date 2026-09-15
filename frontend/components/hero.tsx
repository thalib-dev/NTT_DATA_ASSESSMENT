"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const { scrollYProgress } = useScroll()
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <section className="relative min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col justify-center overflow-hidden pt-20">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="flex justify-center mb-4"
        >
        </motion.div>

        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="font-serif text-[12vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter text-zinc-900 text-center mix-blend-normal"
        >
          Machine Data
          <br />
          Manager
        </motion.h1>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
          className="font-mono text-lg md:text-xl text-zinc-600 text-center max-w-2xl mx-auto mt-8"
        >
          A full-stack predictive maintenance platform with ML-powered risk analysis for industrial machine fleets.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "circOut" }}
          className="flex justify-center mt-8"
        >
          <Link
            href="/services"
            className="px-8 py-3.5 bg-zinc-900 text-white rounded-full font-mono text-sm font-semibold uppercase hover:bg-zinc-800 transition-all shadow-md hover:scale-105 flex items-center gap-2"
          >
            <span>Assess Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-end mt-12 border-t border-zinc-200 pt-4">
          <div className="font-mono text-sm md:text-base font-medium text-zinc-500 uppercase">
            NTT Data Assessment
          </div>

          <motion.div
            style={{ rotate }}
            className="hidden md:flex items-center justify-center w-32 h-32 bg-zinc-900 rounded-full relative shadow-md"
          >
            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
              <svg viewBox="0 0 100 100" width="100" height="100" className="w-full h-full fill-white">
                <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                <text className="text-[12px] font-mono font-bold uppercase tracking-widest">
                  <textPath href="#curve">Scroll Down • Scroll Down •</textPath>
                </text>
              </svg>
            </div>
            <ArrowDown className="text-white w-8 h-8" />
          </motion.div>

          <div className="font-mono text-sm md:text-base font-medium text-zinc-500 uppercase text-right">
            Node.js • Python • SQLite <br />
            Random Forest ML
          </div>
        </div>
      </div>
    </section>
  )
}
