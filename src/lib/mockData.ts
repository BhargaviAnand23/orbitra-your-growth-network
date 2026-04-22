export type Opportunity = {
  id: string;
  title: string;
  org: string;
  type: "Internship" | "Gig" | "Event" | "Collaboration";
  description: string;
  location: string;
  tags: string[];
  link: string;
};

export type SuggestedUser = {
  id: string;
  name: string;
  role: string;
  skills: string[];
  initials: string;
  hue: number;
};

export const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Frontend Intern",
    org: "Lumen Studios",
    type: "Internship",
    description: "Build interactive product experiences with React + TypeScript. Remote, 3 months, paid.",
    location: "Remote",
    tags: ["React", "TypeScript", "UI"],
    link: "#",
  },
  {
    id: "2",
    title: "Designer for indie game",
    org: "Nova Collective",
    type: "Collaboration",
    description: "Looking for a UI/UX collaborator on a sci-fi narrative game. Revenue share.",
    location: "Online",
    tags: ["Figma", "Game Design", "Illustration"],
    link: "#",
  },
  {
    id: "3",
    title: "Hack the Future 2026",
    org: "Orbitra Community",
    type: "Event",
    description: "48-hour student hackathon focused on AI for social good. Prizes worth $10k.",
    location: "Bangalore + Online",
    tags: ["Hackathon", "AI", "Networking"],
    link: "#",
  },
  {
    id: "4",
    title: "Write a tech newsletter",
    org: "Bytewise",
    type: "Gig",
    description: "Weekly 800-word newsletter on emerging dev tools. $120 per issue.",
    location: "Remote",
    tags: ["Writing", "Developer Tools"],
    link: "#",
  },
  {
    id: "5",
    title: "Product Marketing Intern",
    org: "Stratos AI",
    type: "Internship",
    description: "Help shape positioning for a new AI productivity suite. Mentorship + stipend.",
    location: "Hybrid · NYC",
    tags: ["Marketing", "Strategy", "AI"],
    link: "#",
  },
];

export const suggestedUsers: SuggestedUser[] = [
  { id: "1", name: "Aisha Rahman", role: "CS sophomore · Builder", skills: ["React", "ML"], initials: "AR", hue: 268 },
  { id: "2", name: "Diego Marín", role: "Product designer", skills: ["Figma", "Motion"], initials: "DM", hue: 210 },
  { id: "3", name: "Priya Shah", role: "Indie hacker", skills: ["Next.js", "Stripe"], initials: "PS", hue: 290 },
  { id: "4", name: "Kenji Watanabe", role: "Game dev · Student", skills: ["Unity", "C#"], initials: "KW", hue: 190 },
];
