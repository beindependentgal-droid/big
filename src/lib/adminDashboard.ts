export interface SuperAdminAlert {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  target: 'circles' | 'reports' | 'roles' | 'events';
}

export interface SuperAdminOverview {
  totalMembers: number;
  activePosts: number;
  pendingApprovals: number;
  flaggedItems: number;
  upcomingEvents: number;
  growthRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  alerts: SuperAdminAlert[];
}

interface SuperAdminOverviewInput {
  members: Array<{ joinedAt?: string }>;
  posts: Array<{ timestamp?: string }>;
  circleRequests: Array<{ status?: string }>;
  reportedUserIds: string[];
  blockedUserIds: string[];
  events: Array<{ date?: string }>;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getSuperAdminOverview({
  members,
  posts,
  circleRequests,
  reportedUserIds,
  blockedUserIds,
  events
}: SuperAdminOverviewInput): SuperAdminOverview {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const activePosts = posts.filter(post => {
    const parsed = parseDate(post.timestamp);
    return parsed ? parsed >= startOfToday : false;
  }).length;

  const pendingApprovals = circleRequests.filter(request => request.status === 'pending').length;
  const flaggedItems = reportedUserIds.length + blockedUserIds.length;

  const upcomingEvents = events.filter(event => {
    const parsed = parseDate(event.date);
    return parsed ? parsed >= startOfToday : false;
  }).length;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 6);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 13);
  lastWeekStart.setHours(0, 0, 0, 0);

  const thisWeekSignups = members.filter(member => {
    const parsed = parseDate(member.joinedAt);
    return parsed ? parsed >= thisWeekStart : false;
  }).length;

  const lastWeekSignups = members.filter(member => {
    const parsed = parseDate(member.joinedAt);
    return parsed ? parsed >= lastWeekStart && parsed < thisWeekStart : false;
  }).length;

  const growthRate = lastWeekSignups > 0
    ? Math.round(((thisWeekSignups - lastWeekSignups) / lastWeekSignups) * 100)
    : thisWeekSignups > 0 ? 100 : 0;

  const alerts: SuperAdminAlert[] = [];

  if (pendingApprovals > 0) {
    alerts.push({
      id: 'pending-approvals',
      title: `${pendingApprovals} pending approval${pendingApprovals > 1 ? 's' : ''} need attention`,
      detail: 'Review circle requests and member updates before they accumulate.',
      severity: pendingApprovals > 3 ? 'critical' : 'warning',
      target: 'circles'
    });
  }

  if (flaggedItems > 0) {
    alerts.push({
      id: 'flagged-items',
      title: `${flaggedItems} flagged or restricted account${flaggedItems > 1 ? 's' : ''}`,
      detail: 'Moderation work is pending for reported users and blocked accounts.',
      severity: flaggedItems > 4 ? 'critical' : 'warning',
      target: 'reports'
    });
  }

  if (growthRate < 0) {
    alerts.push({
      id: 'growth-dip',
      title: 'Member growth slipped this week',
      detail: 'Launch a new activation push to recover momentum.',
      severity: 'warning',
      target: 'roles'
    });
  }

  if (upcomingEvents > 0) {
    alerts.push({
      id: 'upcoming-events',
      title: `${upcomingEvents} event${upcomingEvents > 1 ? 's' : ''} are scheduled this week`,
      detail: 'Keep the community calendar aligned and confirm host readiness.',
      severity: 'info',
      target: 'events'
    });
  }

  const systemHealth: SuperAdminOverview['systemHealth'] =
    alerts.some(alert => alert.severity === 'critical')
      ? 'critical'
      : alerts.some(alert => alert.severity === 'warning')
        ? 'warning'
        : 'healthy';

  return {
    totalMembers: members.length,
    activePosts,
    pendingApprovals,
    flaggedItems,
    upcomingEvents,
    growthRate,
    systemHealth,
    alerts
  };
}
