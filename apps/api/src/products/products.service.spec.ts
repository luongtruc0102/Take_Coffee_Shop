jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { FuzzySearchService } from '../common/fuzzy-search/fuzzy-search.service';
import type { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService fuzzy search', () => {
  const products = [
    {
      id: 1,
      name: 'Bạc Xỉu',
      description: 'Cà phê sữa đậm vị',
      category: { id: 1, name: 'Cà phê', isActive: true },
      toppings: [],
      variants: [],
    },
    {
      id: 2,
      name: 'Trà Đào Cam Xả',
      description: 'Trà trái cây thanh mát',
      category: { id: 2, name: 'Trà trái cây', isActive: true },
      toppings: [],
      variants: [],
    },
  ];
  const findMany = jest.fn().mockResolvedValue(products);
  const prisma = {
    product: { findMany },
  } as unknown as PrismaService;
  const service = new ProductsService(prisma, new FuzzySearchService());

  beforeEach(() => {
    findMany.mockClear();
  });

  it('giữ nguyên thứ tự menu khi không có từ khóa', async () => {
    const results = await service.findAll();

    expect(results.map(({ id }) => id)).toEqual([1, 2]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('tìm được tên món không dấu và có lỗi gõ', async () => {
    const results = await service.findAll('bac siu');

    expect(results[0]?.id).toBe(1);
  });

  it('tìm được theo tên danh mục', async () => {
    const results = await service.findAll('tra trai cay');

    expect(results[0]?.id).toBe(2);
  });

  it('dùng cùng fuzzy search cho danh sách quản trị', async () => {
    const results = await service.findAllForAdmin('bac siu');

    expect(results[0]?.id).toBe(1);
  });
});
