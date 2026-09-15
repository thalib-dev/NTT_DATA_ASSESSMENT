import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MarqueeSection } from "@/components/marquee-section"
import { Services } from "@/components/services"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar />
      <Hero />
      <MarqueeSection />
      <Services />
      <Footer />
    </div>
  )
}
