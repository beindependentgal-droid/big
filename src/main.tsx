import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Startup LocalStorage Migration: Run once to clean old legacy values permanently in client browser
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
                          val.includes('member-3.png');
        if (hasLegacy) {
          const cleaned = val
            .replace(/\/public\/src\/assets\/images\//g, '/images/')
            .replace(/public\/src\/assets\/images\//g, '/images/')
            .replace(/\/src\/assets\/images\//g, '/images/')
            .replace(/src\/assets\/images\//g, '/images/')
            .replace(/\/assets\/images\//g, '/images/')
            .replace(/assets\/images\//g, '/images/')
            .replace(/female1\.jpg/g, 'african_woman_portrait_1_1784708232425.jpg')
            .replace(/member-1\.png/g, 'african_woman_portrait_2_1784708246407.jpg')
            .replace(/member-2\.png/g, 'african_woman_portrait_3_1784708258772.jpg')
            .replace(/member-3\.png/g, 'african_woman_portrait_4_1784708270262.jpg');
          localStorage.setItem(key, cleaned);
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
                      val.includes('member-3.png');
    if (hasLegacy) {
      return val
        .replace(/\/public\/src\/assets\/images\//g, '/images/')
        .replace(/public\/src\/assets\/images\//g, '/images/')
        .replace(/\/src\/assets\/images\//g, '/images/')
        .replace(/src\/assets\/images\//g, '/images/')
        .replace(/\/assets\/images\//g, '/images/')
        .replace(/assets\/images\//g, '/images/')
        .replace(/female1\.jpg/g, 'african_woman_portrait_1_1784708232425.jpg')
        .replace(/member-1\.png/g, 'african_woman_portrait_2_1784708246407.jpg')
        .replace(/member-2\.png/g, 'african_woman_portrait_3_1784708258772.jpg')
        .replace(/member-3\.png/g, 'african_woman_portrait_4_1784708270262.jpg');
    }
  }
  return val;
};

// 3. Global runtime image error event handler to instantly rescue any broken image loads
window.addEventListener('error', (e) => {
  if (e.target && (e.target as HTMLElement).tagName === 'IMG') {
    const img = e.target as HTMLImageElement;
    if (img.src) {
      let originalSrc = img.src;
      let newSrc = originalSrc;
      
      newSrc = newSrc
        .replace(/\/public\/src\/assets\/images\//g, '/images/')
        .replace(/public\/src\/assets\/images\//g, '/images/')
        .replace(/\/src\/assets\/images\//g, '/images/')
        .replace(/src\/assets\/images\//g, '/images/')
        .replace(/\/assets\/images\//g, '/images/')
        .replace(/assets\/images\//g, '/images/')
        .replace(/female1\.jpg/g, 'african_woman_portrait_1_1784708232425.jpg')
        .replace(/member-1\.png/g, 'african_woman_portrait_2_1784708246407.jpg')
        .replace(/member-2\.png/g, 'african_woman_portrait_3_1784708258772.jpg')
        .replace(/member-3\.png/g, 'african_woman_portrait_4_1784708270262.jpg');
      
      if (newSrc !== originalSrc) {
        img.src = newSrc;
      }
    }
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

