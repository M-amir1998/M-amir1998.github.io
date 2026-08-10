/* ═══════════════════════════════════════════════════════════════
   EDIT ME — all site content lives here.
   Anything marked [PLACEHOLDER] is waiting for your real data.
   ═══════════════════════════════════════════════════════════════ */

const SITE_DATA = {

  /* Roles cycled by the typing animation in the hero */
  roles: [
    "Robotics Engineer",
    "AI Engineer",
    "PhD Researcher",
    "LLMOps Engineer",
    "MLOps Engineer",
  ],

  /* Tech stack — grouped chips */
  stack: [
    {
      group: "Languages",
      items: ["Python", "C++", "SQL", "Bash / Linux"],
    },
    {
      group: "ML / Deep Learning",
      items: ["PyTorch", "NumPy", "Pandas", "Scikit-learn", "Hugging Face"],
    },
    {
      group: "LLM Engineering",
      items: ["RAG", "Agentic Workflows", "Prompt Engineering", "Neurosymbolic AI", "Chain-of-Reasoning"],
    },
    {
      group: "MLOps / Systems",
      items: ["Docker", "GitHub Actions", "MLflow", "FastAPI", "Experiment Tracking"],
    },
  ],

  /* Research & projects — first one with featured:true spans full width */
  projects: [
    {
      featured: true,
      badge: "PhD Research",
      title: "LLM-Based Ghost Object Mitigation for Cooperative Perception",
      description:
        "My doctoral research: using large-language-model reasoning to detect and mitigate ghost objects " +
        "in V2X collective perception, so connected automated vehicles can trust what other road users " +
        "tell them they see. Combines multisensor fusion, cooperative perception pipelines and " +
        "structured LLM reasoning over dynamic driving scenes.",
      tags: ["V2X", "Cooperative Perception", "LLM Reasoning", "PyTorch", "Sensor Fusion"],
      media: "images/fusion-diagram.svg",
      mediaAlt: "Animated multisensor data fusion pipeline: camera, radar, LiDAR and V2X fused into a world model, with a ghost object rejected by LLM reasoning",
      repo: null,   // private for now — set a URL when public
      demo: null,
    },
    {
      badge: "Side project",
      title: "Coffee Tracker App",
      description:
        "[PLACEHOLDER — one-line description] A personal application for tracking coffee consumption. " +
        "Replace this text with what it does and what you built it with.",
      tags: ["Python", "App"],
      repo: "https://github.com/M-amir1998/coffee_tracker_app",
      demo: null,
    },
    {
      badge: "Coming soon",
      title: "[PLACEHOLDER] Your Next Project",
      description:
        "Add your next project here — an agentic RAG system, a perception benchmark, an MLOps template… " +
        "Edit js/data.js to add, remove or reorder cards.",
      tags: ["Your", "Tags", "Here"],
      repo: null,
      demo: null,
    },
  ],

  /* Journey timeline — newest first */
  timeline: [
    {
      date: "2024 — Present",
      title: "PhD, Industrial and Telecommunication Engineering",
      where: "Universidad Miguel Hernández de Elche · UWICORE Laboratory, Spain",
      text:
        "Researching connected automated vehicles: cooperative perception, multisensor fusion and " +
        "LLM-based reasoning for safer autonomous mobility.",
    },
    {
      date: "20XX — 20XX",
      title: "MSc, Telecommunication Engineering",
      where: "[PLACEHOLDER — university name]",
      text: "[PLACEHOLDER — thesis topic, specialization, honors…]",
    },
    {
      date: "20XX — 20XX",
      title: "BSc, Electronics Engineering",
      where: "[PLACEHOLDER — university name]",
      text: "[PLACEHOLDER — focus areas, final project…]",
    },
  ],

  /* Publications — newest first. Set link fields to null to grey them out. */
  publications: [
    {
      year: "2026",
      title: "[PLACEHOLDER] Title of your most recent paper",
      authors: "A. Mohammadisarab, Co-Author, Co-Author",
      venue: "[PLACEHOLDER — journal / conference name]",
      pdf: null,
      doi: null,
      code: null,
    },
    {
      year: "2025",
      title: "[PLACEHOLDER] Title of another publication",
      authors: "A. Mohammadisarab, Co-Author",
      venue: "[PLACEHOLDER — journal / conference name]",
      pdf: null,
      doi: null,
      code: null,
    },
  ],
};
