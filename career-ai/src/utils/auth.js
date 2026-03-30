export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Hard reload to clear all React state and avoid infinite render loops
  window.location.href = "/login";
};
