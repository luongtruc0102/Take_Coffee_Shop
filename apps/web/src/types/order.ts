export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED';

export type DiscountType =
  | 'PERCENT'
  | 'FIXED';

export type OrderUser = {
  id: number;
  email: string;
  fullName: string | null;
};

export type OrderItemTopping = {
  id: number;
  orderItemId: number;
  toppingId: number;
  toppingName: string;
  toppingPrice: number | string;
};

export type OrderItem = {
  id: number;

  orderId: number;
  productId: number;
  variantId: number;

  productName: string;
  size: string;

  variantPrice: number | string;
  quantity: number;

  unitPrice: number | string;
  lineTotal: number | string;

  toppings: OrderItemTopping[];

  createdAt: string;
};

export type OrderVoucher = {
  id: number;
  code: string;

  discountType:
    DiscountType;

  discountValue:
    number | string;
};

export type OrderPayment = {
  id: number;
  orderId: number;

  method: PaymentMethod;
  status: PaymentStatus;

  amount: number | string;

  transactionCode:
    string | null;

  paidAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;

  userId: number;
  user: OrderUser;

  subtotal: number | string;
  discountAmount: number | string;
  totalPrice: number | string;

  loyaltyPointsUsed: number;

  loyaltyDiscountAmount:
    | number
    | string;

  loyaltyPointsEarned: number;

  loyaltyPointsGrantedAt:
    | string
    | null;

  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;

  note: string | null;

  status: OrderStatus;

  voucherId:
    number | null;

  voucher:
    OrderVoucher | null;

  voucherCode:
    string | null;

  payment:
    OrderPayment | null;

  items: OrderItem[];

  createdAt: string;
  updatedAt: string;
};