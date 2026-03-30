export function getProjects(domain = "") {
  const d = domain.toLowerCase();

  if (d.includes("software") || d.includes("engineering") || d.includes("developer")) {
    return [
      {
        title: "Portfolio Website",
        description: "Build a personal portfolio using React",
        difficulty: "Easy"
      },
      {
        title: "Full Stack App",
        description: "Create MERN app with auth + dashboard",
        difficulty: "Medium"
      },
      {
        title: "Job Tracker App",
        description: "Track job applications with backend",
        difficulty: "Hard"
      }
    ];
  }

  if (d.includes("cyber") || d.includes("security")) {
    return [
      {
        title: "Network Scanner",
        description: "Build a tool to scan open ports",
        difficulty: "Medium"
      },
      {
        title: "Password Cracker Simulation",
        description: "Understand hashing and brute force",
        difficulty: "Hard"
      }
    ];
  }

  if (d.includes("data") || d.includes("science") || d.includes("ai")) {
    return [
      {
        title: "House Price Predictor",
        description: "Build a regression model based on house features",
        difficulty: "Easy"
      },
      {
        title: "Sentiment Analyzer",
        description: "Create a tool to detect emotion in text datasets",
        difficulty: "Medium"
      }
    ];
  }

  return [
    {
      title: "Starter Project",
      description: "Build something related to your domain",
      difficulty: "Easy"
    }
  ];
}
