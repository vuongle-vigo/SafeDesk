export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'tablet';
  os: string;
  status: 'online' | 'offline' | 'idle';
  lastActive: string;
  ipAddress: string;
}

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  size: string;
  lastUsed: string;
  category: 'system' | 'game' | 'office' | 'education' | 'other';
  usageCount: number;
  deviceId: string;
}

export interface Process {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  uptime: string;
  status: 'running' | 'stopped';
}

export interface ActivitySession {
  id: string;
  appName: string;
  windowTitle: string;
  processName: string;
  startTime: string;
  duration: number;
  icon: string;
  category: 'system' | 'game' | 'office' | 'education' | 'other';
}

export interface Screenshot {
  id: string;
  url: string;
  timestamp: string;
}

export interface BrowserHistory {
  id: number;
  agent_id: string;
  url: string;
  title: string;
  visit_count: number;
  typed_count: number;
  last_visit_time: number;
  hidden: boolean;
  browser_name: string;
  created_at: string;
}

export interface UsageLimit {
  id: string;
  name: string;
  type: 'category' | 'app';
  category?: string;
  appId?: string;
  limitMinutes: number;
  usedMinutes: number;
}

export interface AppUsageDaily {
  id: string;
  appName: string;
  icon: string;
  date: string;
  minutesUsed: number;
  category: 'system' | 'game' | 'office' | 'education' | 'other';
  limitMinutes?: number;
}

export interface DailySchedule {
  id: string;
  dayOfWeek: number;
  dayName: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface User {
  name: string;
  email: string;
  role: 'Admin' | 'User';
  avatar: string;
}

export interface CategoryLabel {
  id: string;
  category: string;
  label: string;
  color: string;
}
