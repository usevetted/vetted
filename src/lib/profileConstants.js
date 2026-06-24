export const SKILLS_LIST = [
  // Tech & Engineering
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "Django", "FastAPI", "Spring Boot",
  "HTML", "CSS", "Tailwind CSS", "GraphQL", "REST APIs", "WebSockets",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "PyTorch", "TensorFlow",
  "Data Analysis", "Data Engineering", "ETL", "Spark", "Pandas", "NumPy",
  "Cybersecurity", "Penetration Testing", "Network Security",
  "iOS Development", "Android Development", "React Native", "Flutter",
  "Blockchain", "Smart Contracts", "Solidity",

  // Product & Design
  "Product Management", "Product Strategy", "Roadmapping", "User Research", "A/B Testing",
  "UI Design", "UX Design", "Figma", "Sketch", "Adobe XD", "Prototyping", "Wireframing",
  "Design Systems", "Accessibility", "Motion Design", "Graphic Design", "Brand Design",
  "Agile", "Scrum", "Kanban", "Jira", "Notion", "Linear",

  // Marketing & Growth
  "Digital Marketing", "Growth Hacking", "SEO", "SEM", "Content Marketing", "Copywriting",
  "Email Marketing", "Social Media Marketing", "Paid Ads", "Google Ads", "Meta Ads",
  "Marketing Analytics", "Brand Strategy", "PR", "Influencer Marketing", "Community Building",
  "HubSpot", "Salesforce", "Marketo",

  // Sales & Business Development
  "Sales", "B2B Sales", "Enterprise Sales", "SaaS Sales", "Account Management",
  "Business Development", "Partnerships", "Lead Generation", "CRM", "Cold Outreach",
  "Negotiation", "Revenue Operations",

  // Finance & Operations
  "Financial Modeling", "Accounting", "FP&A", "Venture Capital", "Private Equity",
  "Investment Banking", "Equity Research", "Valuation", "M&A", "Due Diligence",
  "Operations", "Supply Chain", "Logistics", "Process Improvement", "Six Sigma",
  "Project Management", "Program Management", "PMP",

  // People & Leadership
  "Leadership", "Team Management", "Hiring", "Talent Acquisition", "HR",
  "Executive Coaching", "Mentorship", "Organizational Design", "Culture Building",

  // Data & Analytics
  "Business Intelligence", "Tableau", "Power BI", "Looker", "SQL Analytics",
  "Excel", "Google Sheets", "Statistics", "Forecasting",

  // Communication & Strategy
  "Public Speaking", "Presentations", "Technical Writing", "Storytelling",
  "Strategy", "Consulting", "Change Management", "Stakeholder Management",

  // Customer & Support
  "Customer Success", "Customer Support", "Account Executive", "Onboarding",

  // Legal & Compliance
  "Legal", "Compliance", "Contract Negotiation", "Intellectual Property",

  // Microsoft Office
  "Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Microsoft Outlook",
  "Microsoft Access", "Microsoft OneNote", "Microsoft Teams", "Microsoft Office",
];

export const yearsOptions = [
  { value: 'Less than 1 year', label: 'Less than 1 year' },
  ...Array.from({ length: 29 }, (_, i) => {
    const n = i + 1;
    return { value: `${n} year${n > 1 ? 's' : ''}`, label: `${n} year${n > 1 ? 's' : ''}` };
  }),
  { value: '30+ years', label: '30+ years' },
];