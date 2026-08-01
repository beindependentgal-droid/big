import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Startup LocalStorage Migration: Run once to clean old legacy values permanently in client browser
// Map legacy / long image filenames used across the codebase to actual files in /public/images
const IMAGE_ALIASES: Record<string, string> = {
  'african_woman_portrait_1_1784708232425.jpg': 'african_woman_portrait.jpg',
  'african_woman_portrait_2_1784708246407.jpg': 'african_woman_portrait.jpg',
  'african_woman_portrait_3_1784708258772.jpg': 'african_woman_portrait.jpg',
  'african_woman_portrait_4_1784708270262.jpg': 'african_woman_portrait.jpg',
  'african_women_tech_collaboration_1784664040784.jpg': 'african_tech_collaboration.jpg',
  'african_woman_entrepreneur_portrait_1784664054544.jpg': 'african_woman_founder_portrait.jpg',
  'african_women_community_circle_1784704135356.jpg': 'african_women_community.jpg',
  'african_woman_learning_laptop_1784664067278.jpg': 'african_woman_masterclass.jpg',
  'african_women_mentorship_discussion_1784664078314.jpg': 'african_women_mentorship_lounge.jpg',
  'african_woman_leading_masterclass_1784704151649.jpg': 'african_woman_keynote_speaker.jpg',
  'african_mother_and_child_wellness_1784704199174.jpg': 'african_women_business_meeting.jpg',
};

function applyImageAliasesInString(s: string) {
  if (!s) return s;
  return Object.keys(IMAGE_ALIASES).reduce((acc, longName) => {
    const esc = longName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return acc.replace(new RegExp(esc, 'g'), IMAGE_ALIASES[longName]);
  }, s);
}
try {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      if (val && typeof val === 'string') {
        const hasLegacy = val.includes('src/assets/images/') || 
                          val.includes('assets/images/') || 
                          val.includes('female1.jpg') || 
                          val.includes('member-1.png') || 
                          val.includes('member-2.png') || 
                          val.includes('member-3.png') ||
                          val.includes('1784');
        if (hasLegacy) {
          const cleaned = val
            .replace(/\/public\/src\/assets\/images\//g, '/images/')
            .replace(/public\/src\/assets\/images\//g, '/images/')
            .replace(/\/src\/assets\/images\//g, '/images/')
            .replace(/src\/assets\/images\//g, '/images/')
            .replace(/\/assets\/images\//g, '/images/')
            .replace(/assets\/images\//g, '/images/')
            .replace(/female1\.jpg/g, 'african_woman_portrait.jpg')
            .replace(/member-1\.png/g, 'african_woman_portrait.jpg')
            .replace(/member-2\.png/g, 'african_woman_portrait.jpg')
            .replace(/member-3\.png/g, 'african_woman_portrait.jpg');
          // apply alias mapping so legacy long names map to actual files in /images
          const aliased = applyImageAliasesInString(cleaned);
          localStorage.setItem(key, aliased);
          console.log(`[Migration] Cleaned cached local storage key "${key}" successfully.`);
        }
      }
    }
  }
} catch (e) {
  console.error('[Migration] Failed to migrate local storage cache:', e);
}

// 2. Global localStorage interceptor to hot-fix any stale cached image asset paths
const originalGetItem = localStorage.getItem;
localStorage.getItem = function (key) {
  const val = originalGetItem.call(localStorage, key);
  if (val && typeof val === 'string') {
    const hasLegacy = val.includes('src/assets/images/') || 
                      val.includes('assets/images/') || 
                      val.includes('female1.jpg') || 
                      val.includes('member-1.png') || 
                      val.includes('member-2.png') || 
                      val.includes('member-3.png') ||
                      val.includes('1784');
    if (hasLegacy) {
      // first run the existing replacements then apply alias mapping
      const replaced = val
        .replace(/\/public\/src\/assets\/images\//g, '/images/')
        .replace(/public\/src\/assets\/images\//g, '/images/')
        .replace(/\/src\/assets\/images\//g, '/images/')
        .replace(/src\/assets\/images\//g, '/images/')
        .replace(/\/assets\/images\//g, '/images/')
        .replace(/assets\/images\//g, '/images/')
        .replace(/female1\.jpg/g, 'african_woman_portrait.jpg')
        .replace(/member-1\.png/g, 'african_woman_portrait.jpg')
        .replace(/member-2\.png/g, 'african_woman_portrait.jpg')
        .replace(/member-3\.png/g, 'african_woman_portrait.jpg');
      return applyImageAliasesInString(replaced);
    }
  }
  return val;
};

// 3. Global runtime image error event handler to instantly rescue any broken image loads
window.addEventListener('error', (e) => {
  if (e.target && (e.target as HTMLElement).tagName === 'IMG') {
    const img = e.target as HTMLImageElement;
    if (img.src && !img.dataset.fallbackApplied) {
      img.dataset.fallbackApplied = 'true';
      let originalSrc = img.src;
      let newSrc = originalSrc
        .replace(/\/public\/src\/assets\/images\//g, '/images/')
        .replace(/public\/src\/assets\/images\//g, '/images/')
        .replace(/\/src\/assets\/images\//g, '/images/')
        .replace(/src\/assets\/images\//g, '/images/')
        .replace(/\/assets\/images\//g, '/images/')
        .replace(/assets\/images\//g, '/images/')
        .replace(/female1\.jpg/g, 'african_woman_portrait.jpg')
        .replace(/member-1\.png/g, 'african_woman_portrait.jpg')
        .replace(/member-2\.png/g, 'african_woman_portrait.jpg')
        .replace(/member-3\.png/g, 'african_woman_portrait.jpg');

      newSrc = applyImageAliasesInString(newSrc);

      if (newSrc !== originalSrc) {
        img.src = newSrc;
      } else {
        // Fallback to primary valid local portrait image if original URL fails to load
        img.src = '/images/african_woman_portrait.jpg';
      }
    }
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for PWA only in production.
// In development, unregister any previous service worker to avoid stale cached bundles.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (process.env.NODE_ENV === 'production' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[SW] Registered service worker:', registration.scope);
      } catch (err) {
        console.warn('[SW] Service worker registration failed:', err);
      }
    } else {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if (registrations.length > 0) {
        console.log('[SW] Unregistered previous service workers in development mode.');
      }
    }
  });
}

