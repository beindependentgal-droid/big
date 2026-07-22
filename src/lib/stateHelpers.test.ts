import { describe, test, expect } from 'vitest';
import { calculatePointsAndBadges, updateMembers } from './stateHelpers';
import { Member } from '../data';

describe('State Management - calculatePointsAndBadges', () => {
  const mockNow = 1600000000000;

  test('casual action without badge should keep points and badges unchanged', () => {
    const result = calculatePointsAndBadges({
      pts: 10,
      badgeCode: undefined,
      isChallengeOrAdminAction: false,
      currentPoints: 100,
      currentBadges: ['confidence'],
      now: mockNow,
    });

    expect(result.newPoints).toBe(100);
    expect(result.newBadges).toEqual(['confidence']);
    expect(result.unlockedBadge).toBeNull();
    expect(result.newToast).toBeNull();
    expect(result.newNotificationTitle).toBeNull();
  });

  test('casual action with a new badge should unlock the badge and generate a badge toast but leave points unchanged', () => {
    const result = calculatePointsAndBadges({
      pts: 10,
      badgeCode: 'leadership',
      isChallengeOrAdminAction: false,
      currentPoints: 100,
      currentBadges: ['confidence'],
      now: mockNow,
    });

    expect(result.newPoints).toBe(100);
    expect(result.newBadges).toEqual(['confidence', 'leadership']);
    expect(result.unlockedBadge).toBe('leadership');
    expect(result.newToast).toEqual({
      id: `tb-${mockNow}`,
      title: '🌟 New Badge Unlocked!',
      desc: 'Congratulations! You unlocked the "LEADERSHIP" badge on the global BIG Club leaderboard.',
      type: 'badge',
    });
    expect(result.newNotificationTitle).toBeNull();
  });

  test('casual action with an already unlocked badge should make no changes', () => {
    const result = calculatePointsAndBadges({
      pts: 10,
      badgeCode: 'confidence',
      isChallengeOrAdminAction: false,
      currentPoints: 100,
      currentBadges: ['confidence'],
      now: mockNow,
    });

    expect(result.newPoints).toBe(100);
    expect(result.newBadges).toEqual(['confidence']);
    expect(result.unlockedBadge).toBeNull();
    expect(result.newToast).toBeNull();
    expect(result.newNotificationTitle).toBeNull();
  });

  test('challenge/admin action without badge should award points, generate points toast, and log notification', () => {
    const result = calculatePointsAndBadges({
      pts: 50,
      badgeCode: undefined,
      isChallengeOrAdminAction: true,
      currentPoints: 100,
      currentBadges: ['confidence'],
      now: mockNow,
    });

    expect(result.newPoints).toBe(150);
    expect(result.newBadges).toEqual(['confidence']);
    expect(result.unlockedBadge).toBeNull();
    expect(result.newToast).toEqual({
      id: `t-${mockNow}`,
      title: '🏆 +50 Points Awarded!',
      desc: 'Your total is now 150 points. Keep up the amazing work, sister!',
      type: 'points',
    });
    expect(result.newNotificationTitle).toBe('You were awarded +50 points!');
  });

  test('challenge/admin action with new badge should award points, unlock badge, and generate points toast', () => {
    const result = calculatePointsAndBadges({
      pts: 50,
      badgeCode: 'visionary',
      isChallengeOrAdminAction: true,
      currentPoints: 100,
      currentBadges: ['confidence'],
      now: mockNow,
    });

    expect(result.newPoints).toBe(150);
    expect(result.newBadges).toEqual(['confidence', 'visionary']);
    expect(result.unlockedBadge).toBe('visionary');
    expect(result.newToast).toEqual({
      id: `t-${mockNow}`,
      title: '🏆 +50 Points Awarded!',
      desc: 'Your total is now 150 points. Keep up the amazing work, sister!',
      type: 'points',
    });
    expect(result.newNotificationTitle).toBe('You were awarded +50 points!');
  });
});

describe('State Management - updateMembers', () => {
  const initialMembers: Member[] = [
    {
      id: 'm1',
      name: 'Sarah Adebayo',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
      title: 'Tech Founder',
      city: 'Lagos',
      rank: 'Community Lead',
      skills: ['React', 'TypeScript'],
      interests: ['Fintech'],
      bio: 'Pioneering inclusive fintech products.',
      points: 540,
      badges: ['confidence', 'visionary'],
    },
    {
      id: 'm2',
      name: 'Yasmine Al-Sayed',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      title: 'Social Entrepreneur',
      city: 'Cairo',
      rank: 'Mentor',
      skills: ['Strategy', 'Leadership'],
      interests: ['Impact Investing'],
      bio: 'Empowering women in STEM.',
      points: 420,
      badges: ['confidence'],
    },
  ];

  test('should append a new member if the ID does not exist in the list', () => {
    const newMember: Member = {
      id: 'm3',
      name: 'Chioma Nwachukwu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      title: 'Product Manager',
      city: 'Nairobi',
      rank: 'Member',
      skills: ['Agile', 'Scrum'],
      interests: ['EdTech'],
      bio: 'Enthusiastic about building scalable education solutions.',
      points: 120,
      badges: [],
    };

    const result = updateMembers(initialMembers, newMember);

    expect(result).toHaveLength(3);
    expect(result[2]).toEqual(newMember);
  });

  test('should replace and update an existing member if the ID already exists', () => {
    const updatedMember: Member = {
      ...initialMembers[0],
      title: 'Senior Tech Founder',
      points: 600,
    };

    const result = updateMembers(initialMembers, updatedMember);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(updatedMember);
    expect(result[1]).toEqual(initialMembers[1]);
  });
});
