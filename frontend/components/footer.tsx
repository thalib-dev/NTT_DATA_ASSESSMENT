"use client"

import Link from "next/link"

interface FooterProps {
  heading?: string
  subtext?: string
  buttonText?: string
  buttonHref?: string
  isExternal?: boolean
}

export function Footer({
  heading = "Built by Thalib",
  subtext,
  buttonText = "github.com/thalib-dev",
  buttonHref = "https://github.com/thalib-dev",
  isExternal,
}: FooterProps) {
  const socialLinks = [
    { name: "Github", url: "https://github.com/thalib-dev" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/mt-thalib/" },
  ]

  const isExt = isExternal !== undefined ? isExternal : buttonHref.startsWith("http")

  return (
    <footer className="bg-zinc-100 border-t border-zinc-200/80 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-[8vw] md:text-[6vw] leading-none font-black uppercase mb-6 text-zinc-900">
            {heading}
          </h2>
          {subtext && (
            <p className="font-mono text-sm md:text-base text-zinc-600 max-w-2xl mb-8 leading-relaxed">
              {subtext}
            </p>
          )}

          {isExt ? (
            <a
              href={buttonHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-4 bg-zinc-900 text-white rounded-full font-mono text-xl uppercase hover:bg-zinc-800 hover:scale-105 transition-all shadow-md"
            >
              {buttonText}
            </a>
          ) : (
            <Link
              href={buttonHref}
              className="px-12 py-4 bg-zinc-900 text-white rounded-full font-mono text-xl uppercase hover:bg-zinc-800 hover:scale-105 transition-all shadow-md"
            >
              {buttonText}
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mt-20 border-t border-zinc-200 pt-8 gap-4">
          <div className="font-mono font-medium uppercase text-sm text-zinc-600">© 2026 Thalib</div>
          <div className="flex gap-8">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-medium uppercase text-sm hover:underline decoration-2 text-zinc-600 hover:text-zinc-900"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
