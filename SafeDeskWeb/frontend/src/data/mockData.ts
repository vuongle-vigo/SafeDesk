import { AppInfo, Process, Screenshot, BrowserHistory, UsageLimit, User, Device, CategoryLabel, ActivitySession, DailySchedule } from '../types';

export const mockUser: User = {
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@example.com',
  role: 'Admin',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'
};

export const mockDevices: Device[] = [
  {
    id: 'device-1',
    name: 'PC phòng làm việc',
    type: 'desktop',
    os: 'Windows 11 Pro',
    status: 'online',
    lastActive: '2 phút trước',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'device-2',
    name: 'Laptop cá nhân',
    type: 'laptop',
    os: 'Windows 11 Home',
    status: 'online',
    lastActive: '5 phút trước',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'device-3',
    name: 'PC phòng ngủ',
    type: 'desktop',
    os: 'Windows 10 Pro',
    status: 'idle',
    lastActive: '30 phút trước',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'device-4',
    name: 'Laptop công ty',
    type: 'laptop',
    os: 'Windows 11 Pro',
    status: 'offline',
    lastActive: '2 giờ trước',
    ipAddress: '192.168.1.103'
  }
];

export const mockCategoryLabels: CategoryLabel[] = [
  { id: '1', category: 'system', label: 'Hệ thống', color: '#6B7280' },
  { id: '2', category: 'game', label: 'Game', color: '#8B5CF6' },
  { id: '3', category: 'office', label: 'Văn phòng', color: '#3B82F6' },
  { id: '4', category: 'education', label: 'Học tập', color: '#10B981' },
  { id: '5', category: 'other', label: 'Khác', color: '#F59E0B' }
];

export const mockApps: AppInfo[] = [
  { id: '1', name: 'Visual Studio Code', icon: '💻', size: '450 MB', lastUsed: '5 phút trước', category: 'office', usageCount: 245, deviceId: 'device-1' },
  { id: '2', name: 'Google Chrome', icon: '🌐', size: '320 MB', lastUsed: '2 phút trước', category: 'other', usageCount: 520, deviceId: 'device-1' },
  { id: '3', name: 'Microsoft Word', icon: '📝', size: '1.2 GB', lastUsed: '1 giờ trước', category: 'office', usageCount: 180, deviceId: 'device-1' },
  { id: '4', name: 'Photoshop', icon: '🎨', size: '2.5 GB', lastUsed: '30 phút trước', category: 'other', usageCount: 95, deviceId: 'device-1' },
  { id: '5', name: 'Spotify', icon: '🎵', size: '280 MB', lastUsed: 'Hôm qua', category: 'other', usageCount: 340, deviceId: 'device-1' },
  { id: '6', name: 'League of Legends', icon: '🎮', size: '12 GB', lastUsed: '2 giờ trước', category: 'game', usageCount: 156, deviceId: 'device-2' },
  { id: '7', name: 'Zoom', icon: '📹', size: '180 MB', lastUsed: '4 giờ trước', category: 'office', usageCount: 88, deviceId: 'device-2' },
  { id: '8', name: 'Discord', icon: '💬', size: '250 MB', lastUsed: '10 phút trước', category: 'other', usageCount: 412, deviceId: 'device-2' },
  { id: '9', name: 'Notion', icon: '📋', size: '150 MB', lastUsed: '1 giờ trước', category: 'office', usageCount: 203, deviceId: 'device-3' },
  { id: '10', name: 'Calculator', icon: '🔢', size: '15 MB', lastUsed: '3 giờ trước', category: 'system', usageCount: 45, deviceId: 'device-3' }
];

export const mockProcesses: Process[] = [
  { id: '1', name: 'chrome.exe', cpu: 12.5, ram: 1250, uptime: '2h 15m', status: 'running' },
  { id: '2', name: 'Code.exe', cpu: 8.3, ram: 850, uptime: '4h 30m', status: 'running' },
  { id: '3', name: 'explorer.exe', cpu: 2.1, ram: 320, uptime: '8h 45m', status: 'running' },
  { id: '4', name: 'Discord.exe', cpu: 5.4, ram: 420, uptime: '1h 20m', status: 'running' },
  { id: '5', name: 'Spotify.exe', cpu: 3.2, ram: 280, uptime: '3h 10m', status: 'running' },
  { id: '6', name: 'node.exe', cpu: 15.8, ram: 640, uptime: '45m', status: 'running' },
  { id: '7', name: 'Teams.exe', cpu: 0.5, ram: 180, uptime: '6h 00m', status: 'stopped' },
  { id: '8', name: 'Photoshop.exe', cpu: 22.3, ram: 2100, uptime: '1h 35m', status: 'running' }
];

export const mockScreenshots: Screenshot[] = [
  { id: '1', url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', timestamp: '2025-11-11 14:30:25' },
  { id: '2', url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400', timestamp: '2025-11-11 14:15:10' },
  { id: '3', url: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400', timestamp: '2025-11-11 14:00:45' },
  { id: '4', url: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=400', timestamp: '2025-11-11 13:45:30' },
  { id: '5', url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400', timestamp: '2025-11-11 13:30:15' },
  { id: '6', url: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400', timestamp: '2025-11-11 13:15:00' }
];

export const mockBrowserHistory: BrowserHistory[] = [
  { id: '1', title: 'GitHub - Where the world builds software', domain: 'github.com', favicon: '🐙', timestamp: '14:30', visitCount: 45 },
  { id: '2', title: 'Stack Overflow - Where Developers Learn', domain: 'stackoverflow.com', favicon: '📚', timestamp: '14:25', visitCount: 78 },
  { id: '3', title: 'YouTube', domain: 'youtube.com', favicon: '▶️', timestamp: '14:20', visitCount: 156 },
  { id: '4', title: 'Google', domain: 'google.com', favicon: '🔍', timestamp: '14:15', visitCount: 234 },
  { id: '5', title: 'Facebook - log in or sign up', domain: 'facebook.com', favicon: '📘', timestamp: '14:10', visitCount: 89 },
  { id: '6', title: 'Twitter', domain: 'twitter.com', favicon: '🐦', timestamp: '14:05', visitCount: 67 },
  { id: '7', title: 'LinkedIn', domain: 'linkedin.com', favicon: '💼', timestamp: '14:00', visitCount: 42 },
  { id: '8', title: 'Reddit - Dive into anything', domain: 'reddit.com', favicon: '🤖', timestamp: '13:55', visitCount: 91 }
];

export const mockUsageLimits: UsageLimit[] = [
  { id: '1', name: 'Game', type: 'category', category: 'game', limitMinutes: 120, usedMinutes: 95 },
  { id: '2', name: 'Social Media', type: 'category', category: 'other', limitMinutes: 60, usedMinutes: 48 },
  { id: '3', name: 'Google Chrome', type: 'app', appId: '2', limitMinutes: 180, usedMinutes: 156 },
  { id: '4', name: 'League of Legends', type: 'app', appId: '6', limitMinutes: 90, usedMinutes: 72 }
];

export const mockUsageByCategory = [
  { name: 'Công việc', value: 285, color: '#3B82F6' },
  { name: 'Giải trí', value: 156, color: '#EF4444' },
  { name: 'Học tập', value: 98, color: '#10B981' },
  { name: 'Khác', value: 67, color: '#6B7280' }
];

export const mockUsageByHour = [
  { hour: '8h', minutes: 15 },
  { hour: '9h', minutes: 42 },
  { hour: '10h', minutes: 65 },
  { hour: '11h', minutes: 58 },
  { hour: '12h', minutes: 25 },
  { hour: '13h', minutes: 38 },
  { hour: '14h', minutes: 72 },
  { hour: '15h', minutes: 54 },
  { hour: '16h', minutes: 48 },
  { hour: '17h', minutes: 35 }
];

export const mockUsageByDay = [
  { day: 'T2', minutes: 320 },
  { day: 'T3', minutes: 285 },
  { day: 'T4', minutes: 412 },
  { day: 'T5', minutes: 378 },
  { day: 'T6', minutes: 445 },
  { day: 'T7', minutes: 520 },
  { day: 'CN', minutes: 380 }
];

export const mockUsageByWeek = [
  { week: 'T1', minutes: 2145 },
  { week: 'T2', minutes: 2320 },
  { week: 'T3', minutes: 2580 },
  { week: 'T4', minutes: 2410 }
];

export const mockUsageByMonth = [
  { month: 'T1', minutes: 9850 },
  { month: 'T2', minutes: 10200 },
  { month: 'T3', minutes: 11340 },
  { month: 'T4', minutes: 10920 },
  { month: 'T5', minutes: 12100 },
  { month: 'T6', minutes: 11580 }
];

export const mockActivitySessions: ActivitySession[] = [
  { id: '1', appName: 'Visual Studio Code', windowTitle: 'project.tsx - SafeDesk', processName: 'Code.exe', startTime: '14:30', duration: 25, icon: '💻', category: 'office' },
  { id: '2', appName: 'Google Chrome', windowTitle: 'GitHub - SafeDesk Repository', processName: 'chrome.exe', startTime: '14:55', duration: 12, icon: '🌐', category: 'other' },
  { id: '3', appName: 'Slack', windowTitle: 'Team Chat - #development', processName: 'slack.exe', startTime: '15:07', duration: 8, icon: '💬', category: 'office' },
  { id: '4', appName: 'Visual Studio Code', windowTitle: 'components.tsx - SafeDesk', processName: 'Code.exe', startTime: '15:15', duration: 45, icon: '💻', category: 'office' },
  { id: '5', appName: 'Spotify', windowTitle: 'Focus Flow Playlist', processName: 'Spotify.exe', startTime: '16:00', duration: 5, icon: '🎵', category: 'other' },
  { id: '6', appName: 'Google Chrome', windowTitle: 'Stack Overflow - React Hooks', processName: 'chrome.exe', startTime: '16:05', duration: 18, icon: '🌐', category: 'other' },
  { id: '7', appName: 'Discord', windowTitle: 'Dev Community Server', processName: 'Discord.exe', startTime: '16:23', duration: 15, icon: '💬', category: 'other' },
  { id: '8', appName: 'Visual Studio Code', windowTitle: 'App.tsx - SafeDesk', processName: 'Code.exe', startTime: '16:38', duration: 32, icon: '💻', category: 'office' }
];

export const mockTopApps = [
  { name: 'Google Chrome', time: '4h 32m', percentage: 28 },
  { name: 'Visual Studio Code', time: '3h 45m', percentage: 23 },
  { name: 'Discord', time: '2h 18m', percentage: 14 },
  { name: 'Spotify', time: '1h 56m', percentage: 12 },
  { name: 'Notion', time: '1h 24m', percentage: 9 }
];

export const mockDailySchedules: DailySchedule[] = [
  { id: '1', dayOfWeek: 1, dayName: 'Thứ 2', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '2', dayOfWeek: 2, dayName: 'Thứ 3', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '3', dayOfWeek: 3, dayName: 'Thứ 4', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '4', dayOfWeek: 4, dayName: 'Thứ 5', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '5', dayOfWeek: 5, dayName: 'Thứ 6', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '6', dayOfWeek: 6, dayName: 'Thứ 7', enabled: false, startTime: '09:00', endTime: '21:00' },
  { id: '7', dayOfWeek: 0, dayName: 'Chủ nhật', enabled: false, startTime: '09:00', endTime: '21:00' }
];
