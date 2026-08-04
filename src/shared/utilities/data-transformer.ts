import { SENSITIVE_FIELDS } from '../constants/constants';

export function transformResponseData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => transformResponseData(item));
  }

  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};

    for (const key of Object.keys(data)) {
      if (SENSITIVE_FIELDS.includes(key)) {
        continue;
      }
      cleaned[key] = transformResponseData(data[key]);
    }

    return cleaned;
  }

  return data;
}
