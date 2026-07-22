import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeSrc(src: string | null | undefined): string | undefined {
  if (src && src.trim() !== '') {
    return src;
  }
  return undefined;
}

/**
 * Formats a date into a "time ago" string (e.g., "2m ago", "5h ago", "3d ago")
 */
export function formatTimeAgo(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return 'Just now';

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    // Try parsing ISO or other date strings
    date = parseISO(dateInput);
    if (!isValid(date)) {
      date = new Date(dateInput);
    }
  }

  if (!isValid(date)) {
    // Return original string if it's one of our hardcoded ones
    const str = String(dateInput).toLowerCase().trim();
    if (str === 'just now') return 'Just now';
    if (str === 'yesterday') return '1d ago';
    return String(dateInput);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 0) return 'Just now';

  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return 'Just now';

  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Formats a date for display (e.g., "Today at 4:30 PM", "Jan 12, 2024")
 */
export function formatDisplayDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    date = parseISO(dateInput);
    if (!isValid(date)) {
      date = new Date(dateInput);
    }
  }

  if (!isValid(date)) return String(dateInput);

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  
  return format(date, 'MMM d, yyyy • h:mm a');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  // Try navigator.clipboard first if supported
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard failed, trying fallback:', err);
  }

  // Fallback method for browsers that don't support modern clipboard API or when document lacks focus
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Position it offscreen
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    
    // Select the text
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copyToClipboard failed:', err);
    return false;
  }
}
