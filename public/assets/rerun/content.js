// Content translation only. The clone's layout, controls and animation scripts stay intact.
(async () => {
  // Capture readiness before the fetch: on a cold load the content request
  // can finish before the clone's deferred product-controller scripts.
  const domReady = document.readyState === 'loading'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();
  const { copy, images, handle, variants } = await fetch('/assets/rerun/content.json', { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error('RE:RUN copy could not be loaded');
    return r.json();
  });
  await domReady;
  // The static mirror cannot answer Shopify's ?view=var-images requests.
  // Supply real per-variant content to the existing gallery/controller instead.
  if (variants && typeof Utility !== 'undefined') {
    const fetchImages = Utility.fetchProductImages.bind(Utility);
    const fetchDetails = Utility.fetchProductDetails.bind(Utility);
    Utility.fetchProductImages = async (productHandle, id, vertical) =>
      productHandle === handle && variants[id] ? variants[id].gallery : fetchImages(productHandle, id, vertical);
    Utility.fetchProductDetails = async (productHandle, id) =>
      productHandle === handle && variants[id] ? { ...variants[id].details } : fetchDetails(productHandle, id);
    const initializeGallery = async () => {
      try {
        const id = new URL(location.href).searchParams.get('variant') || Object.keys(variants)[0];
        if (typeof Shared !== 'undefined' && variants[id]) await Shared.updateImageGallery(false, id, handle);
        window.__rerunVariantReady = true;
      } catch (error) { console.error('RE:RUN gallery:', error.message); }
    };
    if (document.readyState === 'complete') initializeGallery();
    else window.addEventListener('load', initializeGallery, { once: true });
  }
  const translate = value => {
    const key = value.trim();
    let next = copy[key];
    if (next === undefined) next = key.replace(/\bSelkirk(?: Sport)?\b/g, 'RE:RUN').replace(/\bSELKIRK\b/g, 'RE:RUN').replace(/^(?:Core|Limited):/, 'Color:');
    return value.replace(key, next);
  };
  const shadowRoots = new Set();
  function update(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (root.parentElement?.closest('script,style')) return;
      const next = translate(root.nodeValue);
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.matches('script,style')) return;
    if (root.shadowRoot) {
      shadowRoots.add(root.shadowRoot);
      [...root.shadowRoot.childNodes].forEach(update);
    }
    if (root.tagName === 'IMG' && !root.getAttribute('src')?.startsWith('/assets/rerun/')) {
      const name = (root.getAttribute('src') || '').split('?')[0].split('/').pop();
      if (images[name]) {
        root.src = images[name];
        if (root.srcset) root.srcset = images[name];
      }
    }
    [...root.childNodes].forEach(update);
  }
  update(document.body);
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData' || record.type === 'attributes') update(record.target);
      else record.addedNodes.forEach(update);
    }
    observe();
  });
  function observe() {
    const options = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src'] };
    observer.observe(document.body, options);
    for (const root of shadowRoots) observer.observe(root, options);
  }
  observe();
})().catch(error => console.error(error.message));
