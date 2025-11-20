import { a } from "framer-motion/client";

export const BASE_URL =
  // Vite
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  // Create React App
  process.env.REACT_APP_API_URL ||
  // Next.js
  process.env.NEXT_PUBLIC_API_URL ||
  // fallback to empty -> same origin
  '';


interface AppUsage {
  app_id: number;
  app_name: string;
  version: string | null;
  publisher: string | null;
  install_location: string | null;
  icon_base64: string | null;
  daily_limit_minutes: number;
  total_usage: number;
}

interface AppPolicy {
  id: string;
  agent_id: string;
  installed_app_id: number;
  is_blocked: boolean;
  limit_enabled: boolean;
  limit_minutes: number | null;
  action_on_limit: 'close' | 'warn' | 'none';
  warn_interval: number;
  today_usage_minutes: number;
  last_usage_date: string;
}

interface MergedAppData extends AppUsage {
  policy?: AppPolicy;
}
export const mockAPI = {
  uninstallApp: async (appId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Uninstalling app with ID: ${appId}`);
        resolve({ success: true });
      }, 500);
    });
  },

  killProcess: async (processId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Killing process with ID: ${processId}`);
        resolve({ success: true });
      }, 500);
    });
  },

  captureScreenshot: async (): Promise<{ success: boolean; url: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Capturing screenshot...');
        resolve({
          success: true,
          url: 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg?auto=compress&cs=tinysrgb&w=400'
        });
      }, 1000);
    });
  },

  saveSettings: async (settings: Record<string, unknown>): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Saving settings:', settings);
        resolve({ success: true });
      }, 500);
    });
  },

  addUsageLimit: async (limit: {
    name: string;
    category: string;
    limitMinutes: number;
  }): Promise<{ success: boolean; id: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Adding usage limit:', limit);
        resolve({ success: true, id: Date.now().toString() });
      }, 500);
    });
  },

  deleteUsageLimit: async (limitId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Deleting usage limit with ID: ${limitId}`);
        resolve({ success: true });
      }, 500);
    });
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: any; token?: string; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Login failed' };
      }

      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  signUp: async (email: string, password: string, name?: string): Promise<{ success: boolean; user?: any; token?: string; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Register failed' };
      }
      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  getMe: async (token: string | null): Promise<{ success: boolean; user?: any; error?: string }> => {
    if (!token) return { success: false, error: 'No token' };
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch user' };
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  logout: async (token?: string | null): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }).catch(() => null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  getAllAgents: async (token?: string): Promise<{ success: boolean; agents?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${BASE_URL}/api/agents`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch agents' };
      }
      return { success: true, agents: data?.agents || [] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  getAgentsStatus: async (token?: string): Promise<{ success: boolean; agentsStatus?: { agent_id: string; status: string }[]; error?: string }> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/status`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch agents status' };
      }
      return { success: true, agentsStatus: data?.agentsStatus || [] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  getAgentApplications: async (agentId: string, token?: string): Promise<{ success: boolean; applications?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${agentId}/applications`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch agent applications' };
      }
      return { success: true, applications: data?.applications || data?.apps || [] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  // set status for applications on an agent (e.g. schedule uninstall)
  setAgentApplicationsStatus: async (agentId: string, body: { appId: string; status: string }, token?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/applications-status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to set applications status' };
      }
      return { success: true };
    } catch (err: any) {
      // In mock mode or offline, simulate success but log for debugging
      console.log(`Mock setAgentApplicationsStatus for agent ${agentId}`, body);
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400));
    }
  },

  // Tạo command cho agent (ví dụ: uninstall)
  createAgentCommand: async (agentId: string, body: Record<string, any>, token?: string): Promise<{ success: boolean; commandId?: string; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/commands`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to create command' };
      }
      return { success: true, commandId: data?.commandId || null };
    } catch (err: any) {
      // khi offline hoặc mock mode, simulate success nhưng trả về một id giả
      console.log(`Mock createAgentCommand for agent ${agentId}`, body);
      return new Promise(resolve => setTimeout(() => resolve({ success: true, commandId: Date.now().toString() }), 300));
    }
  },

  // Yêu cầu agent chụp màn hình bằng cách tạo command capturescreen
  requestScreenshot: async (agentId: string, token?: string): Promise<{ success: boolean; commandId?: string; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body = {
        commandType: 'capturescreen',
        commandParams: {}
      };

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/commands`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to request screenshot' };
      }
      return { success: true, commandId: data?.commandId || null };
    } catch (err: any) {
      console.log(`Mock requestScreenshot for agent ${agentId}`);
      return new Promise(resolve => setTimeout(() => resolve({ success: true, commandId: Date.now().toString() }), 300));
    }
  },

  // Lấy danh sách screenshots cho agent (mới: dùng /capture-screen)
  getScreenshots: async (agentId: string, limit = 50, token?: string): Promise<{ success: boolean; screenshots?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/capture-screen?limit=${encodeURIComponent(String(limit))}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch screenshots' };
      }

      // normalize many possible shapes into items array
      const rawItems = Array.isArray(data) ? data : data?.screenshots || data?.items || data?.data || [];
      const normalized = (rawItems || []).map((it: any) => {
        const filePath = it.file_path || it.path || it.filePath || null;
        let url = it.url || it.screenshot_url || it.capture_url || null;
        if (!url && filePath && typeof filePath === 'string') {
          const base = String(BASE_URL || '').replace(/\/$/, '');
          // If backend stores files under backend/src/data/screenshots, they are commonly served under /data/screenshots.
          // Map "/screenshots/..." -> "${BASE_URL}/data/screenshots/..." so the image src resolves to the served file.
          if (filePath.startsWith('/screenshots')) {
            url = `${base}/data${filePath}`;
          } else {
            url = filePath.startsWith('http') ? filePath : `${base}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
          }
        }
        return {
          ...it,
          id: it.id ?? it.screenshot_id ?? it.capture_id,
          url,
          timestamp: it.created_at ?? it.createdAt ?? it.timestamp ?? it.time ?? null
        };
      });

      return { success: true, screenshots: normalized };
    } catch (err: any) {
      console.log(`Mock getScreenshots for agent ${agentId}`);
      return { success: true, screenshots: [] };
    }
  },

  // Lấy screenshots cho agent trong khoảng thời gian (timeStart, timeEnd)
  getScreenshotsByTimeRange: async (agentId: string, timeStart: string, timeEnd: string, token?: string): Promise<{ success: boolean; screenshots?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/capture-screen/${encodeURIComponent(timeStart)}/${encodeURIComponent(timeEnd)}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch screenshots by time range' };
      }

      const rawItems = Array.isArray(data) ? data : data?.screenshots || data?.items || data?.data || [];
      const normalized = (rawItems || []).map((it: any) => {
        const filePath = it.file_path || it.path || it.filePath || null;
        let url = it.url || it.screenshot_url || it.capture_url || null;
        if (!url && filePath && typeof filePath === 'string') {
          const base = String(BASE_URL || '').replace(/\/$/, '');
          if (filePath.startsWith('/screenshots')) {
            url = `${base}/data${filePath}`;
          } else {
            url = filePath.startsWith('http') ? filePath : `${base}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
          }
        }
        return {
          ...it,
          id: it.id ?? it.screenshot_id ?? it.capture_id,
          url,
          timestamp: it.created_at ?? it.createdAt ?? it.timestamp ?? it.time ?? null
        };
      });

      return { success: true, screenshots: normalized };
    } catch (err: any) {
      console.log(`Mock getScreenshotsByTimeRange for agent ${agentId} (${timeStart} - ${timeEnd})`);
      return { success: true, screenshots: [] };
    }
  },

  getAgentPowerUsage: async (agentId: string, timeStart: string, timeEnd: string, token?: string): Promise<{ success: boolean; usage?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/power-usage/${encodeURIComponent(timeStart)}/${encodeURIComponent(timeEnd)}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch power usage' };
      }
      // backend may return { usage: [...] } or similar
      return { success: true, usage: data?.usage || data?.data || data?.powerUsage || [] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  getAgentProcessUsage: async (agentId: string, timeStart: string, timeEnd: string, token?: string): Promise<{ success: boolean; usage?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/process-usage/${encodeURIComponent(timeStart)}/${encodeURIComponent(timeEnd)}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch process usage' };
      }
      return { success: true, usage: data?.usage || data?.data || data?.processUsage || data?.processes || [] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  getAgentTopApplications: async (agentId: string, timeStart: string, timeEnd: string, token?: string): Promise<{ success: boolean; apps?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/applications-top/${encodeURIComponent(timeStart)}/${encodeURIComponent(timeEnd)}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch top applications' };
      }
      // prefer backend field "topApplications" when present
      const apps = data?.topApplications || data?.apps || data?.usage || data?.data || data?.topApps || [];
      return { success: true, apps };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  // fetch full applications list for a given time range, including total_usage per app
  getAgentApplicationsWithUsage: async (agentId: string, timeStart: string, timeEnd: string, token?: string): Promise<{ success: boolean; applications?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/applications/${encodeURIComponent(timeStart)}/${encodeURIComponent(timeEnd)}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch applications' };
      }
      // try common shapes: applications, apps, data, items, or topApplications (fallback)
      const applications = data?.applicationsUsage || data?.apps || data?.data || data?.items || data?.applicationsWithUsage || data?.topApplications || [];
      return { success: true, applications };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  // set daily limit for a single application for an agent
  setAgentApplicationLimit: async (agentId: string, appId: string, dailyLimitMinutes: number, token?: string): Promise<{ success: boolean; application?: any; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const body = { appId: appId, limitMinutes: dailyLimitMinutes };
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/applications-limit`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to set application limit' };
      }
      // backend may return updated application under various keys
      const application = data?.application || data?.updated || data?.app || data?.data || null;
      return { success: true, application };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  // New: specifically call GET /api/agents/:agentId/status and return simplified shape
  getAgentOnlineStatus: async (agentId: string, token?: string): Promise<{ success: boolean; data?: { online?: boolean; lastSeen?: string; status?: any; raw?: any; message?: string }; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/status`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch agent online status' };
      }

      const raw = data ?? null;
      const out: any = { raw };

      // If backend returns { agentId, status: ... } then status may be "online" or a timestamp
      const candidate = raw && typeof raw === 'object' && raw.status !== undefined ? raw.status : raw;

      // handle primitive string/number candidate first
      if (typeof candidate === 'string') {
        out.status = candidate;
        const s = candidate.toLowerCase();
        if (s === 'online' || s === 'offline') {
          out.online = s === 'online';
        } else if (!isNaN(Date.parse(candidate))) {
          out.lastSeen = new Date(candidate).toISOString();
        } else if (!isNaN(Number(candidate))) {
          const n = Number(candidate);
          out.lastSeen = (n > 1e12 ? new Date(n).toISOString() : new Date(n * 1000).toISOString());
        } else {
          out.message = candidate;
        }
      } else if (typeof candidate === 'number') {
        out.status = candidate;
        const n = candidate;
        out.lastSeen = (n > 1e12 ? new Date(n).toISOString() : new Date(n * 1000).toISOString());
      } else if (raw && typeof raw === 'object') {
        // object case: try common fields
        out.status = raw.status ?? raw.state ?? null;

        if (typeof raw.online === 'boolean') {
          out.online = raw.online;
        } else if (typeof raw.status === 'string') {
          const s = String(raw.status).toLowerCase();
          if (s === 'online' || s === 'offline') out.online = s === 'online';
          else if (!isNaN(Date.parse(raw.status))) out.lastSeen = new Date(raw.status).toISOString();
          else if (!isNaN(Number(raw.status))) {
            const n = Number(raw.status);
            out.lastSeen = (n > 1e12 ? new Date(n).toISOString() : new Date(n * 1000).toISOString());
          }
        }

        const last = raw.lastSeen ?? raw.last_seen ?? raw.last_active ?? raw.lastActive ?? raw.timestamp ?? raw.time ?? null;
        if (last != null) {
          if (typeof last === 'number') {
            out.lastSeen = (last > 1e12 ? new Date(last).toISOString() : new Date(last * 1000).toISOString());
          } else if (typeof last === 'string' && !isNaN(Date.parse(last))) {
            out.lastSeen = new Date(last).toISOString();
          } else {
            out.lastSeenRaw = last;
          }
        }

        if (raw.message) out.message = raw.message;
      }

      return { success: true, data: out };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  // New: delete a screenshot by id (attempt real DELETE, fallback to mock success)
  deleteScreenshot: async (agentId: string, screenshotId: string | number, token?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/capture-screen/${encodeURIComponent(String(screenshotId))}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to delete screenshot' };
      }
      return { success: true };
    } catch (err: any) {
      // mock/offline fallback: simulate deletion
      console.log(`Mock deleteScreenshot for agent ${agentId} id=${screenshotId}`);
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));
    }
  },

  getAppPoliciesByAgentId: async (agentId: string, token?: string): Promise<AppPolicy[]> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/app-policies`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to fetch app policies');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching app policies:', error);
      throw error;
    }
  },

  // Merge apps with their policies
  getAppsWithPolicies: async (
    agentId: string,
    timeStart: string,
    timeEnd: string,
    token?: string
  ): Promise<MergedAppData[]> => {
    try {
      const apps = await mockAPI.getAgentApplicationsWithUsage(agentId, timeStart, timeEnd, token);
      const policies = await mockAPI.getAppPoliciesByAgentId(agentId, token);
      // Create a map for faster lookup
      const policyMap = new Map(policies.map(p => [p.installed_app_id, p]));
      console.log(policyMap);
      // Merge apps with policies
      return apps?.applications.map(app => ({
        ...app,
        policy: policyMap.get(app.installed_app_id)
      }));
    }
    catch (error) {
      console.error('Error fetching apps with policies:', error);
      throw error;
    }
  },

  // Save or update app policy
  saveAppPolicy: async (
    agentId: string,
    appId: number,
    config: {
      isBlocked: boolean;
      limitEnabled: boolean;
      limitMinutes: number;
      actionOnLimit: 'close' | 'warn' | 'none';
      warnInterval: number;
    }, token?: string
  ): Promise<AppPolicy> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/app-policies`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          installed_app_id: appId,
          is_blocked: config.isBlocked,
          limit_enabled: config.limitEnabled,
          limit_minutes: config.limitMinutes,
          action_on_limit: config.actionOnLimit,
          warn_interval: config.warnInterval
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || errorData?.message || 'Failed to save app policy');
      }

      const data = await res.json().catch(() => ({}));
      return data;
    } catch (error) {
      console.error('Error saving app policy:', error);
      throw error;
    }
  },


};
