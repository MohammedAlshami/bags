export function productUrl(id: string, _name?: string): string {
  return `/product/${id}`;
}

export function blogUrl(id: string, _title?: string): string {
  return `/blog/${id}`;
}

export function parseIdParam(param: string): string {
  return param;
}
