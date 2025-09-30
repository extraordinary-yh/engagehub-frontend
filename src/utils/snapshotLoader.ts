/**
 * Snapshot Loader Utility
 * 
 * Loads frozen API response snapshots from static JSON files.
 * Used for snapshot mode and automatic fallback on API errors.
 */

// Snapshot data - dynamically imported to avoid build-time errors if files don't exist
const snapshots: Record<string, any> = {};

// Check if we're in stable mode (using frozen snapshots)
export function isSnapshotMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('stable') === 'true';
}

// Map endpoints to snapshot filenames
function getSnapshotFilename(endpoint: string): string | null {
  // Normalize endpoint
  const normalized = endpoint.split('?')[0]; // Remove query params for matching
  
  // Mapping of endpoints to snapshot files
  const mappings: Record<string, string> = {
    '/users/profile/': 'profile.json',
    '/users/discord_verification/': 'discord-verification.json',
    '/user-preferences/': 'user-preferences.json',
    '/activities/': 'activities.json',
    '/points-logs/': 'points-logs.json',
    '/incentives/': 'incentives.json',
    '/rewards/available/': 'rewards-available.json',
    '/redemptions/': 'redemptions.json',
    '/redemptions/history/': 'redemptions-history.json',
    '/tracks/': 'tracks.json',
  };

  // Special handling for endpoints with query parameters
  if (endpoint.includes('/dashboard/stats/')) {
    if (endpoint.includes('period=7days')) return 'dashboard-stats-7days.json';
    if (endpoint.includes('period=90days')) return 'dashboard-stats-90days.json';
    return 'dashboard-stats.json'; // Default to 30days
  }

  if (endpoint.includes('/points/timeline/')) {
    if (endpoint.includes('granularity=weekly')) return 'points-timeline-weekly.json';
    return 'points-timeline.json'; // Default to daily
  }

  if (endpoint.includes('/activity/feed/')) {
    if (endpoint.includes('limit=10')) return 'activity-feed-10.json';
    if (endpoint.includes('limit=50')) return 'activity-feed-50.json';
    return 'activity-feed-full.json'; // No limit = full
  }

  if (endpoint.includes('/leaderboard/')) {
    if (endpoint.includes('period=monthly')) return 'leaderboard-monthly.json';
    if (endpoint.includes('period=weekly')) return 'leaderboard-weekly.json';
    return 'leaderboard.json'; // Default to all_time
  }

  return mappings[normalized] || null;
}

// Load snapshot from file (silent operation)
export async function loadSnapshot(endpoint: string): Promise<any | null> {
  const filename = getSnapshotFilename(endpoint);
  
  if (!filename) {
    return null;
  }

  // Ensure we're only loading .json files
  if (!filename.endsWith('.json')) {
    return null;
  }

  // Check cache first
  if (snapshots[filename]) {
    return snapshots[filename];
  }

  try {
    // Dynamically import the snapshot JSON file
    const snapshot = await import(`@/data/snapshots/${filename}`);
    snapshots[filename] = snapshot.default || snapshot;
    return snapshots[filename];
  } catch (error) {
    return null;
  }
}

// Check if a snapshot exists for an endpoint
export async function hasSnapshot(endpoint: string): Promise<boolean> {
  const filename = getSnapshotFilename(endpoint);
  if (!filename) return false;

  // Check cache first
  if (snapshots[filename]) return true;

  try {
    await import(`@/data/snapshots/${filename}`);
    return true;
  } catch {
    return false;
  }
}

// Preload all snapshots (optional, for better performance)
export async function preloadSnapshots(): Promise<void> {
  const snapshotFiles = [
    'profile.json',
    'dashboard-stats.json',
    'activity-feed-10.json',
    'leaderboard.json',
    'activities.json',
    'incentives.json',
    'redemptions.json',
    'tracks.json',
  ];

  console.log('📸 Preloading snapshots...');
  
  for (const filename of snapshotFiles) {
    try {
      const snapshot = await import(`@/data/snapshots/${filename}`);
      snapshots[filename] = snapshot.default || snapshot;
    } catch (error) {
      // Silently skip missing snapshots
    }
  }
  
  console.log(`📸 Preloaded ${Object.keys(snapshots).length} snapshots`);
}
