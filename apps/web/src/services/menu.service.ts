import type { Category, Product } from "@/types/menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error("Thiếu NEXT_PUBLIC_API_URL");
  }

  return API_URL;
}

// USER lấy danh mục đang hoạt động
export async function getPublicCategories(): Promise<Category[]> {
  const response = await fetch(`${getApiUrl()}/categories`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh mục");
  }

  return data;
}

// USER lấy sản phẩm đang bán
export async function getPublicProducts(
  query = "",
  signal?: AbortSignal,
): Promise<Product[]> {
  const searchParams = new URLSearchParams();

  if (query.trim()) {
    searchParams.set("q", query.trim());
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${getApiUrl()}/products${queryString ? `?${queryString}` : ""}`,
    {
      cache: "no-store",
      signal,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải sản phẩm");
  }

  return data;
}
