import type { DashboardPeriod } from '../dashboard.types';

// Tính khoảng thời gian dùng chung cho Dashboard
export function getDashboardPeriodRange(
  period: DashboardPeriod = '7D',
) {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case '30D':
      startDate.setDate(startDate.getDate() - 29);
      break;

    case '1Y':
      startDate.setFullYear(
        startDate.getFullYear() - 1,
      );
      break;

    case '7D':
    default:
      startDate.setDate(startDate.getDate() - 6);
      break;
  }

  startDate.setHours(0, 0, 0, 0);

  return {
    startDate,
    endDate,
  };
}