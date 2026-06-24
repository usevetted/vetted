export const SKILLS_LIST = [
  // Tech
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'Swift',
  'React', 'Vue', 'Angular', 'Node.js', 'Next.js', 'Django', 'Flask', 'FastAPI', 'GraphQL', 'REST APIs',
  'HTML/CSS', 'Tailwind CSS', 'Sass', 'Bootstrap', 'jQuery',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'CI/CD', 'Linux', 'Git',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI', 'Excel', 'Pandas', 'NumPy',
  // Business
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'Jira',
  'Product Management', 'Product Strategy', 'Roadmapping',
  'Sales', 'B2B Sales', 'Account Management', 'CRM', 'Salesforce',
  'Marketing', 'Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing',
  'Operations', 'Supply Chain', 'Logistics',
  'Finance', 'Accounting', 'Financial Analysis', 'Budgeting', 'FP&A',
  'Customer Service', 'Customer Success', 'Client Relations',
  'Business Development', 'Negotiation', 'Strategic Planning',
  'Human Resources', 'Recruiting', 'Onboarding',
  // Creative
  'UI/UX Design', 'Figma', 'Adobe XD', 'Wireframing', 'Prototyping',
  'Graphic Design', 'Photoshop', 'Illustrator', 'InDesign',
  'Video Editing', 'Premiere Pro', 'After Effects', 'Motion Graphics',
  'Copywriting', 'Technical Writing', 'Content Strategy',
  'Photography', 'Branding',
  // Trades & Other
  'Carpentry', 'Electrician', 'Plumbing', 'Welding', 'HVAC',
  'Auto Repair', 'Construction', 'Facilities Maintenance',
  'Nursing', 'Medical Assisting', 'Phlebotomy', 'CPR Certified',
  'Teaching', 'Curriculum Design', 'Tutoring',
  'Cooking', 'Food Safety', 'Bartending',
  'Forklift Operation', 'CDL License', 'Warehouse Operations',
  'Quality Assurance', 'Inventory Management',
];

export const yearsOptions = [
  { value: 'Less than 1 year', label: 'Less than 1 year' },
  ...Array.from({ length: 29 }, (_, i) => {
    const n = i + 1;
    return { value: `${n} year${n > 1 ? 's' : ''}`, label: `${n} year${n > 1 ? 's' : ''}` };
  }),
  { value: '30+ years', label: '30+ years' },
];