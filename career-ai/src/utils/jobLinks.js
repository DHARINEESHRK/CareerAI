export function generateJobLinks(role) {
  const keyword = typeof role === "string" ? role.toLowerCase() : "software developer";

  return {
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}`,
    unstop: `https://unstop.com/jobs?search=${encodeURIComponent(keyword)}`,
    google: `https://www.google.com/search?q=${encodeURIComponent(keyword + " jobs")}`
  };
}

// Legacy export for internal compatibility
export const getJobLinks = generateJobLinks;
