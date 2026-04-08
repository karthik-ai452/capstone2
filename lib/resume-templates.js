function formatContactLine(contactInfo = {}) {
  const parts = [];

  if (contactInfo.email) parts.push(contactInfo.email);
  if (contactInfo.mobile) parts.push(contactInfo.mobile);
  if (contactInfo.linkedin) parts.push(`[LinkedIn](${contactInfo.linkedin})`);
  if (contactInfo.twitter) parts.push(`[Twitter/X](${contactInfo.twitter})`);

  return parts.join(" | ");
}

function getSkillsList(skills = "") {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function formatEntries(entries = [], heading, style = "classic") {
  if (!entries.length) return "";

  const body = entries
    .map((entry, index) => {
      const dateRange = entry.current
        ? `${entry.startDate} - Present`
        : `${entry.startDate} - ${entry.endDate}`;

      if (style === "compact") {
        return `### ${index + 1}. ${entry.title} | ${entry.organization}
**Timeline:** ${dateRange}
${entry.description}`;
      }

      if (style === "executive") {
        return `### ${entry.title}
**${entry.organization}**
_${dateRange}_
${entry.description}`;
      }

      if (style === "project") {
        return `### ${entry.title}
**Organization:** ${entry.organization}
**Duration:** ${dateRange}
${entry.description}`;
      }

      return `### ${entry.title} @ ${entry.organization}
${dateRange}
${entry.description}`;
    })
    .join("\n\n");

  return `## ${heading}\n${body}`;
}

function formatBulletSkills(skills = "") {
  if (!skills) return "";

  return getSkillsList(skills).map((skill) => `- ${skill}`).join("\n");
}

function formatPillSkills(skills = "") {
  if (!skills) return "";

  return getSkillsList(skills)
    .map((skill) => `\`${skill}\``)
    .join(" ");
}

function formatTwoColumnSkills(skills = "") {
  const items = getSkillsList(skills);

  if (!items.length) return "";

  const midpoint = Math.ceil(items.length / 2);
  const left = items.slice(0, midpoint).join("<br/>");
  const right = items.slice(midpoint).join("<br/>");

  return `| Strengths | Tools |\n| --- | --- |\n| ${left || "-"} | ${right || "-"} |`;
}

function formatTopHighlights(summary = "", targetRole = "") {
  const highlights = [];

  if (targetRole) highlights.push(`Target Role: ${targetRole}`);
  if (summary) highlights.push(summary);

  if (!highlights.length) return "";

  return highlights.map((item) => `- ${item}`).join("\n");
}

function formatTextSection(heading, content = "") {
  if (!content?.trim()) return "";

  return `## ${heading}\n${content.trim()}`;
}

function formatCertifications(certifications = []) {
  if (!certifications.length) return "";

  const body = certifications
    .map((item) => {
      const link = item.credentialUrl
        ? ` - [Credential](${item.credentialUrl})`
        : "";

      return `- **${item.name}** - ${item.issuer}${link}`;
    })
    .join("\n");

  return `## Certifications\n${body}`;
}

function formatTimelineEntries(entries = [], heading) {
  if (!entries.length) return "";

  const body = entries
    .map((entry) => {
      const dateRange = entry.current
        ? `${entry.startDate} -> Present`
        : `${entry.startDate} -> ${entry.endDate}`;

      return `### ${entry.title}\n${dateRange} | ${entry.organization}\n- ${entry.description}`;
    })
    .join("\n\n");

  return `## ${heading}\n${body}`;
}

function buildClassicTemplate(values, fullName) {
  const {
    contactInfo,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    additionalInfo,
  } =
    values;
  const contactLine = formatContactLine(contactInfo);

  return [
    `# ${fullName || "Your Name"}`,
    contactLine,
    `---`,
    summary && `## Professional Summary\n${summary}`,
    skills && `## Skills\n${skills}`,
    formatEntries(experience, "Work Experience", "classic"),
    formatEntries(education, "Education", "classic"),
    formatEntries(projects, "Projects", "classic"),
    formatCertifications(certifications),
    formatTextSection("Achievements", achievements),
    formatTextSection("Additional Information", additionalInfo),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildCompactTemplate(values, fullName) {
  const {
    contactInfo,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    additionalInfo,
  } =
    values;
  const contactLine = formatContactLine(contactInfo);

  return [
    `# ${fullName || "Your Name"}`,
    `## Snapshot`,
    contactLine && `**Contact:** ${contactLine}`,
    `| Focus | Strengths |\n| --- | --- |`,
    `| Strengths | Focus |\n| --- | --- |\n| ${getSkillsList(skills).slice(0, 4).join(", ") || "Add your strongest skills"} | Portfolio overview |`,
    summary && `### Profile\n${summary}`,
    skills && `### Core Skills\n${formatTwoColumnSkills(skills)}`,
    formatEntries(experience, "Experience Highlights", "compact"),
    formatEntries(projects, "Selected Projects", "compact"),
    formatEntries(education, "Education", "compact"),
    formatCertifications(certifications),
    formatTextSection("Achievements", achievements),
    formatTextSection("Additional Information", additionalInfo),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildExecutiveTemplate(values, fullName) {
  const {
    contactInfo,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    additionalInfo,
  } =
    values;
  const contactLine = formatContactLine(contactInfo);

  return [
    `# ${fullName || "Your Name"}`,
    contactLine && `_${contactLine}_`,
    `## Executive Profile`,
    summary || "Experienced professional with a focus on impact and delivery.",
    summary && `## Career Highlights\n${formatTopHighlights(summary, "")}`,
    skills &&
      `## Leadership and Technical Strengths\n${formatPillSkills(skills)}`,
    `---`,
    formatEntries(experience, "Professional Experience", "executive"),
    formatEntries(projects, "Key Initiatives", "executive"),
    formatEntries(education, "Academic Credentials", "executive"),
    formatCertifications(certifications),
    formatTextSection("Achievements", achievements),
    formatTextSection("Additional Information", additionalInfo),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildProjectTemplate(values, fullName) {
  const {
    contactInfo,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    additionalInfo,
  } =
    values;
  const contactLine = formatContactLine(contactInfo);

  return [
    `# ${fullName || "Your Name"}`,
    contactLine && `**Connect:** ${contactLine}`,
    summary && `> ${summary}`,
    projects.length
      ? formatEntries(projects, "Featured Projects", "project")
      : "",
    skills && `## Tech Stack\n${formatBulletSkills(skills)}`,
    formatTimelineEntries(experience, "Hands-on Experience"),
    formatTimelineEntries(education, "Education"),
    formatCertifications(certifications),
    formatTextSection("Achievements", achievements),
    formatTextSection("Additional Information", additionalInfo),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const RESUME_TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional one-column format with strong section hierarchy.",
    accent: "from-slate-100 via-slate-50 to-white",
    preview: "Header, divider, summary, skills, and standard experience flow.",
    build: buildClassicTemplate,
  },
  {
    id: "compact",
    name: "Modern Grid",
    description: "Fast-scanning layout with tables and compact skill grouping.",
    accent: "from-cyan-100 via-sky-50 to-white",
    preview: "Snapshot section, focus table, and split skill columns.",
    build: buildCompactTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Polished narrative style for leadership or senior candidates.",
    accent: "from-amber-100 via-orange-50 to-white",
    preview: "Profile-led layout with highlights and elevated section tone.",
    build: buildExecutiveTemplate,
  },
  {
    id: "project",
    name: "Project First",
    description: "Portfolio-oriented template that leads with shipped work.",
    accent: "from-emerald-100 via-teal-50 to-white",
    preview: "Featured projects first, then timeline-style experience.",
    build: buildProjectTemplate,
  },
];

export function buildResumeFromTemplate(templateId, values, fullName) {
  const template =
    RESUME_TEMPLATES.find((item) => item.id === templateId) ||
    RESUME_TEMPLATES[0];

  return template.build(values, fullName).trim();
}
