/* ═══════════════════════════════════════════════════════════════
   EDIT ME — all site content lives here.
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
      items: ["Python (Expert)", "C++", "SQL", "Linux", "Git"],
    },
    {
      group: "ML / Deep Learning",
      items: ["PyTorch", "CNN · RNN", "Reinforcement Learning (DQN · SAC · DDPG · TD3)", "Scikit-learn", "NumPy · Pandas"],
    },
    {
      group: "LLM / GenAI",
      items: ["RAG", "Prompt Engineering", "Chain of Reasoning", "Neurosymbolic AI", "Agentic Workflows"],
    },
    {
      group: "MLOps / LLMOps",
      items: ["Docker", "GitHub Actions", "MLflow", "FastAPI", "Hugging Face", "Experiment Tracking"],
    },
  ],

  /* Research & projects — first one with featured:true spans full width */
  projects: [
    {
      featured: true,
      badge: "PhD Research",
      title: "Cooperative Perception for Connected Automated Vehicles",
      description:
        "My doctoral research at UWICORE (UMH): fusing onboard sensors with V2X data so connected " +
        "automated vehicles can perceive beyond their own field of view — and understanding when that " +
        "fusion helps, when it hurts, and how shared detections should be validated before a vehicle " +
        "acts on them. Published at IEEE VTC 2025-Spring and IEEE CSCN 2025.",
      tags: ["V2X", "Cooperative Perception", "Multisensor Fusion", "PyTorch"],
      media: "images/fusion-diagram.svg",
      mediaAlt: "Animated multisensor data fusion pipeline: camera, radar, LiDAR and V2X fused, then validated by a causal and feasibility check that rejects an infeasible object",
      mediaScene: true,   // adds the live cooperative-driving canvas next to the pipeline
      repo: null,
      demo: null,
    },
    {
      badge: "Research Project · UWICORE",
      title: "Cognitive Digital Twins for Autonomous Mobility",
      description:
        "Research assistant on \"Cognitive Digital Twins based on 5G and AI for Autonomous Mobility " +
        "and Manufacturing Systems\" (TED2021-130436B-I00), funded by MICIU/AEI and the European " +
        "Union's NextGenerationEU/PRTR programme.",
      tags: ["Digital Twins", "5G", "AI", "Autonomous Mobility"],
      repo: null,
      demo: null,
    },
    {
      badge: "Academic Project",
      title: "Deep RL for Resource Allocation in V2X Networks",
      description:
        "Application of deep reinforcement learning to resource allocation in V2X networks — " +
        "optimizing how connected vehicles share scarce radio resources (Tarbiat Modares University).",
      tags: ["Deep RL", "V2X", "Resource Allocation", "Python"],
      repo: null,
      demo: null,
    },
    {
      badge: "Side project",
      title: "Coffee Tracker App",
      description:
        "A personal side project for tracking coffee consumption — the data source behind the " +
        "\"∞ cups of coffee\" counter above.",
      tags: ["Python", "App"],
      repo: "https://github.com/M-amir1998/coffee_tracker_app",
      demo: null,
    },
  ],

  /* Journey timeline — newest first */
  timeline: [
    {
      date: "2024 — Present",
      title: "PhD, Telecommunication Engineering",
      where: "Miguel Hernández University of Elche · UWICORE Laboratory, Spain",
      text:
        "Thesis: \"Knowledge Generation for Connected and Automated Driving\", under the supervision " +
        "of Prof. Javier Gozalvez. Cooperative perception, multisensor fusion and AI for safer " +
        "autonomous mobility. Funded by a 4-year UMH PhD grant.",
    },
    {
      date: "2023 — Present",
      title: "Research Assistant",
      where: "UWICORE, Miguel Hernández University of Elche, Spain",
      text:
        "Working on \"Cognitive Digital Twins based on 5G and AI for Autonomous Mobility and " +
        "Manufacturing Systems\" (MICIU/AEI, EU NextGenerationEU/PRTR).",
    },
    {
      date: "2020 — 2023",
      title: "MSc, Telecommunication Engineering",
      where: "Tarbiat Modares University, Tehran, Iran",
      text:
        "Thesis: \"AI-based Resource Management for Critical IIoT Use Cases\" under Dr. Nader Mokari. " +
        "GPA 4/4 (18.12/20), ranked 3rd of the class. Research assistant at the Wireless " +
        "Communication Lab (2021–2023).",
    },
    {
      date: "2016 — 2020",
      title: "BSc, Electrical and Electronic Engineering",
      where: "University of Kurdistan, Sanandaj, Iran",
      text:
        "Final project: design and implementation of a fast floating-point ALU on FPGA. " +
        "GPA 3.68/4 (17.74/20), ranked 2nd of the class; Best Student of the Year award, 2018.",
    },
  ],

  /* Publications — newest first. url: link to the paper; null greys it out. */
  publications: [
    {
      year: "2025",
      title: "How the Fusion of Onboard Sensors and V2X Data can improve (or not) the Cooperative Perception of Connected Automated Vehicles",
      authors: "A. Mohammadisarab, M. Sepulcre, L. Lusvarghi, J. Gozalvez",
      venue: "IEEE VTC 2025-Spring",
      url: "https://ieeexplore.ieee.org/abstract/document/11174443/",
    },
    {
      year: "2025",
      title: "Fusion or Confusion? Potential and Challenges in Fusion of Onboard Sensors and V2X Data in Cooperative Perception",
      authors: "A. Mohammadisarab, M. Sepulcre, L. Lusvarghi, S. S. Avedisov, M. I. Khan, T. Shimizu, O. Altintas, J. Gozálvez",
      venue: "IEEE CSCN 2025, Bologna, Italy",
      url: "https://ieeexplore.ieee.org/abstract/document/11230764/",
    },
    {
      year: "2025",
      title: "Integrated Sensing and Communication for STAR-RIS-Aided UAV Networks",
      authors: "Y. Eghbali, A. Mohammadisarab, H. Zarini, M. Robat Mili, E. Basar, M. Di Renzo, H. Wymeersch",
      venue: "IEEE Transactions on Vehicular Technology",
      url: "https://ieeexplore.ieee.org/document/10924441",
    },
    {
      year: "2025",
      title: "Long-Term Resource Allocation for Solar-Powered Age-Optimized LEO Satellite SWIPT Systems",
      authors: "H. Zarini, A. Mohammadisarab, M. Farajzadeh Dehkordi, M. Robat Mili, A. Movaghar, S. Chatzinotas, I. Krikidis",
      venue: "Under review — IEEE Transactions on Wireless Communications",
      url: null,
    },
    {
      year: "2024",
      title: "Disaster Relief in Industrial IoT: UAV Trajectory Design and Resource Allocation in 6G Non-Terrestrial Networks",
      authors: "A. Mohammadisarab, A. Nouruzi, A. Kalili, N. Mokari, E. A. Jorswieck",
      venue: "IEEE Open Journal of the Communications Society",
      url: "https://ieeexplore.ieee.org/document/10468637",
    },
    {
      year: "2022",
      title: "Joint Resource Allocation, Task Processing, and Trajectory Design for UAV-assisted Industrial IoT Users in 6G Networks",
      authors: "A. Mohammadisarab, A. Khalili, A. Nouruzi, N. Mokari, B. Abbasi Arand, E. A. Jorswieck",
      venue: "IEEE CSCN 2022",
      url: "https://ieeexplore.ieee.org/abstract/document/10050976/",
    },
    {
      year: "2022",
      title: "Deep Adaptive Denoising Auto-Encoder Networks for ECG Noise Cancelation via Time-Frequency Domain",
      authors: "A. Mohammadisarab, P. Aghaomidi, J. Mazloum, M. A. Akbarzadeh, M. Orooji, N. Mokari, H. Yanikomeroglu",
      venue: "APSIPA ASC 2022",
      url: "https://ieeexplore.ieee.org/abstract/document/9980058/",
    },
    {
      year: "2022",
      title: "DeepRTSNet: Deep Robust Two-Stage Networks for ECG Denoising in Practical Use Case",
      authors: "P. Aghaomidi, A. Mohammadisarab, J. Mazloum, M. A. Akbarzadeh, M. Orooji, N. Mokari, H. Yanikomeroglu",
      venue: "IEEE Access",
      url: "https://ieeexplore.ieee.org/document/9969597",
    },
    {
      year: "2019",
      title: "M2M Communications as a Promising Technique to Support Green Powered Base Stations",
      authors: "F. H. Panahi, F. H. Panahi, M. Ghaderzadeh, A. Mohammadisarab",
      venue: "27th Iranian Conference on Electrical Engineering (ICEE 2019)",
      url: null,
    },
  ],
};
