export type DiscountType =
  | 'PERCENT'
  | 'FIXED';

export type Voucher = {
  id: number;
  code: string;
  description: string | null;

  discountType: DiscountType;
  discountValue: number | string;

  minOrderValue:
    | number
    | string
    | null;

  maxDiscount:
    | number
    | string
    | null;

  usageLimit: number | null;
  usedCount: number;

  // Voucher NHANVIEN không có thời hạn
  startAt: string | null;
  endAt: string | null;

  isActive: boolean;

  createdAt: string | null;
  updatedAt: string | null;

  // Chỉ true với voucher đặc quyền NHANVIEN
  isSystemVoucher?: boolean;
};

export type CreateVoucherInput = {
  code: string;
  description?: string;

  discountType:
    | 'PERCENT'
    | 'FIXED';

  discountValue: number;

  minOrderValue?:
    | number
    | null;

  maxDiscount?:
    | number
    | null;

  usageLimit?:
    | number
    | null;

  startAt: string;
  endAt: string;
};

export type UpdateVoucherInput = {
  code?: string;
  description?: string;

  discountType?: DiscountType;
  discountValue?: number;

  minOrderValue?:
    | number
    | null;

  maxDiscount?:
    | number
    | null;

  usageLimit?:
    | number
    | null;

  startAt?: string;
  endAt?: string;
};

export type CheckoutVoucher = Voucher & {
  canUse: boolean;
  unavailableReason: string | null;
  discountAmount: number;
};
