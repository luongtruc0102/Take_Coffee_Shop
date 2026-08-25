"use client";

import {
  ChevronLeft,
  ChevronRight,
  Star,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useAppToast,
} from "@/components/ui/app-toast-provider";

import {
  getProductReviews,
} from "@/services/review.service";

import type {
  PublicProductReviews,
} from "@/types/review";

type Props = {
  productId: number;
};

type RatingFilter =
  | "ALL"
  | 5
  | 4
  | 3
  | 2
  | 1;

type ReviewItem =
  PublicProductReviews[
    "reviews"
  ][number];

function ReviewStars({
  rating,
}: {
  rating: number;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? "fill-[#E6A23C] text-[#E6A23C]"
                : "text-[#D9CABE]"
            }
          />
        ),
      )}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: ReviewItem;
}) {
  return (
    <article className="rounded-xl bg-[#FAF8F5] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#2A211D]">
            {review.orderReview
              .user.fullName ||
              "Khách hàng Kippora"}
          </p>

          <p className="mt-0.5 text-xs text-[#8A817B]">
            Size{" "}
            {
              review.orderItem
                .size
            }
          </p>
        </div>

        <ReviewStars
          rating={
            review.rating
          }
        />
      </div>

      {review.comment && (
        <p className="mt-3 text-sm leading-6 text-[#5E5650]">
          {review.comment}
        </p>
      )}

      <p className="mt-2 text-xs text-[#A0968F]">
        {new Date(
          review.createdAt,
        ).toLocaleDateString(
          "vi-VN",
        )}
      </p>
    </article>
  );
}

export default function ProductReviewsPreview({
  productId,
}: Props) {
  const {
    showToast,
  } = useAppToast();

  const [
    preview,
    setPreview,
  ] =
    useState<PublicProductReviews | null>(
      null,
    );

  const [
    allReviews,
    setAllReviews,
  ] =
    useState<PublicProductReviews | null>(
      null,
    );

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(true);

  const [
    allLoading,
    setAllLoading,
  ] = useState(false);

  const [
    allOpen,
    setAllOpen,
  ] = useState(false);

  const [
    ratingFilter,
    setRatingFilter,
  ] =
    useState<RatingFilter>(
      "ALL",
    );

  const [
    page,
    setPage,
  ] = useState(1);

  // Preview chỉ tải tối đa ba đánh giá mới nhất.
  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      try {
        setPreviewLoading(
          true,
        );

        const result =
          await getProductReviews(
            productId,
            {
              page: 1,
              limit: 3,
            },
          );

        if (!cancelled) {
          setPreview(result);
        }
      } catch (error) {
        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : "Không thể tải đánh giá",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(
            false,
          );
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [
    productId,
    showToast,
  ]);

  // Chỉ tải danh sách đầy đủ khi khách mở modal xem tất cả.
  useEffect(() => {
    if (!allOpen) {
      return;
    }

    let cancelled = false;

    async function loadAll() {
      try {
        setAllLoading(true);

        const result =
          await getProductReviews(
            productId,
            {
              page,
              limit: 10,

              rating:
                ratingFilter ===
                "ALL"
                  ? undefined
                  : ratingFilter,
            },
          );

        if (!cancelled) {
          setAllReviews(
            result,
          );
        }
      } catch (error) {
        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : "Không thể tải đánh giá",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setAllLoading(false);
        }
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [
    allOpen,
    page,
    productId,
    ratingFilter,
    showToast,
  ]);

  if (previewLoading) {
    return (
      <section className="mt-6 border-t border-[#F0E8E0] pt-5 text-sm text-[#8A817B]">
        Đang tải đánh giá...
      </section>
    );
  }

  if (
    !preview ||
    preview.summary
      .reviewCount === 0
  ) {
    return (
      <section className="mt-6 border-t border-[#F0E8E0] pt-5">
        <h3 className="font-semibold text-[#2A211D]">
          Đánh giá
        </h3>

        <p className="mt-2 text-sm text-[#8A817B]">
          Chưa có đánh giá cho món này.
        </p>
      </section>
    );
  }

  const filters:
    RatingFilter[] = [
      "ALL",
      5,
      4,
      3,
      2,
      1,
    ];

  return (
    <>
      <section className="mt-6 border-t border-[#F0E8E0] pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-[#2A211D]">
            Đánh giá sản phẩm
          </h3>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Star
                size={18}
                className="fill-[#E6A23C] text-[#E6A23C]"
            />

            <strong className="text-[#4A2C20]">
                {preview.summary.averageRating}
            </strong>

            <span className="text-xs text-[#8A817B]">
                ({preview.summary.reviewCount})
            </span>

            {preview.summary.reviewCount > 3 && (
                <>
                <span className="mx-1 text-[#D9CABE]">
                    ·
                </span>

                <button
                    type="button"
                    onClick={() => {
                    setPage(1);
                    setRatingFilter("ALL");
                    setAllOpen(true);
                    }}
                    className="text-xs font-semibold text-[#B86F35] transition hover:text-[#8D4F25] hover:underline"
                >
                    Xem tất cả
                </button>
                </>
            )}
            </div>
        </div>

        <div className="mt-4 space-y-3">
          {preview.reviews.map(
            (review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ),
          )}
        </div>

      </section>

      {allOpen && (
        <div className="fixed inset-0 z-[11000] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Đóng danh sách đánh giá"
            onClick={() =>
              setAllOpen(false)
            }
            className="absolute inset-0"
          />

          <div className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between border-b border-[#E9E1D8] p-5">
              <div>
                <h2 className="text-xl font-bold text-[#2A211D]">
                  Tất cả đánh giá
                </h2>

                <div className="mt-1 flex items-center gap-1.5 text-sm">
                    <Star
                        size={17}
                        className="fill-[#E6A23C] text-[#E6A23C]"
                    />

                    <strong>
                        {preview.summary.averageRating}
                    </strong>

                    <span className="text-[#8A817B]">
                        · {preview.summary.reviewCount} đánh giá
                    </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAllOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] text-[#4A2C20]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="no-scrollbar overflow-y-auto p-5">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map(
                  (filter) => {
                    const active =
                      ratingFilter ===
                      filter;

                    const count =
                      filter ===
                      "ALL"
                        ? preview
                            .summary
                            .reviewCount
                        : preview
                            .summary
                            .distribution[
                            filter
                          ];

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setPage(1);

                          setRatingFilter(
                            filter,
                          );
                        }}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-[#4A2C20] text-white"
                            : "bg-[#FAF8F5] text-[#5E5650]"
                        }`}
                      >
                        {filter ===
                        "ALL"
                          ? "Tất cả"
                          : `${filter} sao`}{" "}
                        ({count})
                      </button>
                    );
                  },
                )}
              </div>

              {allLoading ? (
                <p className="py-12 text-center text-sm text-[#8A817B]">
                  Đang tải đánh giá...
                </p>
              ) : allReviews &&
                allReviews.reviews
                  .length > 0 ? (
                <div className="mt-4 space-y-3">
                  {allReviews.reviews.map(
                    (
                      review,
                    ) => (
                      <ReviewCard
                        key={
                          review.id
                        }
                        review={
                          review
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-[#8A817B]">
                  Chưa có đánh giá phù hợp.
                </p>
              )}

              {allReviews &&
                allReviews
                  .pagination
                  .totalPages > 1 && (
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={
                        page <= 1 ||
                        allLoading
                      }
                      onClick={() =>
                        setPage(
                          (
                            current,
                          ) =>
                            current -
                            1,
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9CABE] disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={18}
                      />
                    </button>

                    <span className="text-sm font-semibold text-[#5E5650]">
                      {page} /{" "}
                      {
                        allReviews
                          .pagination
                          .totalPages
                      }
                    </span>

                    <button
                      type="button"
                      disabled={
                        page >=
                          allReviews
                            .pagination
                            .totalPages ||
                        allLoading
                      }
                      onClick={() =>
                        setPage(
                          (
                            current,
                          ) =>
                            current +
                            1,
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9CABE] disabled:opacity-40"
                    >
                      <ChevronRight
                        size={18}
                      />
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}