export function getSearchParam(searchParams: URLSearchParams, key: string): string | null {
  const value = searchParams.get(key);

  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function createPageUrl(pathname: string, params: URLSearchParams, nextPage: number): string {
  const nextParams = new URLSearchParams(params);

  if (nextPage <= 1) {
    nextParams.delete("page");
  } else {
    nextParams.set("page", String(nextPage));
  }

  const queryString = nextParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
