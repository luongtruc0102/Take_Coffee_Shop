export type UserRole =
  | 'ADMIN'
  | 'STAFF'
  | 'USER';

export type AdminUser = {
  id: number;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  address: string | null;

  loyaltyPoints: number;
  isActive: boolean;

  role: {
    name: UserRole;
  };

  createdAt: string;
  updatedAt: string;

  purchaseSummary?: {
    totalOrders: number;
    totalSpent: number;
    lastPurchaseAt: string | null;
  };
  
  recentOrders?: {
    id: number;
    totalPrice: number | string;
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'PREPARING'
      | 'DELIVERING'
      | 'COMPLETED'
      | 'CANCELLED';
    createdAt: string;
  }[];
};

export type CreateStaffInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

