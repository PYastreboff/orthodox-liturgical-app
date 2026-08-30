const APP_SCROLL_VIEW_CLASS = 'app-scroll-view';

/** Scroll the nearest AppScrollView container to an element (avoids document scrollIntoView). */
export function scrollAppScrollViewToElement(elementId: string, offsetTop: number): void {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(elementId);
  const scrollContainer = target?.closest(`.${APP_SCROLL_VIEW_CLASS}`);
  if (!(target instanceof HTMLElement) || !(scrollContainer instanceof HTMLElement)) return;
  const containerTop = scrollContainer.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  scrollContainer.scrollTop += targetTop - containerTop - offsetTop;
}
