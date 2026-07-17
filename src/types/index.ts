export type CustomerStatus = "active" | "inactive";
export type CustomerTier = "Silver" | "Gold" | "Platinum";

export interface Customer {
  id: string;
  memberId: string; // MEM000001
  name: string;
  phone: string;
  email: string | null;
  totalPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  tier: CustomerTier;
  qrToken: string;
}

export type TransactionType = "earn" | "redeem" | "adjustment";

export interface PointTransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  points: number; // positive for earn, negative for redeem/negative adjustment
  balanceAfter: number;
  reason: string;
  reference: string;
  purchaseAmount: number | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

export interface TransactionWithCustomer extends PointTransaction {
  customerName: string;
  memberId: string;
}

export type RewardStatus = "active" | "inactive";

export interface Reward {
  id: string;
  name: string;
  description: string;
  requiredPoints: number;
  image: string | null;
  status: RewardStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminAccount extends AdminUser {
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalMembers: number;
  totalPointsIssued: number;
  totalRedeemed: number;
  totalActivePoints: number;
}

export interface MonthlyPointsPoint {
  month: string;
  added: number;
  redeemed: number;
}

export interface MonthlyMembersPoint {
  month: string;
  members: number;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyPoints: MonthlyPointsPoint[];
  monthlyMembers: MonthlyMembersPoint[];
  recentTransactions: TransactionWithCustomer[];
  recentMembers: Customer[];
}
