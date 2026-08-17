export function normalizeText(
  value: string,
) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(/đ/g, 'd')
    .trim();
}

function hasDiacritics(
  value: string,
) {
  return (
    value.normalize('NFD') !==
      value.normalize('NFD').replace(
        /[\u0300-\u036f]/g,
        '',
      ) ||
    /[đĐ]/.test(value)
  );
}

export function matchesSearch(
  value: string,
  search: string,
) {
  const keyword =
    search
      .trim()
      .toLowerCase();

  if (!keyword) {
    return true;
  }

  const source =
    value.toLowerCase();

  // Người dùng đã nhập dấu thì tìm chính xác theo dấu
  if (hasDiacritics(keyword)) {
    return source.includes(keyword);
  }

  // Không nhập dấu thì cho phép tìm tiếng Việt không dấu
  return normalizeText(
    source,
  ).includes(
    normalizeText(keyword),
  );
}