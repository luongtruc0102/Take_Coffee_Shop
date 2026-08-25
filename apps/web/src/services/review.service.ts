import type {
    CreateOrderReviewInput,
    OrderReview,
    ProductReviewSummary,
    PublicProductReviews,
    UpdateOrderReviewInput,
    ProductReviewQuery,
    AdminOrderReview,
    RemoveReviewReplyResult,
    ReviewReplyResult,
  } from "@/types/review";
  
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;
  
  function getApiUrl() {
    if (!API_URL) {
      throw new Error(
        "Thiếu NEXT_PUBLIC_API_URL",
      );
    }
  
    return API_URL;
  }
  
  function getHeaders(
    accessToken: string,
  ) {
    return {
      "Content-Type":
        "application/json",
  
      Authorization:
        `Bearer ${accessToken}`,
    };
  }
  
  async function readResponse<T>(
    response: Response,
    fallbackMessage: string,
  ): Promise<T> {
    const data =
      await response
        .json()
        .catch(() => null);
  
    if (!response.ok) {
      const message =
        Array.isArray(
          data?.message,
        )
          ? data.message.join(", ")
          : data?.message;
  
      throw new Error(
        message ||
          fallbackMessage,
      );
    }
  
    return data as T;
  }
  
  // Lấy đánh giá của user hiện tại theo đơn hàng.
  export async function getMyOrderReview(
    accessToken: string,
    orderId: number,
  ): Promise<OrderReview | null> {
    const response = await fetch(
      `${getApiUrl()}/reviews/orders/${orderId}/mine`,
      {
        headers:
          getHeaders(accessToken),
  
        cache: "no-store",
      },
    );
  
    return readResponse<
      OrderReview | null
    >(
      response,
      "Không thể tải đánh giá",
    );
  }
  
  // Tạo đánh giá mới cho đơn hoàn tất.
  export async function createOrderReview(
    accessToken: string,
    orderId: number,
    input: CreateOrderReviewInput,
  ): Promise<OrderReview> {
    const response = await fetch(
      `${getApiUrl()}/reviews/orders/${orderId}`,
      {
        method: "POST",
  
        headers:
          getHeaders(accessToken),
  
        body:
          JSON.stringify(input),
      },
    );
  
    return readResponse<OrderReview>(
      response,
      "Không thể gửi đánh giá",
    );
  }
  
  // Sửa đánh giá thuộc user hiện tại.
  export async function updateOrderReview(
    accessToken: string,
    reviewId: number,
    input: UpdateOrderReviewInput,
  ): Promise<OrderReview> {
    const response = await fetch(
      `${getApiUrl()}/reviews/${reviewId}`,
      {
        method: "PATCH",
  
        headers:
          getHeaders(accessToken),
  
        body:
          JSON.stringify(input),
      },
    );
  
    return readResponse<OrderReview>(
      response,
      "Không thể cập nhật đánh giá",
    );
  }
  
  // Xóa đánh giá thuộc user hiện tại.
  export async function deleteOrderReview(
    accessToken: string,
    reviewId: number,
  ): Promise<{
    message: string;
  }> {
    const response = await fetch(
      `${getApiUrl()}/reviews/${reviewId}`,
      {
        method: "DELETE",
  
        headers:
          getHeaders(accessToken),
      },
    );
  
    return readResponse<{
      message: string;
    }>(
      response,
      "Không thể xóa đánh giá",
    );
  }

  // Menu lấy điểm của tất cả sản phẩm bằng một request.
export async function getProductReviewSummaries(): Promise<
ProductReviewSummary[]
> {
const response = await fetch(
  `${getApiUrl()}/reviews/products/summaries`,
  {
    cache: "no-store",
  },
);

return readResponse<
  ProductReviewSummary[]
>(
  response,
  "Không thể tải điểm đánh giá",
);
}

// Modal sản phẩm lấy danh sách nhận xét chi tiết.
export async function getProductReviews(
    productId: number,
    query: ProductReviewQuery = {},
  ): Promise<PublicProductReviews> {
    const params =
      new URLSearchParams();
  
    if (query.rating) {
      params.set(
        "rating",
        String(query.rating),
      );
    }
  
    params.set(
      "page",
      String(
        query.page ?? 1,
      ),
    );
  
    params.set(
      "limit",
      String(
        query.limit ?? 10,
      ),
    );
  
    const response = await fetch(
      `${getApiUrl()}/reviews/products/${productId}?${params.toString()}`,
      {
        cache: "no-store",
      },
    );
  
    return readResponse<
      PublicProductReviews
    >(
      response,
      "Không thể tải đánh giá sản phẩm",
    );
  }

// ADMIN lấy toàn bộ đánh giá, bao gồm cả đánh giá đang bị ẩn.
export async function getAdminReviews(
  accessToken: string,
  query = "",
  signal?: AbortSignal,
): Promise<AdminOrderReview[]> {
  const params =
    new URLSearchParams();

  if (query.trim()) {
    params.set(
      "q",
      query.trim(),
    );
  }

  const response = await fetch(
    `${getApiUrl()}/reviews/management/all?${params.toString()}`,
    {
      headers:
        getHeaders(accessToken),

      cache: "no-store",
      signal,
    },
  );

  return readResponse<
    AdminOrderReview[]
  >(
    response,
    "Không thể tải danh sách đánh giá",
  );
}

// ADMIN ẩn hoặc hiện lại đánh giá trên giao diện khách hàng.
export async function updateReviewVisibility(
  accessToken: string,
  reviewId: number,
  isVisible: boolean,
): Promise<{
  id: number;
  orderId: number;
  isVisible: boolean;
  updatedAt: string;
}> {
  const response = await fetch(
    `${getApiUrl()}/reviews/management/${reviewId}/visibility`,
    {
      method: "PATCH",

      headers:
        getHeaders(accessToken),

      body: JSON.stringify({
        isVisible,
      }),
    },
  );

  return readResponse(
    response,
    "Không thể cập nhật trạng thái đánh giá",
  );
}

// ADMIN gửi phản hồi mới hoặc cập nhật phản hồi hiện tại.
export async function replyToReview(
  accessToken: string,
  reviewId: number,
  reply: string,
): Promise<ReviewReplyResult> {
  const response = await fetch(
    `${getApiUrl()}/reviews/management/${reviewId}/reply`,
    {
      method: "PATCH",

      headers:
        getHeaders(accessToken),

      body: JSON.stringify({
        reply,
      }),
    },
  );

  return readResponse<
    ReviewReplyResult
  >(
    response,
    "Không thể phản hồi đánh giá",
  );
}

// ADMIN xóa phản hồi của cửa hàng nhưng không xóa đánh giá khách hàng.
export async function removeReviewReply(
  accessToken: string,
  reviewId: number,
): Promise<RemoveReviewReplyResult> {
  const response = await fetch(
    `${getApiUrl()}/reviews/management/${reviewId}/reply`,
    {
      method: "DELETE",

      headers:
        getHeaders(accessToken),
    },
  );

  return readResponse<
    RemoveReviewReplyResult
  >(
    response,
    "Không thể xóa phản hồi",
  );
}