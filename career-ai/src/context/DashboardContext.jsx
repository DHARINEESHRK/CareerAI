import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';

const DashboardContext = createContext();
const LAST_ACTIVE_PATH_KEY = 'lastActivePathId';

const normalizeText = (value = '') => String(value || '').trim().toLowerCase();

const getPathSignature = (path = {}) => {
  const phaseTitles = Array.isArray(path.phases)
    ? path.phases.map((phase) => normalizeText(phase?.title)).filter(Boolean)
    : [];

  return JSON.stringify({
    domain: normalizeText(path.domain),
    goal: normalizeText(path.goal),
    title: normalizeText(path.title),
    completionDeadline: normalizeText(path.completionDeadline),
    phaseTitles,
  });
};

const dedupePaths = (paths = []) => {
  const seen = new Set();
  return paths.filter((path) => {
    const signature = getPathSignature(path);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
};

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [paths, setPaths] = useState([]);
  const [activePath, setActivePathState] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activePhase, setActivePhase] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [marketTrends, setMarketTrends] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const savePreviewPromiseRef = useRef(null);
  const notificationRequestInFlightRef = useRef(false);

  const setActivePath = (path) => {
    setActivePathState(path || null);
    if (path?._id) {
      localStorage.setItem(LAST_ACTIVE_PATH_KEY, path._id);
    } else {
      localStorage.removeItem(LAST_ACTIVE_PATH_KEY);
    }
  };

  // Fetch all paths on load
  const fetchPaths = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/path");
      if (res && res.ok) {
        const data = await res.json();
        const uniquePaths = dedupePaths(data);
        setPaths(uniquePaths);
        if (activePath?.isPreview) {
          return;
        }

        const lastActivePathId = localStorage.getItem(LAST_ACTIVE_PATH_KEY);
        const preferredPath =
          uniquePaths.find((p) => p._id === activePath?._id) ||
          uniquePaths.find((p) => p._id === lastActivePathId) ||
          uniquePaths[0] ||
          null;

        if (preferredPath) {
          setActivePath(preferredPath);
        } else {
          setActivePath(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch paths", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch progress data
  const fetchProgress = async () => {
    try {
      const res = await apiFetch("/progress");
      if (res && res.ok) {
        const data = await res.json();
        setProgressData(data);
      }
    } catch (err) {
      console.error("Failed to fetch progress", err);
    }
  };

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (notificationRequestInFlightRef.current) return;
    notificationRequestInFlightRef.current = true;
    if (!silent) setIsNotificationsLoading(true);
    try {
      const res = await apiFetch('/notification');
      if (res && res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      if (!silent) setIsNotificationsLoading(false);
      notificationRequestInFlightRef.current = false;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await apiFetch(`/notification/${id}/read`, { method: 'POST' });
      if (res && res.ok) {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await apiFetch('/notification/read-all', { method: 'POST' });
      if (res && res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  // Fetch tasks for active phase of a path
  const fetchTasks = async (pathId) => {
    if (!pathId) return;
    try {
      const res = await apiFetch(`/task/${pathId}`);
      if (res && res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        setActivePhase(data.activePhase);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  // Fetch market trends for active path domain
  const fetchTrends = async (domain) => {
    if (!domain) return;
    try {
      const res = await apiFetch(`/market/market-trends?domain=${encodeURIComponent(domain)}`);
      if (res && res.ok) {
        const data = await res.json();
        setMarketTrends(data);
      }
    } catch (err) {
      console.error("Failed to fetch trends", err);
    }
  };

  useEffect(() => {
    fetchPaths();
    fetchProgress();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications({ silent: true });
      }
    }, 5000);

    const onWindowFocus = () => fetchNotifications({ silent: true });
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications({ silent: true });
      }
    };

    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (activePath) {
      fetchTasks(activePath._id);
      fetchTrends(activePath.domain);
    }
  }, [activePath]);

  const toggleTask = async (taskId) => {
    try {
      const res = await apiFetch(`/task/${taskId}/toggle`, {
        method: "POST"
      });
      if (res && res.ok) {
        const updatedTask = await res.json();
        
        // Update local tasks state
        setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
        
        // Re-fetch to update phase status and progress
        fetchTasks(activePath._id);
        fetchPaths(); 
        fetchProgress();
        fetchNotifications({ silent: true });
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const generatePath = async (formData) => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/path/generate", {
        method: "POST",
        body: JSON.stringify({ ...formData, previewOnly: true })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate path");
      }

      setActivePath(data);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveGeneratedPath = async () => {
    if (!activePath?.isPreview) return activePath;
    if (savePreviewPromiseRef.current) {
      return savePreviewPromiseRef.current;
    }

    const savePromise = (async () => {
      setIsLoading(true);
      try {
        const { isPreview, ...payload } = activePath;
        const res = await apiFetch("/path/save-generated", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to save generated path");
        }

        setPaths((prev) => dedupePaths([data, ...prev.filter((p) => p._id !== data._id)]));
        setActivePath(data);
        fetchTasks(data._id);
        fetchProgress();
        fetchNotifications({ silent: true });

        return data;
      } finally {
        setIsLoading(false);
        savePreviewPromiseRef.current = null;
      }
    })();

    savePreviewPromiseRef.current = savePromise;
    return savePromise;
  };

  const deletePath = async (pathId) => {
    if (!pathId) return;

    setIsLoading(true);
    try {
      const res = await apiFetch(`/path/${pathId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete roadmap");
      }

      const updatedPaths = paths.filter((p) => p._id !== pathId);
      setPaths(updatedPaths);

      if (activePath?._id === pathId) {
        setActivePath(updatedPaths[0] || null);
        setTasks([]);
        setActivePhase(null);
        setMarketTrends(null);
      }

      fetchProgress();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardContext.Provider value={{ 
      paths, 
      activePath, 
      setActivePath,
      tasks, 
      activePhase,
      marketTrends,
      progressData,
      toggleTask, 
      generatePath,
      saveGeneratedPath,
      deletePath,
      notifications,
      unreadNotificationCount,
      isNotificationsLoading,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      isLoading,
      refreshData: fetchPaths
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
