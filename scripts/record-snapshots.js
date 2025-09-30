#!/usr/bin/env node

/**
 * Snapshot Recording Script
 * 
 * This script authenticates with the backend and captures all API responses
 * to create frozen snapshots of the current application state.
 * 
 * Usage: node scripts/record-snapshots.js
 */

const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const SNAPSHOTS_DIR = path.join(__dirname, '../src/data/snapshots');

// Demo credentials (same as in demo mode)
const DEMO_CREDENTIALS = {
  username: 'Yuehan_Z',
  password: 'yuehantest'
};

let authToken = null;

// Ensure snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  console.log(`📡 Fetching: ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Error fetching ${endpoint}:`, response.status, data);
      return null;
    }

    console.log(`✅ Success: ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Network error fetching ${endpoint}:`, error.message);
    return null;
  }
}

// Filter function to remove branded content
function shouldFilterItem(item) {
  const searchTerms = ['Propel2Excel', 'P2E', 'Propel'];
  const textToSearch = JSON.stringify(item).toLowerCase();
  
  return searchTerms.some(term => textToSearch.includes(term.toLowerCase()));
}

// Filter branded content from data
function filterBrandedContent(data, filename) {
  // If data is an array, filter out branded items
  if (Array.isArray(data)) {
    const originalCount = data.length;
    const filtered = data.filter(item => !shouldFilterItem(item));
    const removedCount = originalCount - filtered.length;
    
    if (removedCount > 0) {
      console.log(`   🧹 Filtered ${removedCount} branded item(s) from ${filename}`);
    }
    
    return filtered;
  }
  
  // If data is an object, recursively filter arrays within it
  if (typeof data === 'object' && data !== null) {
    const result = { ...data };
    let totalRemoved = 0;
    
    for (const key in result) {
      if (Array.isArray(result[key])) {
        const originalCount = result[key].length;
        result[key] = result[key].filter(item => !shouldFilterItem(item));
        const removedCount = originalCount - result[key].length;
        totalRemoved += removedCount;
      }
    }
    
    if (totalRemoved > 0) {
      console.log(`   🧹 Filtered ${totalRemoved} branded item(s) from ${filename}`);
    }
    
    return result;
  }
  
  // For other data types, return as-is
  return data;
}

// Save snapshot to file
function saveSnapshot(filename, data) {
  // Filter out branded content before saving
  const filteredData = filterBrandedContent(data, filename);
  
  const filepath = path.join(SNAPSHOTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(filteredData, null, 2));
  console.log(`💾 Saved: ${filename}`);
}

// Main recording function
async function recordSnapshots() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                  🎬 SNAPSHOT RECORDING STARTING                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Authenticate
  console.log('🔐 Authenticating with demo credentials...');
  const loginResponse = await apiRequest('/users/login/', {
    method: 'POST',
    body: JSON.stringify(DEMO_CREDENTIALS),
  });

  if (!loginResponse || !loginResponse.tokens) {
    console.error('❌ Failed to authenticate. Cannot proceed with snapshot recording.');
    process.exit(1);
  }

  authToken = loginResponse.tokens.access;
  console.log('✅ Authentication successful!\n');

  // Step 2: Capture all API endpoints
  console.log('📸 Capturing API snapshots...\n');

  const snapshots = [
    // User & Profile
    { endpoint: '/users/profile/', filename: 'profile.json' },
    { endpoint: '/users/discord_verification/', filename: 'discord-verification.json' },
    { endpoint: '/user-preferences/', filename: 'user-preferences.json' },
    
    // Dashboard Data
    { endpoint: '/dashboard/stats/?period=30days', filename: 'dashboard-stats.json' },
    { endpoint: '/dashboard/stats/?period=7days', filename: 'dashboard-stats-7days.json' },
    { endpoint: '/dashboard/stats/?period=90days', filename: 'dashboard-stats-90days.json' },
    
    // Points & Timeline
    { endpoint: '/points/timeline/?granularity=daily&days=30', filename: 'points-timeline.json' },
    { endpoint: '/points/timeline/?granularity=weekly&days=90', filename: 'points-timeline-weekly.json' },
    { endpoint: '/points-logs/', filename: 'points-logs.json' },
    
    // Activity Feed
    { endpoint: '/activity/feed/?limit=10', filename: 'activity-feed-10.json' },
    { endpoint: '/activity/feed/?limit=50', filename: 'activity-feed-50.json' },
    { endpoint: '/activity/feed/', filename: 'activity-feed-full.json' },
    
    // Leaderboard
    { endpoint: '/leaderboard/?limit=10&period=all_time', filename: 'leaderboard.json' },
    { endpoint: '/leaderboard/?limit=10&period=monthly', filename: 'leaderboard-monthly.json' },
    { endpoint: '/leaderboard/?limit=10&period=weekly', filename: 'leaderboard-weekly.json' },
    
    // Activities & Rewards
    { endpoint: '/activities/', filename: 'activities.json' },
    { endpoint: '/incentives/', filename: 'incentives.json' },
    { endpoint: '/rewards/available/', filename: 'rewards-available.json' },
    { endpoint: '/redemptions/', filename: 'redemptions.json' },
    { endpoint: '/redemptions/history/', filename: 'redemptions-history.json' },
    
    // Tracks
    { endpoint: '/tracks/', filename: 'tracks.json' },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const { endpoint, filename } of snapshots) {
    const data = await apiRequest(endpoint);
    if (data !== null) {
      saveSnapshot(filename, data);
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Step 3: Summary
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     ✅ SNAPSHOT RECORDING COMPLETE                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Success: ${successCount} snapshots`);
  console.log(`❌ Failed: ${failCount} snapshots`);
  console.log(`📁 Location: ${SNAPSHOTS_DIR}\n`);

  if (failCount > 0) {
    console.log('⚠️  Some snapshots failed. The app will still work, but may be missing data.');
    console.log('   Check the errors above and ensure the backend is running.\n');
  }

  console.log('🎯 Stable mode usage (frozen state):');
  console.log('   http://localhost:3000/?stable=true\n');
  console.log('🛡️  Automatic fallback is always enabled (no parameter needed).\n');
}

// Run the script
recordSnapshots().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
