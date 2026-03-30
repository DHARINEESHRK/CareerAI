import { VALID_ROLES } from "./validRoles";

export function cleanRole(title) {
  if (!title || typeof title !== "string") return "Software Engineer";

  const lower = title.toLowerCase();

  // 1. Exact or Partial Industry Match
  for (let role of VALID_ROLES) {
    if (lower.includes(role.toLowerCase())) {
      return role;
    }
  }

  // 2. Logic Mapping for common slang/domains
  if (lower.includes("frontend") || lower.includes("front end")) return "Frontend Developer";
  if (lower.includes("backend") || lower.includes("back end")) return "Backend Developer";
  if (lower.includes("full stack") || lower.includes("fullstack")) return "Full Stack Developer";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui")) return "Product Designer";
  if (lower.includes("data") || lower.includes("analytics")) return "Data Scientist";
  if (lower.includes("ai") || lower.includes("intelligence")) return "AI Engineer";
  if (lower.includes("security") || lower.includes("cyber")) return "Cybersecurity Analyst";
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("ios")) return "Mobile App Developer";
  if (lower.includes("cloud") || lower.includes("aws") || lower.includes("azure")) return "Cloud Engineer";

  // 3. Block "Creative" or Unrealistic titles
  const nonsense = ["rich", "money", "hero", "guru", "ninja", "rockstar", "extreme"];
  if (nonsense.some(word => lower.includes(word))) {
      return "Software Engineer"; 
  }

  return "Software Engineer";
}
