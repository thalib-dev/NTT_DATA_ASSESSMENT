import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const stats = [
  { value: "5+", label: "Projects Completed" },
  { value: "10+", label: "Technologies Mastered" },
  { value: "8+", label: "Months Experience" },
  { value: "5+", label: "Enterprise Deployments" },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-4 md:px-8">
        <h1 className="font-serif text-[12vw] md:text-[8vw] leading-[0.85] uppercase tracking-tighter">
          About
          <br />
          <span className="text-zinc-500 font-normal">Me</span>
        </h1>
      </section>

      <section className="px-4 md:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="font-serif text-2xl md:text-4xl leading-tight">
              I&apos;m Thalib, a Junior Software Engineer passionate about building reliable applications, automating workflows, and learning modern cloud technologies.
            </p>
          </div>
          <div className="space-y-6">
            <p className="font-mono text-muted-foreground">
              Over the past 8+ months, I have worked on setting up deployment pipelines with GitHub Actions and Docker, automating data processing workflows using n8n and Google Cloud, and developing full-stack Node.js and Python applications.
            </p>
            <p className="font-mono text-muted-foreground">
              I focus on writing clean code, building practical tools, and integrating ML microservices — continuously working to expand my skills and contribute to team goals.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-zinc-200 p-6 md:p-8 bg-white shadow-2xs rounded-lg">
              <span className="font-serif text-4xl md:text-6xl text-zinc-900">{stat.value}</span>
              <p className="font-mono text-xs uppercase mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-8 pb-24">
        <div className="bg-zinc-100 border border-zinc-200 text-zinc-900 p-8 md:p-16 rounded-xl">
          <h2 className="font-serif text-4xl md:text-6xl uppercase tracking-tight">Skills & Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            {[
              {
                title: "Languages",
                description: "Python | Bash/Shell Scripting | JavaScript | HTML5 | CSS3 | SQL",
              },
              {
                title: "Backend & DB",
                description: "Node.js | Python | PostgreSQL | MongoDB | Supabase | Firebase | SQLite",
              },
              {
                title: "Cloud & DevOps",
                description: "AWS | Google Cloud | Docker | GitHub Actions CI/CD | n8n | ServiceNow",
              },
              {
                title: "AI & Workflows",
                description: "Ollama LLMs | RESTful APIs | Automated Data Workflows",
              },
            ].map((value) => (
              <div key={value.title}>
                <h3 className="font-serif text-2xl text-zinc-900 font-bold uppercase">{value.title}</h3>
                <p className="font-mono text-sm mt-4 text-zinc-700 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer
        heading="Thank You"
        subtext="Passionate about full-stack development, cloud automation, and continuous learning. Eager to contribute effectively and grow alongside a collaborative engineering team."
      />
    </main>
  )
}
