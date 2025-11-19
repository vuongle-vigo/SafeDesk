export const BASE_URL =
  // Vite
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  // Create React App
  process.env.REACT_APP_API_URL ||
  // Next.js
  process.env.NEXT_PUBLIC_API_URL ||
  // fallback to empty -> same origin
  '';

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

  // Lấy danh sách screenshots cho agent
  getScreenshots: async (agentId: string, limit = 50, token?: string): Promise<{ success: boolean; screenshots?: any[]; error?: string }> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/api/agents/${encodeURIComponent(agentId)}/screenshots?limit=${encodeURIComponent(String(limit))}`, {
        method: 'GET',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || data?.message || 'Failed to fetch screenshots' };
      }
      return { success: true, screenshots: data?.screenshots || data?.items || data || [] };
    } catch (err: any) {
      console.log(`Mock getScreenshots for agent ${agentId}`);
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
  }
};
