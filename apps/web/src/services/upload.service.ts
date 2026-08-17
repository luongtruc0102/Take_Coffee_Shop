type UploadImageResponse = {
    imageUrl: string;
  };
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  export async function uploadProductImage(
    accessToken: string,
    file: File,
  ): Promise<UploadImageResponse> {
    if (!API_URL) {
      throw new Error(
        'Thiếu NEXT_PUBLIC_API_URL',
      );
    }
  
    const formData =
      new FormData();
  
    formData.append(
      'file',
      file,
    );
  
    const response = await fetch(
      `${API_URL}/uploads/products`,
      {
        method: 'POST',
  
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
  
        body: formData,
      },
    );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message ||
          'Không thể tải ảnh lên',
      );
    }
  
    return data;
  }