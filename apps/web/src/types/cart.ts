export type MoneyValue =
  | number
  | string;

export type CartTopping = {
  cartItemId: number;
  toppingId: number;

  topping: {
    id: number;
    name: string;
    price: MoneyValue;
  };
};

export type CartItem = {
  id: number;

  cartId: number;
  productId: number;
  variantId: number;

  quantity: number;

  product: {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };

  variant: {
    id: number;
    size: string;
    price: MoneyValue;
  };

  toppings: CartTopping[];

  unitPrice: number;
  lineTotal: number;

  createdAt: string;
  updatedAt: string;
};

export type Cart = {
  id: number;
  userId: number;

  items: CartItem[];

  totalPrice: number;

  createdAt: string;
  updatedAt: string;
};
