import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";

// ── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    type Particle = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
    };
    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.7 + 0.2,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,200,230,${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function SkillBar({ label, pct }: { label: string; pct: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(pct);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct]);

  return (
    <div ref={barRef} className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-primary">{pct}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{ width: `${width}%`, background: "oklch(0.76 0.13 205)" }}
        />
      </div>
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["home", "about", "skills", "projects", "contact"] as const;

function Navbar({ active }: { active: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "oklch(0.12 0.018 240 / 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(0.22 0.03 225)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollTo("home")}
          className="text-xl font-extrabold tracking-tight"
        >
          <span style={{ color: "oklch(0.76 0.13 205)" }}>ALEX</span>
          <span className="text-foreground"> R.</span>
        </button>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link}
              onClick={() => scrollTo(link)}
              data-ocid={`nav.${link}.link`}
              className={`nav-link text-sm font-semibold uppercase tracking-widest ${
                active === link
                  ? "active text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Resume Button */}
        <a
          href="/"
          data-ocid="nav.resume.button"
          className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold tracking-wide"
          style={{
            border: "1px solid oklch(0.76 0.13 205)",
            color: "oklch(0.76 0.13 205)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background =
              "oklch(0.76 0.13 205 / 0.12)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 0 20px oklch(0.76 0.13 205 / 0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background =
              "transparent";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          }}
        >
          Resume
        </a>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden text-foreground p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          data-ocid="nav.menu.toggle"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 bg-foreground transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground transition-all ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 space-y-3"
          style={{ borderTop: "1px solid oklch(0.22 0.03 225)" }}
        >
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link}
              onClick={() => scrollTo(link)}
              className="block w-full text-left py-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <ParticleCanvas />
      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "oklch(0.76 0.13 205 / 0.06)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "oklch(0.84 0.18 125 / 0.06)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-slide-up">
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.3em] mb-4">
          Welcome to my portfolio
        </p>
        <h1 className="hero-heading mb-4">
          <span className="text-foreground">Hello, I'm</span>
          <br />
          <span style={{ color: "oklch(0.76 0.13 205)" }}>Alex Rodriguez</span>
          <br />
          <span style={{ color: "oklch(0.84 0.18 125)" }}>
            Full Stack Developer
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          I craft beautiful, performant web experiences with modern
          technologies. Passionate about clean code, elegant design, and solving
          complex problems.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            type="button"
            onClick={() => scrollTo("projects")}
            data-ocid="hero.view_projects.button"
            className="px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200"
            style={{
              background: "oklch(0.76 0.13 205)",
              color: "oklch(0.12 0.018 240)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 30px oklch(0.76 0.13 205 / 0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            View Projects
          </button>
          <button
            type="button"
            onClick={() => scrollTo("contact")}
            data-ocid="hero.contact.button"
            className="px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200"
            style={{
              border: "1px solid oklch(0.76 0.13 205)",
              color: "oklch(0.76 0.13 205)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.76 0.13 205 / 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            Let's Talk
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            Scroll
          </span>
          <div
            className="w-px h-10"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.76 0.13 205), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              Who I Am
            </p>
            <h2 className="section-heading text-foreground mb-6">About Me</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              I'm a passionate Full Stack Developer with over 5 years of
              experience building scalable web applications. I specialize in
              React, Node.js, and cloud infrastructure — turning complex
              requirements into elegant, user-centric solutions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              When I'm not coding, you'll find me contributing to open-source
              projects, exploring new frameworks, or sharing knowledge through
              technical writing. I believe great software is as much about
              empathy as it is about engineering.
            </p>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "5+", label: "Years Exp." },
                { value: "40+", label: "Projects" },
                { value: "20+", label: "Happy Clients" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl card-hover"
                  style={{
                    background: "oklch(0.155 0.024 228)",
                    border: "1px solid oklch(0.22 0.03 225)",
                  }}
                >
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "oklch(0.76 0.13 205)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="w-72 h-72 rounded-full animate-glow-pulse"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.76 0.13 205 / 0.2), oklch(0.84 0.18 125 / 0.2))",
                  border: "2px solid oklch(0.76 0.13 205 / 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Initials avatar */}
                <div
                  className="w-60 h-60 rounded-full flex items-center justify-center text-6xl font-extrabold select-none"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.76 0.13 205 / 0.3), oklch(0.84 0.18 125 / 0.3))",
                    color: "oklch(0.76 0.13 205)",
                  }}
                >
                  AR
                </div>
              </div>
              {/* Decorative rings */}
              <div
                className="absolute -inset-4 rounded-full opacity-20"
                style={{ border: "1px dashed oklch(0.76 0.13 205)" }}
              />
              <div
                className="absolute -inset-8 rounded-full opacity-10"
                style={{ border: "1px dashed oklch(0.84 0.18 125)" }}
              />
              {/* Floating badge */}
              <div
                className="absolute -bottom-2 -right-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "oklch(0.76 0.13 205)",
                  color: "oklch(0.12 0.018 240)",
                }}
              >
                Open to Work
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────────
const SKILL_CARDS = [
  {
    title: "Frontend",
    icon: "🎨",
    skills: [
      { label: "HTML5 / CSS3", pct: 95 },
      { label: "React", pct: 88 },
      { label: "TypeScript", pct: 82 },
      { label: "Tailwind CSS", pct: 90 },
    ],
  },
  {
    title: "Backend",
    icon: "⚙️",
    skills: [
      { label: "Node.js", pct: 85 },
      { label: "Python", pct: 78 },
      { label: "GraphQL", pct: 72 },
      { label: "PostgreSQL", pct: 80 },
    ],
  },
  {
    title: "Tools & Cloud",
    icon: "🛠️",
    skills: [
      { label: "Git & CI/CD", pct: 90 },
      { label: "Docker", pct: 70 },
      { label: "AWS / GCP", pct: 68 },
      { label: "Figma", pct: 80 },
    ],
  },
];

function SkillsSection() {
  return (
    <section id="skills" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-[0.3em] mb-3">
            What I Know
          </p>
          <h2 className="section-heading text-foreground">Skills</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {SKILL_CARDS.map((card, i) => (
            <div
              key={card.title}
              className="p-8 rounded-2xl card-hover"
              style={{
                background: "oklch(0.155 0.024 228)",
                border: "1px solid oklch(0.22 0.03 225)",
              }}
              data-ocid={`skills.card.${i + 1}`}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider">
                {card.title}
              </h3>
              {card.skills.map((s) => (
                <SkillBar key={s.label} label={s.label} pct={s.pct} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    title: "NexaCommerce",
    description:
      "A blazing-fast e-commerce platform with real-time inventory, AI-powered recommendations, and seamless checkout flows.",
    gradient: "linear-gradient(135deg, #0f4c75 0%, #1b262c 50%, #00b4d8 100%)",
    accent: "oklch(0.76 0.13 205)",
    accentBg: "oklch(0.76 0.13 205 / 0.1)",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
  },
  {
    title: "DevFlow Dashboard",
    description:
      "Engineering analytics platform giving teams deep insight into deployment pipelines, code quality metrics, and incident tracking.",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #533483 100%)",
    accent: "oklch(0.65 0.18 280)",
    accentBg: "oklch(0.65 0.18 280 / 0.1)",
    tech: ["TypeScript", "GraphQL", "Docker", "AWS"],
  },
  {
    title: "GreenTrack",
    description:
      "Carbon footprint tracker that visualizes environmental impact through interactive data charts and personalized action plans.",
    gradient: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #74c69d 100%)",
    accent: "oklch(0.84 0.18 125)",
    accentBg: "oklch(0.84 0.18 125 / 0.1)",
    tech: ["React", "Python", "D3.js", "TailwindCSS"],
  },
];

function ProjectsSection() {
  return (
    <section id="projects" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-[0.3em] mb-3">
            What I've Built
          </p>
          <h2 className="section-heading text-foreground">Projects Gallery</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PROJECTS.map((proj, i) => (
            <div
              key={proj.title}
              className="rounded-2xl overflow-hidden card-hover"
              style={{
                background: "oklch(0.155 0.024 228)",
                border: "1px solid oklch(0.22 0.03 225)",
              }}
              data-ocid={`projects.card.${i + 1}`}
            >
              {/* Thumbnail */}
              <div
                className="h-44 w-full flex items-end p-4"
                style={{ background: proj.gradient }}
              >
                <span className="text-white text-xs font-bold uppercase tracking-widest opacity-60">
                  Featured Project
                </span>
              </div>
              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {proj.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {proj.description}
                </p>
                {/* Tech chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {proj.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: "oklch(0.22 0.03 225)",
                        color: "oklch(0.94 0.01 220)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200"
                  style={{
                    border: `1px solid ${proj.accent}`,
                    color: proj.accent,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      proj.accentBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                  data-ocid={`projects.view_live.button.${i + 1}`}
                >
                  View Live
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function ContactSection() {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    try {
      await actor.addMessage(message, name, email);
      toast.success("Message sent! I'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-[0.3em] mb-3">
            Let's Connect
          </p>
          <h2 className="section-heading text-foreground">Get In Touch</h2>
          <p className="text-muted-foreground mt-4">
            Have a project in mind? I'd love to hear from you.
          </p>
        </div>
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{
            background: "oklch(0.155 0.024 228)",
            border: "1px solid oklch(0.22 0.03 225)",
          }}
          data-ocid="contact.form.panel"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label
                  className="block text-sm font-semibold text-foreground mb-2"
                  htmlFor="contact-name"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rodriguez"
                  data-ocid="contact.name.input"
                  className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-[oklch(0.45_0.02_225)] outline-none transition-all"
                  style={{
                    background: "oklch(0.12 0.018 240)",
                    border: "1px solid oklch(0.22 0.03 225)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.76 0.13 205)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px oklch(0.76 0.13 205 / 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.22 0.03 225)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-foreground mb-2"
                  htmlFor="contact-email"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  data-ocid="contact.email.input"
                  className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-[oklch(0.45_0.02_225)] outline-none transition-all"
                  style={{
                    background: "oklch(0.12 0.018 240)",
                    border: "1px solid oklch(0.22 0.03 225)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.76 0.13 205)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px oklch(0.76 0.13 205 / 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.22 0.03 225)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-foreground mb-2"
                htmlFor="contact-message"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project..."
                rows={5}
                data-ocid="contact.message.textarea"
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-[oklch(0.45_0.02_225)] outline-none transition-all resize-none"
                style={{
                  background: "oklch(0.12 0.018 240)",
                  border: "1px solid oklch(0.22 0.03 225)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.76 0.13 205)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px oklch(0.76 0.13 205 / 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.22 0.03 225)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              data-ocid="contact.submit.button"
              className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-200 disabled:opacity-60"
              style={{
                background: "oklch(0.76 0.13 205)",
                color: "oklch(0.12 0.018 240)",
              }}
              onMouseEnter={(e) => {
                if (!sending)
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 30px oklch(0.76 0.13 205 / 0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      className="py-16 px-6"
      style={{ borderTop: "1px solid oklch(0.22 0.03 225)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="text-2xl font-extrabold tracking-tight mb-3">
              <span style={{ color: "oklch(0.76 0.13 205)" }}>ALEX</span>
              <span className="text-foreground"> R.</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Full Stack Developer crafting digital experiences that inspire and
              perform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link)}
                    className="text-muted-foreground text-sm capitalize hover:text-primary transition-colors"
                    data-ocid={`footer.${link}.link`}
                  >
                    {link.charAt(0).toUpperCase() + link.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs mb-5">
              Social Media
            </h4>
            <div className="flex gap-4">
              {[
                {
                  label: "GitHub",
                  svg: (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  svg: (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                {
                  label: "Twitter",
                  svg: (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="/"
                  aria-label={social.label}
                  data-ocid={`footer.${social.label.toLowerCase()}.link`}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    background: "oklch(0.22 0.03 225)",
                    color: "oklch(0.67 0.02 225)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "oklch(0.76 0.13 205)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "oklch(0.12 0.018 240)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "oklch(0.22 0.03 225)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "oklch(0.67 0.02 225)";
                  }}
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground"
          style={{ borderTop: "1px solid oklch(0.22 0.03 225)" }}
        >
          <span>© {year} Alex Rodriguez. All rights reserved.</span>
          <span>
            Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Back to Top ───────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      data-ocid="page.back_to_top.button"
      aria-label="Back to top"
      className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center z-50 transition-all duration-300"
      style={{
        background: "oklch(0.76 0.13 205)",
        color: "oklch(0.12 0.018 240)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(16px)",
        boxShadow: "0 4px 20px oklch(0.76 0.13 205 / 0.4)",
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

// ── Active Section Detection ──────────────────────────────────────────────────
function useActiveSection() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = NAV_LINKS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { threshold: 0.4, rootMargin: "-10% 0px -50% 0px" },
    );

    for (const sec of sections) obs.observe(sec);
    return () => obs.disconnect();
  }, []);

  return active;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const active = useActiveSection();

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <Navbar active={active} />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
