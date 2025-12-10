// Simulated AI Functions for Frontend

export const scoreResume = async (text) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const score = Math.floor(Math.random() * (98 - 60 + 1) + 60);
  const strengths = ["React expertise", "Clear communication", "Experience with similar stack"];
  const weaknesses = ["Short tenure at previous job", "Lack of specific industry experience"];
  
  return {
    score,
    summary: `Candidate scored ${score}/100 based on keyword matching and experience analysis.`,
    strengths,
    weaknesses
  };
};

export const autoShortlist = async (candidates) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return candidates.filter(c => c.matchScore > 75);
};

export const generateInterviewSlots = async (candidateName) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const today = new Date();
  const slots = [];
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    slots.push({
      date: date.toLocaleDateString(),
      time: `${10 + i}:00 AM`,
      interviewer: "Jane Smith"
    });
  }
  return slots;
};

export const summarizeResume = async (text) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return "Experienced professional with a strong background in software development. Proven track record of delivering high-quality code and leading teams.";
};

export const generateOfferLetter = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `Dear ${data.name},

We are delighted to offer you the position of ${data.role} at our company.

Annual Salary: $${data.salary || '85,000'}
Start Date: ${new Date().toLocaleDateString()}

We look forward to having you on our team.

Sincerely,
HR Department`;
};

export const aiInsightsDashboard = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { type: 'warning', message: 'Engineering department has a 15% higher attrition risk this quarter.' },
    { type: 'success', message: 'Recruitment efficiency improved by 20% after implementing AI screening.' },
    { type: 'info', message: '3 employees are eligible for promotion based on recent performance reviews.' }
  ];
};

export const predictAttritionRisk = async (employeeHistory) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const risk = Math.random() > 0.7 ? "High" : "Low";
  return {
    risk,
    reason: risk === "High" ? "Frequent late arrivals and stalled salary growth." : "Steady engagement and regular feedback."
  };
};

export const recommendTrainingPlan = async (employee) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    "Advanced React Patterns",
    "Leadership 101",
    "Effective Communication"
  ];
};

export const suggestJobDescription = async (role) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `Job Title: ${role}

Responsibilities:
- Develop and maintain high-quality software.
- Collaborate with cross-functional teams.
- Mentor junior developers.

Requirements:
- 3+ years of experience in a similar role.
- Strong problem-solving skills.
- Proficiency in modern tech stacks.`;
};
