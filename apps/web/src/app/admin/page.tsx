"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleDollarSign,
  Clock3,
  Coffee,
  ReceiptText,
  ShoppingBag,
  Users,
  XCircle,
} from "lucide-react";

import StatCard from "@/components/admin/stat-card";
import RevenueChart from "@/components/admin/revenue-chart";
import OrderStatusChart from "@/components/admin/order-status-chart";
import TopProductsChart from "@/components/admin/top-products-chart";
import RecentOrders from "@/components/admin/recent-orders";
import TopToppingsChart from "@/components/admin/top-toppings-chart";
import PaymentStatisticsCard from "@/components/admin/payment-statistics";
import VoucherStatisticsCard from "@/components/admin/voucher-statistics";
import TopCustomers from "@/components/admin/top-customers";
import CustomerRetentionChart from "@/components/admin/customer-retention-chart";

import ToastMessage from "@/components/ui/toast-message";

import {
  getDashboardOverview,
  getRevenue,
  getOrderStatusStatistics,
  getTopProducts,
  getRecentOrders,
  getTopToppings,
  getPaymentStatistics,
  getVoucherStatistics,
  getTopCustomers,
  getCustomerRetention,
} from "@/services/dashboard.service";

import type {
  DashboardOverview,
  DashboardPeriod,
  RevenueStatistic,
  OrderStatusStatistic,
  TopProduct,
  RecentOrder,
  TopTopping,
  PaymentStatistics,
  VoucherStatistics,
  TopCustomer,
  CustomerRetentionSummary,
} from "@/types/dashboard";

const periodOptions: {
  label: string;
  value: DashboardPeriod;
}[] = [
  {
    label: "7 ngày",
    value: "7D",
  },
  {
    label: "1 tháng",
    value: "30D",
  },
  {
    label: "1 năm",
    value: "1Y",
  },
];

const periodLabels: Record<DashboardPeriod, string> = {
  "7D": "7 ngày",
  "30D": "30 ngày",
  "1Y": "1 năm",
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState<DashboardPeriod>("7D");

  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  const overviewLoadedRef =
    useRef(false);

  const [revenueData, setRevenueData] = useState<RevenueStatistic[]>([]);

  const [orderStatusData, setOrderStatusData] = useState<
    OrderStatusStatistic[]
  >([]);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const [topToppings, setTopToppings] = useState<TopTopping[]>([]);

  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  const [paymentStatistics, setPaymentStatistics] =
    useState<PaymentStatistics | null>(null);

  const [voucherStatistics, setVoucherStatistics] =
    useState<VoucherStatistics | null>(null);

  const [customerRetention, setCustomerRetention] =
    useState<CustomerRetentionSummary | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        // Chỉ hiện loading toàn trang ở lần tải đầu tiên
        if (!overviewLoadedRef.current) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setError("Không tìm thấy phiên đăng nhập.");
          return;
        }

        const [
          overviewData,
          revenue,
          orderStatuses,
          products,
          orders,
          toppings,
          payments,
          vouchers,
          retention,
          bestCustomers,
        ] = await Promise.all([
          getDashboardOverview(accessToken, period),
          getRevenue(accessToken, period),
          getOrderStatusStatistics(accessToken, period),
          getTopProducts(accessToken, 5, period),
          getRecentOrders(accessToken, 5, period),
          getTopToppings(accessToken, 5, period),
          getPaymentStatistics(accessToken, period),
          getVoucherStatistics(accessToken, 5, period),
          getCustomerRetention(accessToken, period),
          getTopCustomers(accessToken, 5, period),
        ]);

        setOverview(overviewData);
        overviewLoadedRef.current = true;
        setRevenueData(revenue);
        setOrderStatusData(orderStatuses);
        setTopProducts(products);
        setRecentOrders(orders);
        setTopToppings(toppings);
        setPaymentStatistics(payments);
        setVoucherStatistics(vouchers);
        setTopCustomers(bestCustomers);
        setCustomerRetention(retention);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Không thể tải dashboard",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    loadDashboard();
  }, [period]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }

  const currentPeriodLabel = periodLabels[period];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#1F1B18]">Dashboard</h2>

          <p className="mt-1 text-[#78866B]">
            Tổng quan hoạt động của Kippora.
          </p>
        </div>

        <div className="sticky top-20 z-20 flex justify-end">
          <div className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5]/90 p-2 backdrop-blur">
            {refreshing && (
              <span className="text-xs text-[#8A817B]">Đang cập nhật...</span>
            )}

            <div className="flex rounded-xl border border-[#E9E1D8] bg-white p-1 shadow-sm">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={refreshing}
                  onClick={() => {
                    if (period !== option.value) {
                      setPeriod(option.value);
                    }
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    period === option.value
                      ? "bg-[#4A2C20] text-white shadow-sm"
                      : "text-[#6B625C] hover:bg-[#FAF8F5]"
                  } ${refreshing ? "cursor-wait opacity-80" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToastMessage message={error} />

      {loading && !overview ? (
        <div className="rounded-2xl border border-[#E9E1D8] bg-white p-6 text-sm text-[#78866B] shadow-sm">
          Đang tải dữ liệu dashboard...
        </div>
      ) : (
        overview && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title={`Doanh thu ${currentPeriodLabel}`}
                value={formatCurrency(overview.periodRevenue)}
                description="Doanh thu từ đơn hoàn thành"
                icon={CircleDollarSign}
              />

              <StatCard
                title="Tổng doanh thu"
                value={formatCurrency(overview.totalRevenue)}
                description="Tổng doanh thu toàn hệ thống"
                icon={ReceiptText}
              />

              <StatCard
                title={`Đơn hàng ${currentPeriodLabel}`}
                value={overview.periodOrders}
                description="Số đơn được tạo trong khoảng thời gian"
                icon={ShoppingBag}
              />

              <StatCard
                title={`Khách mới ${currentPeriodLabel}`}
                value={overview.newCustomers}
                description="Tài khoản khách hàng mới"
                icon={Users}
              />

              <StatCard
                title="Sản phẩm đang bán"
                value={overview.activeProducts}
                description="Sản phẩm đang hoạt động"
                icon={Coffee}
              />

              <StatCard
                title="Đơn chờ xử lý"
                value={overview.pendingOrders}
                description="Đơn đang chờ xác nhận"
                icon={Clock3}
              />

              <StatCard
                title="Giá trị đơn trung bình"
                value={formatCurrency(overview.averageOrderValue)}
                description={`Trung bình trên mỗi đơn hoàn thành trong ${currentPeriodLabel}`}
                icon={CircleDollarSign}
              />

              <StatCard
                title="Tỷ lệ hủy đơn"
                value={`${overview.cancellationRate.toFixed(1)}%`}
                description={`Tỷ lệ đơn bị hủy trong ${currentPeriodLabel}`}
                icon={XCircle}
              />
            </div>

            {/* Hiệu suất kinh doanh */}
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <RevenueChart data={revenueData} />
              </div>

              <OrderStatusChart data={orderStatusData} />
            </div>

            {/* Phân tích khách hàng */}
            <div className="grid gap-6 xl:grid-cols-2">
              {customerRetention && (
                <CustomerRetentionChart data={customerRetention} />
              )}

              <TopCustomers data={topCustomers} />
            </div>

            {/* Hiệu suất sản phẩm */}
            <div className="grid gap-6 xl:grid-cols-2">
              <TopProductsChart data={topProducts} />

              <TopToppingsChart data={topToppings} />
            </div>

            {/* Thanh toán và voucher */}
            {paymentStatistics && voucherStatistics && (
              <div className="grid gap-6 xl:grid-cols-2">
                <PaymentStatisticsCard data={paymentStatistics} />

                <VoucherStatisticsCard data={voucherStatistics} />
              </div>
            )}

            {/* Chi tiết vận hành */}
            <RecentOrders data={recentOrders} />
          </>
        )
      )}
    </div>
  );
}
