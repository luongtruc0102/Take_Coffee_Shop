import type {
  DashboardOverview,
  RevenueStatistic,
  OrderStatusStatistic,
  TopProduct,
  RecentOrder,
  TopTopping,
  PaymentStatistics,
  VoucherStatistics,
  DashboardPeriod,
  NewCustomerStatistic,
  TopCustomer,
  CustomerRetentionSummary
} from '@/types/dashboard';
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  function getApiUrl() {
    if (!API_URL) {
      throw new Error('Thiếu NEXT_PUBLIC_API_URL');
    }
  
    return API_URL;
  }
  
  // Lấy KPI tổng quan của Dashboard
  export async function getDashboardOverview(
    accessToken: string,
    period: DashboardPeriod = '7D',
  ): Promise<DashboardOverview> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/overview?period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải tổng quan dashboard',
      );
    }
  
    return data;
  }
  
  // Lấy doanh thu theo ngày để vẽ biểu đồ
  export async function getRevenue(
    accessToken: string,
    period: DashboardPeriod = '7D',
  ): Promise<RevenueStatistic[]> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/revenue?period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải doanh thu',
      );
    }
  
    return data;
  }

  // Lấy thống kê số lượng đơn theo trạng thái
  export async function getOrderStatusStatistics(
    accessToken: string,
    period: DashboardPeriod = '7D',
  ): Promise<OrderStatusStatistic[]> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/orders/status?period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải trạng thái đơn hàng',
      );
    }
  
    return data;
  }

  // Lấy top sản phẩm bán chạy
  export async function getTopProducts(
    accessToken: string,
    limit = 5,
    period: DashboardPeriod = '7D',
  ): Promise<TopProduct[]> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/products/top?limit=${limit}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải top sản phẩm',
      );
    }
  
    return data;
  }

  // Lấy các đơn hàng mới nhất
  export async function getRecentOrders(
    accessToken: string,
    limit = 5,
    period: DashboardPeriod = '7D',
  ): Promise<RecentOrder[]> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/orders/recent?limit=${limit}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải đơn hàng gần nhất',
      );
    }

    return data;
  }

  // Lấy topping được chọn nhiều nhất
  export async function getTopToppings(
    accessToken: string,
    limit = 5,
    period: DashboardPeriod = '7D',
  ): Promise<TopTopping[]> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/toppings/top?limit=${limit}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải top topping',
      );
    }

    return data;
  }

  // Lấy thống kê thanh toán
  export async function getPaymentStatistics(
    accessToken: string,
    period: DashboardPeriod = '7D',
  ): Promise<PaymentStatistics> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/payments/statistics?period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải thống kê thanh toán',
      );
    }

    return data;
  }

  // Lấy thống kê voucher
  export async function getVoucherStatistics(
    accessToken: string,
    limit = 5,
    period: DashboardPeriod = '7D',
  ): Promise<VoucherStatistics> {
    const response = await fetch(
      `${getApiUrl()}/dashboard/vouchers/statistics?limit=${limit}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Không thể tải thống kê voucher',
      );
    }

    return data;
  }

// Lấy thống kê khách hàng mới
export async function getNewCustomers(
  accessToken: string,
  period: DashboardPeriod = '7D',
): Promise<NewCustomerStatistic[]> {
  const response = await fetch(
    `${getApiUrl()}/dashboard/customers/new?period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Không thể tải khách hàng mới',
    );
  }

  return data;
}

// Lấy top khách hàng chi tiêu nhiều nhất
export async function getTopCustomers(
  accessToken: string,
  limit = 5,
  period: DashboardPeriod = '7D',
): Promise<TopCustomer[]> {
  const response = await fetch(
    `${getApiUrl()}/dashboard/customers/top?limit=${limit}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Không thể tải top khách hàng',
    );
  }

  return data;
}

export async function getCustomerRetention(
  accessToken: string,
  period: DashboardPeriod = '7D',
): Promise<CustomerRetentionSummary> {
  const response = await fetch(
    `${getApiUrl()}/dashboard/customers/retention?period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Không thể tải thống kê khách hàng',
    );
  }

  return data;
}