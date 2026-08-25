// Một địa chỉ giao hàng đã được user lưu.
export type UserAddress = {
    id: number;
    userId: number;
  
    label: string;
  
    receiverName: string;
    receiverPhone: string;
  
    addressLine: string;
  
    // Backend trả Decimal dưới dạng chuỗi để giữ nguyên độ chính xác.
    latitude: string;
    longitude: string;
  
    isDefault: boolean;
  
    createdAt: string;
    updatedAt: string;
  };
  
  // Dữ liệu dùng khi thêm địa chỉ mới.
  export type CreateAddressInput = {
    label: string;
  
    receiverName: string;
    receiverPhone: string;
  
    addressLine: string;
  
    latitude: string;
    longitude: string;
  
    isDefault?: boolean;
  };
  
  // Dữ liệu dùng khi chỉnh sửa địa chỉ.
  // Đặt mặc định sử dụng API riêng.
  export type UpdateAddressInput =
    Partial<
      Omit<
        CreateAddressInput,
        "isDefault"
      >
    >;