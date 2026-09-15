"use client"

import { Menu, Github, Linkedin } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Project", href: "/services" },
  { label: "About", href: "/about" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-8">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-serif text-2xl font-bold uppercase tracking-tighter text-zinc-900">
          MDM
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-2 bg-white/90 p-1.5 rounded-full backdrop-blur-md border border-zinc-200/80 shadow-xs">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-6 py-2 rounded-full font-mono text-sm transition-colors uppercase ${
              pathname === item.href
                ? "bg-zinc-900 text-white font-medium"
                : "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="md:hidden p-2 bg-zinc-900 text-white rounded-full">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex gap-2">
          <a
            href="https://github.com/thalib-dev"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="p-3 bg-white text-zinc-800 rounded-full hover:bg-zinc-900 hover:text-white transition-colors border border-zinc-200 shadow-2xs"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/mt-thalib/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="p-3 bg-white text-zinc-800 rounded-full hover:bg-zinc-900 hover:text-white transition-colors border border-zinc-200 shadow-2xs"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </nav>
  )
}
