  export type DashboardOverview = {
    period: DashboardPeriod;
    periodRevenue: number;
    totalRevenue: number;
    periodOrders: number;
    newCustomers: number;
    activeProducts: number;
    pendingOrders: number;
    averageOrderValue: number;
    cancellationRate: number;
  };
  
  export type RevenueStatistic = {
    date?: string;
    month?: string;
    revenue: number;
    completedOrders: number;
    averageOrderValue: number;
  };

  export type OrderStatusStatistic = {
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'PREPARING'
      | 'READY_FOR_PICKUP'
      | 'DELIVERING'
      | 'COMPLETED'
      | 'CANCELLED';
    count: number;
  };

  export type TopProduct = {
    productId: number;
    productName: string;
    quantitySold: number;
    revenue: number;
  };

  export type RecentOrder = {
    id: number;
    receiverName: string;
    receiverPhone: string;
    totalPrice: number;
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'PREPARING'
      | 'READY_FOR_PICKUP'
      | 'DELIVERING'
      | 'COMPLETED'
      | 'CANCELLED';
    createdAt: string;
    customer: {
      id: number;
      email: string;
      fullName: string;
    };
    payment: {
      method: 'COD' | 'BANK_TRANSFER';
      status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
    } | null;
  };

  export type TopTopping = {
    toppingId: number;
    toppingName: string;
    selectedCount: number;
  };

  export type PaymentStatisticItem = {
    count: number;
    amount: number;
  };
  
  export type PaymentStatusStatistic = PaymentStatisticItem & {
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  };
  
  export type PaymentMethodStatistic = PaymentStatisticItem & {
    method: 'COD' | 'BANK_TRANSFER';
  };
  
  export type PaymentStatistics = {
    byStatus: PaymentStatusStatistic[];
    byMethod: PaymentMethodStatistic[];
  };
  
  export type VoucherStatisticItem = {
    id: number;
    code: string;
    description: string | null;
    usedCount: number;
    usageLimit: number | null;
    remainingUsage: number | null;
    endAt: string;
    isActive: boolean;
  };
  
  export type VoucherStatistics = {
    totalDiscount: number;
    activeVouchers: number;
    topVouchers: VoucherStatisticItem[];
  };

  export type DashboardPeriod =
  | '7D'
  | '30D'
  | '1Y';

  export type NewCustomerStatistic = {
    date: string;
    newCustomers: number;
  };
  
  export type TopCustomer = {
    userId: number;
  
    customer: {
      id: number;
      email: string;
      fullName: string;
    } | null;
  
    totalOrders: number;
    totalSpent: number;
  };

  export type CustomerRetentionStatistic = {
    date?: string;
    month?: string;
    newCustomers: number;
    returningCustomers: number;
  };
  
  export type CustomerRetentionSummary = {
    period: DashboardPeriod;
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    newCustomerRate: number;
    returningCustomerRate: number;
    timeline: CustomerRetentionStatistic[];
  };