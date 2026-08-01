export interface ActivityLog {
  id: string;
  timestamp: number;
  action: string;
  userId?: string;
  details: string;
}
