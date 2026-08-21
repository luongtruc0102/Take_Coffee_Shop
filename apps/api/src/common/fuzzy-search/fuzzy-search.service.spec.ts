import {
  FuzzySearchService,
  normalizeSearchText,
} from './fuzzy-search.service';

type Drink = {
  id: number;
  name: string;
  description: string;
  category: {
    name: string;
  };
};

const drinks: Drink[] = [
  {
    id: 1,
    name: 'Bạc Xỉu',
    description: 'Cà phê sữa đậm vị',
    category: { name: 'Cà phê' },
  },
  {
    id: 2,
    name: 'Cappuccino',
    description: 'Cà phê Ý với lớp bọt sữa',
    category: { name: 'Cà phê' },
  },
  {
    id: 3,
    name: 'Trà Đào Cam Xả',
    description: 'Trà trái cây thanh mát',
    category: { name: 'Trà trái cây' },
  },
  {
    id: 4,
    name: 'Sữa Tươi Trân Châu Đường Đen',
    description: 'Sữa tươi cùng trân châu',
    category: { name: 'Đá xay' },
  },
];

describe('FuzzySearchService', () => {
  const service = new FuzzySearchService();
  const options = {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'description', weight: 0.25 },
      { name: 'category.name', weight: 0.15 },
    ],
  };

  it('chuẩn hóa dấu tiếng Việt, chữ đ và khoảng trắng', () => {
    expect(normalizeSearchText('  Đường   Đen  ')).toBe('duong den');
  });

  it('tìm được tiếng Việt khi người dùng nhập không dấu', () => {
    const results = service.search(drinks, 'bac xiu', options);

    expect(results[0]?.id).toBe(1);
  });

  it('chịu được lỗi gõ gần đúng', () => {
    const results = service.search(drinks, 'capuchino', options);

    expect(results[0]?.id).toBe(2);
  });

  it('tìm được từ khóa trên nhiều trường và trường lồng nhau', () => {
    const coffeeResults = service.search(drinks, 'ca phe sua', options);
    const categoryResults = service.search(drinks, 'tra trai cay', options);

    expect(coffeeResults.some(({ id }) => id === 1)).toBe(true);
    expect(coffeeResults.some(({ id }) => id === 2)).toBe(true);
    expect(categoryResults[0]?.id).toBe(3);
  });

  it('hỗ trợ custom getter mà vẫn chuẩn hóa tiếng Việt', () => {
    const results = service.search(drinks, 'duong den', {
      keys: [
        {
          name: 'displayName',
          getFn: (drink) => drink.name,
        },
      ],
    });

    expect(results[0]?.id).toBe(4);
  });

  it('giữ nguyên danh sách khi từ khóa rỗng và tôn trọng limit', () => {
    const results = service.search(drinks, '   ', {
      ...options,
      limit: 2,
    });

    expect(results.map(({ id }) => id)).toEqual([1, 2]);
  });

  it('có thể trả kèm điểm để API tự xếp hạng hoặc debug', () => {
    const [result] = service.searchWithScore(drinks, 'bac xiu', options);

    expect(result?.item.id).toBe(1);
    expect(result?.score).toBeGreaterThanOrEqual(0);
  });
});
