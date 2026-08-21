import { Injectable } from '@nestjs/common';
import Fuse, { type FuseOptionKey, type IFuseOptions } from 'fuse.js';

type ManagedFuseOptions =
  'getFn' | 'ignoreDiacritics' | 'includeScore' | 'isCaseSensitive' | 'keys';

export type FuzzySearchOptions<T> = {
  keys: ReadonlyArray<FuseOptionKey<T>>;
  limit?: number;
  fuseOptions?: Omit<IFuseOptions<T>, ManagedFuseOptions>;
};

export type FuzzySearchResult<T> = {
  item: T;
  score: number;
};

function toSearchString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return '';
}

export function normalizeSearchText(value: unknown): string {
  return toSearchString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Đđ]/g, 'd')
    .toLocaleLowerCase('vi-VN')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeFuseValue(value: unknown): ReadonlyArray<string> | string {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeSearchText(entry));
  }

  return normalizeSearchText(value);
}

@Injectable()
export class FuzzySearchService {
  search<T>(
    items: ReadonlyArray<T>,
    query: string,
    options: FuzzySearchOptions<T>,
  ): T[] {
    return this.searchWithScore(items, query, options).map(({ item }) => item);
  }

  searchWithScore<T>(
    items: ReadonlyArray<T>,
    query: string,
    options: FuzzySearchOptions<T>,
  ): FuzzySearchResult<T>[] {
    const normalizedQuery = normalizeSearchText(query);
    const limit = this.normalizeLimit(options.limit);

    if (limit === 0 || items.length === 0) {
      return [];
    }

    if (!normalizedQuery) {
      const initialItems =
        limit === undefined ? [...items] : items.slice(0, limit);

      return initialItems.map((item) => ({ item, score: 0 }));
    }

    const { keys, fuseOptions = {} } = options;
    const fuse = new Fuse(items, {
      threshold: 0.36,
      ignoreLocation: true,
      shouldSort: true,
      minMatchCharLength: 1,
      useTokenSearch: true,
      tokenMatch: 'all',
      ...fuseOptions,
      keys: this.normalizeKeys(keys),
      isCaseSensitive: false,
      ignoreDiacritics: true,
      includeScore: true,
      getFn: (item, path) => normalizeFuseValue(Fuse.config.getFn(item, path)),
    });

    return fuse
      .search(normalizedQuery, limit === undefined ? undefined : { limit })
      .map((result) => ({
        item: result.item,
        score: result.score ?? 0,
      }));
  }

  private normalizeKeys<T>(
    keys: ReadonlyArray<FuseOptionKey<T>>,
  ): Array<FuseOptionKey<T>> {
    return keys.map((key) => {
      if (typeof key === 'object' && !Array.isArray(key) && key.getFn) {
        const getFn = key.getFn;

        return {
          ...key,
          getFn: (item: T) => normalizeFuseValue(getFn(item)),
        };
      }

      return key;
    });
  }

  private normalizeLimit(limit?: number): number | undefined {
    if (limit === undefined || !Number.isFinite(limit)) {
      return undefined;
    }

    return Math.max(0, Math.floor(limit));
  }
}
