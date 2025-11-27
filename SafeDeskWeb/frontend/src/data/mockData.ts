import { AppInfo, Process, Screenshot, BrowserHistory, UsageLimit, User, Device, CategoryLabel, ActivitySession, DailySchedule, AppUsageDaily } from '../types';

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

// Generate realistic browser history with thousands of entries
const generateBrowserHistory = (): BrowserHistory[] => {
  const websites = [
    { url: 'https://github.com/facebook/react', title: 'React - A JavaScript library for building user interfaces', browser: 'Chrome' },
    { url: 'https://stackoverflow.com/questions/tagged/javascript', title: 'Newest JavaScript Questions - Stack Overflow', browser: 'Chrome' },
    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'How to Learn React in 2024 - YouTube', browser: 'Chrome' },
    { url: 'https://www.google.com/search?q=react+hooks', title: 'react hooks - Google Search', browser: 'Chrome' },
    { url: 'https://www.facebook.com/', title: 'Facebook - log in or sign up', browser: 'Edge' },
    { url: 'https://twitter.com/home', title: 'Home / X', browser: 'Chrome' },
    { url: 'https://www.linkedin.com/feed/', title: 'LinkedIn', browser: 'Edge' },
    { url: 'https://www.reddit.com/r/programming/', title: 'r/programming - Reddit', browser: 'Firefox' },
    { url: 'https://news.ycombinator.com/', title: 'Hacker News', browser: 'Chrome' },
    { url: 'https://dev.to/', title: 'DEV Community', browser: 'Chrome' },
    { url: 'https://medium.com/', title: 'Medium - Where good ideas find you', browser: 'Edge' },
    { url: 'https://www.npmjs.com/', title: 'npm - Node Package Manager', browser: 'Chrome' },
    { url: 'https://tailwindcss.com/docs', title: 'Tailwind CSS Documentation', browser: 'Chrome' },
    { url: 'https://react.dev/', title: 'React Docs', browser: 'Chrome' },
    { url: 'https://www.typescriptlang.org/', title: 'TypeScript: JavaScript With Syntax For Types', browser: 'Chrome' },
    { url: 'https://vitejs.dev/', title: 'Vite - Next Generation Frontend Tooling', browser: 'Chrome' },
    { url: 'https://supabase.com/docs', title: 'Supabase Documentation', browser: 'Chrome' },
    { url: 'https://vercel.com/', title: 'Vercel: Develop. Preview. Ship.', browser: 'Chrome' },
    { url: 'https://www.figma.com/', title: 'Figma: The Collaborative Interface Design Tool', browser: 'Chrome' },
    { url: 'https://www.notion.so/', title: 'Notion - Your wiki, docs & projects', browser: 'Edge' },
    { url: 'https://discord.com/channels/@me', title: 'Discord | Your Place to Talk', browser: 'Chrome' },
    { url: 'https://slack.com/', title: 'Slack - Where work happens', browser: 'Chrome' },
    { url: 'https://mail.google.com/', title: 'Gmail', browser: 'Chrome' },
    { url: 'https://calendar.google.com/', title: 'Google Calendar', browser: 'Chrome' },
    { url: 'https://drive.google.com/', title: 'Google Drive', browser: 'Chrome' },
    { url: 'https://www.udemy.com/', title: 'Online Courses - Learn Anything, On Your Schedule | Udemy', browser: 'Edge' },
    { url: 'https://www.coursera.org/', title: 'Coursera | Degrees, Certificates, & Free Online Courses', browser: 'Chrome' },
    { url: 'https://www.codecademy.com/', title: 'Learn to Code - for Free | Codecademy', browser: 'Chrome' },
    { url: 'https://www.freecodecamp.org/', title: 'freeCodeCamp.org', browser: 'Chrome' },
    { url: 'https://leetcode.com/', title: 'LeetCode - The World\'s Leading Online Programming Platform', browser: 'Chrome' },
    { url: 'https://www.hackerrank.com/', title: 'HackerRank', browser: 'Chrome' },
    { url: 'https://www.codewars.com/', title: 'Codewars - Achieve mastery through coding practice', browser: 'Firefox' },
    { url: 'https://www.amazon.com/', title: 'Amazon.com: Online Shopping for Electronics, Apparel', browser: 'Edge' },
    { url: 'https://www.netflix.com/', title: 'Netflix Vietnam - Watch TV Shows Online', browser: 'Edge' },
    { url: 'https://www.spotify.com/', title: 'Spotify - Web Player', browser: 'Chrome' },
    { url: 'https://www.twitch.tv/', title: 'Twitch', browser: 'Chrome' },
    { url: 'https://www.pinterest.com/', title: 'Pinterest', browser: 'Chrome' },
    { url: 'https://www.instagram.com/', title: 'Instagram', browser: 'Edge' },
    { url: 'https://www.tiktok.com/', title: 'TikTok', browser: 'Chrome' },
    { url: 'chrome://settings/', title: 'Settings - Chrome', browser: 'Chrome' },
    { url: 'edge://settings/', title: 'Settings - Microsoft Edge', browser: 'Edge' },
    { url: 'about:config', title: 'Configuration Editor - Firefox', browser: 'Firefox' },
  ];

  const history: BrowserHistory[] = [];
  const now = Date.now();
  const daysToGenerate = 90; // 3 months
  let id = 1;

  // Generate entries for the past 90 days
  for (let day = 0; day < daysToGenerate; day++) {
    const dayStart = now - (day * 24 * 60 * 60 * 1000);
    const entriesPerDay = Math.floor(Math.random() * 50) + 30; // 30-80 entries per day

    for (let i = 0; i < entriesPerDay; i++) {
      const website = websites[Math.floor(Math.random() * websites.length)];
      const timestamp = dayStart - (Math.random() * 24 * 60 * 60 * 1000); // Random time during the day
      const visitCount = Math.floor(Math.random() * 20) + 1;
      const typedCount = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
      const hidden = Math.random() > 0.95;

      history.push({
        id: id++,
        agent_id: 'device-1',
        url: website.url,
        title: website.title,
        visit_count: visitCount,
        typed_count: typedCount,
        last_visit_time: Math.floor(timestamp * 1000), // Convert to microseconds
        hidden: hidden,
        browser_name: website.browser,
        created_at: new Date(timestamp).toISOString()
      });
    }
  }

  // Sort by most recent first
  return history.sort((a, b) => b.last_visit_time - a.last_visit_time);
};

export const mockBrowserHistory: BrowserHistory[] = generateBrowserHistory();

export const mockUsageLimits: UsageLimit[] = [
  { id: '1', name: 'Google Chrome', type: 'app', appId: '2', limitMinutes: 180, usedMinutes: 156 },
  { id: '2', name: 'League of Legends', type: 'app', appId: '6', limitMinutes: 90, usedMinutes: 72 },
  { id: '3', name: 'Discord', type: 'app', appId: '8', limitMinutes: 120, usedMinutes: 95 }
];

export const mockUsageByCategory = [
  { name: 'Công việc', value: 285, color: '#3B82F6' },
  { name: 'Giải trí', value: 156, color: '#EF4444' },
  { name: 'Học tập', value: 98, color: '#10B981' },
  { name: 'Khác', value: 67, color: '#6B7280' }
];

export const mockUsageByHour = [
  { hour: '0h', minutes: 0 },
  { hour: '1h', minutes: 0 },
  { hour: '2h', minutes: 0 },
  { hour: '3h', minutes: 0 },
  { hour: '4h', minutes: 0 },
  { hour: '5h', minutes: 0 },
  { hour: '6h', minutes: 5 },
  { hour: '7h', minutes: 12 },
  { hour: '8h', minutes: 15 },
  { hour: '9h', minutes: 42 },
  { hour: '10h', minutes: 65 },
  { hour: '11h', minutes: 58 },
  { hour: '12h', minutes: 25 },
  { hour: '13h', minutes: 38 },
  { hour: '14h', minutes: 72 },
  { hour: '15h', minutes: 54 },
  { hour: '16h', minutes: 48 },
  { hour: '17h', minutes: 35 },
  { hour: '18h', minutes: 28 },
  { hour: '19h', minutes: 42 },
  { hour: '20h', minutes: 55 },
  { hour: '21h', minutes: 38 },
  { hour: '22h', minutes: 20 },
  { hour: '23h', minutes: 8 }
];

export const mockUsageByDay = [
  { day: '1', minutes: 320 },
  { day: '2', minutes: 285 },
  { day: '3', minutes: 412 },
  { day: '4', minutes: 378 },
  { day: '5', minutes: 445 },
  { day: '6', minutes: 520 },
  { day: '7', minutes: 380 },
  { day: '8', minutes: 395 },
  { day: '9', minutes: 410 },
  { day: '10', minutes: 365 },
  { day: '11', minutes: 430 },
  { day: '12', minutes: 385 },
  { day: '13', minutes: 475 },
  { day: '14', minutes: 390 },
  { day: '15', minutes: 405 },
  { day: '16', minutes: 420 },
  { day: '17', minutes: 355 },
  { day: '18', minutes: 440 },
  { day: '19', minutes: 400 },
  { day: '20', minutes: 415 },
  { day: '21', minutes: 460 },
  { day: '22', minutes: 370 },
  { day: '23', minutes: 425 },
  { day: '24', minutes: 395 },
  { day: '25', minutes: 450 },
  { day: '26', minutes: 410 },
  { day: '27', minutes: 435 },
  { day: '28', minutes: 380 },
  { day: '29', minutes: 465 },
  { day: '30', minutes: 420 }
];

export const mockUsageByWeek = [
  { week: 'T1', minutes: 2740 },
  { week: 'T2', minutes: 2815 },
  { week: 'T3', minutes: 2690 },
  { week: 'T4', minutes: 2945 }
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
  { name: 'Notion', time: '1h 24m', percentage: 9 },
  { name: 'Figma', time: '58m', percentage: 6 }
];

export const mockTopWebsites = [
  { name: 'github.com', visits: 245, time: '2h 45m', percentage: 32 },
  { name: 'stackoverflow.com', visits: 156, time: '1h 52m', percentage: 22 },
  { name: 'youtube.com', visits: 89, time: '1h 34m', percentage: 18 },
  { name: 'reddit.com', visits: 67, time: '1h 12m', percentage: 14 },
  { name: 'twitter.com', visits: 52, time: '48m', percentage: 9 },
  { name: 'facebook.com', visits: 34, time: '32m', percentage: 5 }
];

// Helper function to get total count
export const getTotalBrowserHistoryCount = () => mockBrowserHistory.length;

export const mockDailySchedules: DailySchedule[] = [
  { id: '1', dayOfWeek: 1, dayName: 'Thứ 2', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '2', dayOfWeek: 2, dayName: 'Thứ 3', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '3', dayOfWeek: 3, dayName: 'Thứ 4', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '4', dayOfWeek: 4, dayName: 'Thứ 5', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '5', dayOfWeek: 5, dayName: 'Thứ 6', enabled: true, startTime: '08:00', endTime: '22:00' },
  { id: '6', dayOfWeek: 6, dayName: 'Thứ 7', enabled: false, startTime: '09:00', endTime: '21:00' },
  { id: '7', dayOfWeek: 0, dayName: 'Chủ nhật', enabled: false, startTime: '09:00', endTime: '21:00' }
];

export const mockAppUsageDaily: AppUsageDaily[] = [
  { id: '1', appName: 'Google Chrome', icon: '🌐', date: '2025-11-19', minutesUsed: 145, category: 'other', limitMinutes: 180 },
  { id: '2', appName: 'Visual Studio Code', icon: '💻', date: '2025-11-19', minutesUsed: 220, category: 'office', limitMinutes: 300 },
  { id: '3', appName: 'Discord', icon: '💬', date: '2025-11-19', minutesUsed: 85, category: 'other', limitMinutes: 120 },
  { id: '4', appName: 'Spotify', icon: '🎵', date: '2025-11-19', minutesUsed: 65, category: 'other' },
  { id: '5', appName: 'League of Legends', icon: '🎮', date: '2025-11-19', minutesUsed: 110, category: 'game', limitMinutes: 90 },
  { id: '6', appName: 'Microsoft Word', icon: '📝', date: '2025-11-19', minutesUsed: 45, category: 'office' },
  { id: '7', appName: 'Photoshop', icon: '🎨', date: '2025-11-19', minutesUsed: 95, category: 'other' },
  { id: '8', appName: 'Notion', icon: '📋', date: '2025-11-19', minutesUsed: 52, category: 'office' },
  { id: '9', appName: 'Zoom', icon: '📹', date: '2025-11-19', minutesUsed: 30, category: 'office' },
  { id: '10', appName: 'Calculator', icon: '🔢', date: '2025-11-19', minutesUsed: 3, category: 'system' },
  { id: '11', appName: 'Google Chrome', icon: '🌐', date: '2025-11-18', minutesUsed: 160, category: 'other', limitMinutes: 180 },
  { id: '12', appName: 'Visual Studio Code', icon: '💻', date: '2025-11-18', minutesUsed: 280, category: 'office', limitMinutes: 300 },
  { id: '13', appName: 'Discord', icon: '💬', date: '2025-11-18', minutesUsed: 95, category: 'other', limitMinutes: 120 },
  { id: '14', appName: 'League of Legends', icon: '🎮', date: '2025-11-18', minutesUsed: 75, category: 'game', limitMinutes: 90 },
  { id: '15', appName: 'Spotify', icon: '🎵', date: '2025-11-18', minutesUsed: 55, category: 'other' }
];
