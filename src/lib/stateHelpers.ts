import { Member } from '../data';

export interface NotificationItem {
  id: string;
  title: string;
  read: boolean;
  description?: string;
  type?: string;
  timestamp?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  desc: string;
  type: 'points' | 'badge' | 'success' | 'info' | 'error';
}

/**
 * Calculates updated points and badges, and decides if toast/notifications should be produced.
 * Designed as a pure function for easy, robust unit testing.
 */
export function calculatePointsAndBadges(params: {
  pts: number;
  badgeCode?: string;
  isChallengeOrAdminAction: boolean;
  currentPoints: number;
  currentBadges: string[];
  now?: number;
}): {
  newPoints: number;
  newBadges: string[];
  unlockedBadge: string | null;
  newToast: ToastItem | null;
  newNotificationTitle: string | null;
} {
  const { pts, badgeCode, isChallengeOrAdminAction, currentPoints, currentBadges, now = Date.now() } = params;
  let newPoints = currentPoints;
  const newBadges = [...currentBadges];
  let unlockedBadge: string | null = null;
  let newToast: ToastItem | null = null;
  const newNotificationTitle: string | null = isChallengeOrAdminAction ? `You were awarded +${pts} points!` : null;

  if (!isChallengeOrAdminAction) {
    // Points gamification is disabled for casual actions.
    // But we still want to support unlocking badges if badgeCode is specified.
    if (badgeCode && !currentBadges.includes(badgeCode)) {
      newBadges.push(badgeCode);
      unlockedBadge = badgeCode;
      newToast = {
        id: `tb-${now}`,
        title: `🌟 New Badge Unlocked!`,
        desc: `Congratulations! You unlocked the "${badgeCode.toUpperCase()}" badge on the global BIG Club leaderboard.`,
        type: 'badge'
      };
    }
    return {
      newPoints,
      newBadges,
      unlockedBadge,
      newToast,
      newNotificationTitle: null
    };
  }

  newPoints = currentPoints + pts;
  newToast = {
    id: `t-${now}`,
    title: `🏆 +${pts} Points Awarded!`,
    desc: `Your total is now ${newPoints} points. Keep up the amazing work, sister!`,
    type: 'points'
  };

  if (badgeCode && !currentBadges.includes(badgeCode)) {
    newBadges.push(badgeCode);
    unlockedBadge = badgeCode;
  }

  return {
    newPoints,
    newBadges,
    unlockedBadge,
    newToast,
    newNotificationTitle
  };
}

/**
 * Pure function to calculate member updates in the members list.
 */
export function updateMembers(currentMembers: Member[], updatedMember: Member): Member[] {
  const exists = currentMembers.some(m => m.id === updatedMember.id);
  if (exists) {
    return currentMembers.map(m => m.id === updatedMember.id ? updatedMember : m);
  } else {
    return [...currentMembers, updatedMember];
  }
}

export function mergeMemberPreferences(member: Member, preferences?: Member['preferences']): Member {
  return {
    ...member,
    preferences: {
      messagePermissions: preferences?.messagePermissions ?? 'connections',
      emailVerifyRequired: preferences?.emailVerifyRequired ?? false,
      codeVerifyRequired: preferences?.codeVerifyRequired ?? false,
      sessionTimeout: preferences?.sessionTimeout ?? 'never',
      theme: preferences?.theme ?? 'light',
      ...preferences,
    },
  };
}

export interface AcademyProgressState {
  enrolledCourseIds: string[];
  completedLessonIds: string[];
  lessonNotes: Record<string, string>;
  earnedCertificateIds: string[];
  activeCourseId: string | null;
  activeLessonId: string | null;
}

export function getDefaultAcademyProgressState(): AcademyProgressState {
  return {
    enrolledCourseIds: [],
    completedLessonIds: [],
    lessonNotes: {},
    earnedCertificateIds: [],
    activeCourseId: null,
    activeLessonId: null,
  };
}

export function mergeAcademyProgressState(
  current: AcademyProgressState,
  updates: Partial<AcademyProgressState>
): AcademyProgressState {
  return {
    ...current,
    ...updates,
    enrolledCourseIds: updates.enrolledCourseIds ?? current.enrolledCourseIds,
    completedLessonIds: updates.completedLessonIds ?? current.completedLessonIds,
    lessonNotes: updates.lessonNotes ?? current.lessonNotes,
    earnedCertificateIds: updates.earnedCertificateIds ?? current.earnedCertificateIds,
    activeCourseId: updates.activeCourseId ?? current.activeCourseId,
    activeLessonId: updates.activeLessonId ?? current.activeLessonId,
  };
}
