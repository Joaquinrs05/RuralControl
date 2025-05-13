import { UrlMatchResult, UrlSegment } from '@angular/router';

export function houseIdMatcher(
  urlSegments: UrlSegment[]
): UrlMatchResult | null {
  if (!urlSegments[0].path.match(/^[\d]+$/gm)) {
    return null;
  }
  return {
    consumed: urlSegments,
    posParams: { id: new UrlSegment(urlSegments[0].path, {}) },
  };
}
