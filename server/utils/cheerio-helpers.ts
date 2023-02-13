import type { CheerioAPI } from 'cheerio';

function extractCheerioVal($: CheerioAPI, selector: string): string {
  const value = $(selector).val() ?? '';

  return Array.isArray(value) ? value.at(0) ?? '' : value;
}

export { extractCheerioVal };
