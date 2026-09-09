const APP_SCROLL_VIEW_CLASS = 'app-scroll-view';

/** Find the nearest scrollable container (RN-web does not reliably forward a
 *  custom className onto the ScrollView element, so fall back to ancestry). */
function findScrollContainer(el: Node | null): HTMLElement | null {
  let node: HTMLElement | null = el instanceof Element ? el.parentElement : null;
  while (node) {
    const style = getComputedStyle(node);
    const scrolls =
      style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto';
    if (scrolls && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

/** Scroll the nearest AppScrollView container to an element (avoids document scrollIntoView). */
export function scrollAppScrollViewToElement(elementId: string, offsetTop: number): void {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(elementId);
  if (!(target instanceof HTMLElement)) return;
  const scrollContainer =
    target.closest(`.${APP_SCROLL_VIEW_CLASS}`) ?? findScrollContainer(target);
  if (!scrollContainer) return;
  const containerTop = scrollContainer.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  scrollContainer.scrollTop += targetTop - containerTop - offsetTop;
}
