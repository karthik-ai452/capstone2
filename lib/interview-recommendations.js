const COURSE_LIBRARY = {
  react: [
    {
      title: "React Fundamentals",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=react",
    },
    {
      title: "React Bootcamp",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=react",
    },
    {
      title: "React Tutorials",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/reactjs/",
    },
  ],
  javascript: [
    {
      title: "Modern JavaScript",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=javascript",
    },
    {
      title: "JavaScript Essentials",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=javascript",
    },
    {
      title: "JavaScript Tutorial",
      provider: "freeCodeCamp",
      url: "https://www.freecodecamp.org/news/tag/javascript/",
    },
  ],
  typescript: [
    {
      title: "TypeScript for Developers",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=typescript",
    },
    {
      title: "Complete TypeScript Guide",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=typescript",
    },
    {
      title: "TypeScript Basics",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/typescript/",
    },
  ],
  node: [
    {
      title: "Node.js Backend Development",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=node%20js",
    },
    {
      title: "Server-side JavaScript with Node.js",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=node%20js",
    },
    {
      title: "Node.js Tutorials",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/nodejs/",
    },
  ],
  nodejs: [
    {
      title: "Node.js Backend Development",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=node%20js",
    },
    {
      title: "Server-side JavaScript with Node.js",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=node%20js",
    },
    {
      title: "Node.js Tutorials",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/nodejs/",
    },
  ],
  python: [
    {
      title: "Python for Professional Workflows",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=python",
    },
    {
      title: "Python Programming Masterclass",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=python",
    },
    {
      title: "Python Tutorial",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/python-programming-language-tutorial/",
    },
  ],
  java: [
    {
      title: "Java Programming",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=java",
    },
    {
      title: "Java Programming Bootcamp",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=java",
    },
    {
      title: "Java Tutorial",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/java/",
    },
  ],
  sql: [
    {
      title: "SQL for Data and Analytics",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=sql",
    },
    {
      title: "SQL Bootcamp",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=sql",
    },
    {
      title: "SQL Tutorial",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/sql-tutorial/",
    },
  ],
  docker: [
    {
      title: "Docker and Container Basics",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=docker",
    },
    {
      title: "Docker Essentials",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=docker",
    },
    {
      title: "Docker Tutorial",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/docker-tutorial/",
    },
  ],
  aws: [
    {
      title: "AWS Cloud Practitioner",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=aws",
    },
    {
      title: "AWS Certification Prep",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=aws",
    },
    {
      title: "AWS Tutorials",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/aws-tutorial/",
    },
  ],
  machinelearning: [
    {
      title: "Machine Learning Foundations",
      provider: "Coursera",
      url: "https://www.coursera.org/search?query=machine%20learning",
    },
    {
      title: "Machine Learning A-Z",
      provider: "Udemy",
      url: "https://www.udemy.com/courses/search/?q=machine%20learning",
    },
    {
      title: "Machine Learning Tutorials",
      provider: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/machine-learning/",
    },
  ],
};

const FALLBACK_PROVIDERS = [
  {
    provider: "Udemy",
    buildUrl: (label) =>
      `https://www.udemy.com/courses/search/?q=${encodeURIComponent(label)}`,
  },
  {
    provider: "Coursera",
    buildUrl: (label) =>
      `https://www.coursera.org/search?query=${encodeURIComponent(label)}`,
  },
  {
    provider: "GeeksforGeeks",
    buildUrl: () => "https://www.geeksforgeeks.org/",
  },
];

const JOB_LIBRARY = {
  react: ["React Developer", "Frontend Developer", "UI Engineer"],
  javascript: ["JavaScript Developer", "Frontend Engineer", "Web Developer"],
  typescript: ["TypeScript Developer", "Frontend Engineer", "Full Stack Engineer"],
  node: ["Node.js Developer", "Backend Engineer", "Full Stack Developer"],
  nodejs: ["Node.js Developer", "Backend Engineer", "Full Stack Developer"],
  python: ["Python Developer", "Backend Engineer", "Automation Engineer"],
  java: ["Java Developer", "Software Engineer", "Backend Developer"],
  sql: ["Data Analyst", "Business Intelligence Analyst", "Database Developer"],
  aws: ["Cloud Engineer", "DevOps Engineer", "Site Reliability Engineer"],
  docker: ["Platform Engineer", "DevOps Engineer", "Cloud Engineer"],
  machinelearning: [
    "Machine Learning Engineer",
    "Data Scientist",
    "AI Engineer",
  ],
};

function normalizeSkill(skill = "") {
  return skill.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatSkill(skill = "") {
  return skill
    .split(/[\s/-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatIndustry(industry = "") {
  if (!industry) return "your field";

  return industry
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createLinkedInUrl(title, industry) {
  const keywords = [title, formatIndustry(industry)].filter(Boolean).join(" ");
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
    keywords
  )}`;
}

function createFallbackCourses(skill) {
  const label = formatSkill(skill);

  return FALLBACK_PROVIDERS.map((provider) => ({
    skill: label,
    title: `${label} Skill Boost`,
    provider: provider.provider,
    url: provider.buildUrl(label),
    reason: `Build stronger confidence in ${label} with a focused learning resource.`,
  }));
}

function buildCoursesForSkill(skill) {
  const normalized = normalizeSkill(skill);
  const matches = COURSE_LIBRARY[normalized];
  const label = formatSkill(skill);

  if (!matches?.length) {
    return createFallbackCourses(skill);
  }

  return matches.map((match) => ({
    skill: label,
    title: match.title,
    provider: match.provider,
    url: match.url,
    reason: `Strengthen ${label} with a practical learning path from ${match.provider}.`,
  }));
}

function buildJobs(skill, industry) {
  const normalized = normalizeSkill(skill);
  const label = formatSkill(skill);
  const titles = JOB_LIBRARY[normalized] || [
    `${label} Specialist`,
    `${label} Engineer`,
    `${label} Analyst`,
  ];

  return titles.map((title) => ({
    skill: label,
    title,
    url: createLinkedInUrl(title, industry),
    reason: `Your quiz performance suggests ${label} is one of your stronger areas.`,
  }));
}

function buildSkillStats(questionResults, userSkills) {
  const skillStats = userSkills.reduce((acc, skill) => {
    acc[skill] = { total: 0, correct: 0, wrong: 0 };
    return acc;
  }, {});

  if (!userSkills.length) {
    return skillStats;
  }

  questionResults.forEach((question, index) => {
    const haystack = [
      question.question,
      question.explanation,
      question.answer,
      question.userAnswer,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchedSkills = userSkills.filter((skill) =>
      haystack.includes(skill.toLowerCase())
    );

    const targetSkills = matchedSkills.length
      ? matchedSkills
      : [userSkills[index % userSkills.length]];

    targetSkills.forEach((skill) => {
      skillStats[skill].total += 1;

      if (question.isCorrect) {
        skillStats[skill].correct += 1;
      } else {
        skillStats[skill].wrong += 1;
      }
    });
  });

  return skillStats;
}

export function buildInterviewRecommendations({
  questionResults = [],
  quizScore = 0,
  userSkills = [],
  industry = "",
}) {
  const skills = userSkills.filter(Boolean);
  const skillStats = buildSkillStats(questionResults, skills);

  const scoredSkills = skills
    .map((skill) => {
      const stats = skillStats[skill] || { total: 0, correct: 0, wrong: 0 };
      const accuracy = stats.total ? stats.correct / stats.total : 0;

      return {
        skill,
        accuracy,
        ...stats,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

  const weakSkills = scoredSkills
    .filter(
      (skill) => skill.total > 0 && (skill.accuracy < 0.6 || skill.wrong > 0)
    )
    .slice(0, 2)
    .map((skill) => skill.skill);

  const strongSkills = scoredSkills
    .filter(
      (skill) => skill.total > 0 && skill.accuracy >= 0.7 && skill.correct > 0
    )
    .slice()
    .reverse()
    .slice(0, 3)
    .map((skill) => skill.skill);

  const improvementSkills = weakSkills.length
    ? weakSkills
    : quizScore < 60
    ? skills.slice(0, 2)
    : [];

  const recommendedCourses = improvementSkills
    .flatMap((skill) => buildCoursesForSkill(skill))
    .slice(0, 6);

  const recommendedJobs = strongSkills.flatMap((skill) =>
    buildJobs(skill, industry)
  );

  return {
    strongerSkills: strongSkills.map(formatSkill),
    improvementSkills: improvementSkills.map(formatSkill),
    recommendedCourses,
    recommendedJobs,
  };
}
