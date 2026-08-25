export type ReviewItemInput = {
    orderItemId: number;
    rating: number;
    comment?: string;
  };
  
  export type CreateOrderReviewInput = {
    overallRating: number;
    comment?: string;
    items?: ReviewItemInput[];
  };
  
  export type UpdateOrderReviewInput =
    Partial<CreateOrderReviewInput>;
  
  export type ProductReview = {
    id: number;
    orderReviewId: number;
    orderItemId: number;
    productId: number;
  
    rating: number;
    comment: string | null;
  
    product: {
      id: number;
      name: string;
      imageUrl: string | null;
    };
  
    orderItem: {
      id: number;
      productName: string;
      size: string;
    };
  
    createdAt: string;
    updatedAt: string;
  };
  
  export type OrderReview = {
    id: number;
    userId: number;
    orderId: number;
  
    overallRating: number;
    comment: string | null;
    isVisible: boolean;
  
    productReviews: ProductReview[];

    adminReply: string | null;
    adminRepliedById: number | null;
    adminRepliedAt: string | null;

    adminRepliedBy:
      | ReviewResponder
      | null;
  
    createdAt: string;
    updatedAt: string;
  };

  export type ProductReviewSummary = {
    productId: number;
    averageRating: number;
    reviewCount: number;
  };
  
  export type PublicProductReviews = {
    product: {
      id: number;
      name: string;
    };
  
    summary: {
      averageRating: number;
      reviewCount: number;
  
      distribution: Record<
        number,
        number
      >;
    };
  
    reviews: Array<{
      id: number;
      rating: number;
      comment: string | null;
      createdAt: string;
      updatedAt: string;
  
      orderItem: {
        size: string;
        productName: string;
      };
  
      orderReview: {
        id: number;
        overallRating: number;
        createdAt: string;
  
        user: {
          id: number;
          fullName: string | null;
          avatarUrl: string | null;
        };
      };
    }>;

    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
  };

  export type ProductReviewQuery = {
    rating?: number;
    page?: number;
    limit?: number;
  };

  export type ReviewResponder = {
    id: number;
    fullName: string | null;
    avatarUrl: string | null;
  };
  
  export type AdminOrderReview =
    OrderReview & {
      user: {
        id: number;
        email: string;
        fullName: string | null;
        avatarUrl: string | null;
      };
  
      order: {
        id: number;
        createdAt: string;
      };
    };
  
  export type ReviewReplyResult = {
    id: number;
    orderId: number;
  
    adminReply: string | null;
    adminRepliedById: number | null;
    adminRepliedAt: string | null;
  
    adminRepliedBy:
      | ReviewResponder
      | null;
  
    updatedAt: string;
  };
  
  export type RemoveReviewReplyResult = {
    id: number;
    orderId: number;
  
    adminReply: null;
    adminRepliedById: null;
    adminRepliedAt: null;
  
    updatedAt: string;
  };