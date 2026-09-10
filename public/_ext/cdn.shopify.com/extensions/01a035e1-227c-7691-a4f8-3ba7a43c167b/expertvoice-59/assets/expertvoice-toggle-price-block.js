/*
 *`expertVoiceBlockCloneId` is the ID of the expert voice block clone.
 * Used in the injectExpertVoiceAppBlock function to clone the expert voice block.
 */
const expertVoiceBlockCloneId = 'expertvoice-block-clone';
const EXPERTVOICE_TOGGLE_PRICE_BLOCK_BUILD = 'v3';
if (typeof window !== 'undefined') {
  window.__EXPERTVOICE_TOGGLE_PRICE_BLOCK_BUILD = EXPERTVOICE_TOGGLE_PRICE_BLOCK_BUILD;
  console.info('[ExpertVoice] toggle-price-block build:', EXPERTVOICE_TOGGLE_PRICE_BLOCK_BUILD);
  window.__EXPERTVOICE_LIST_BANNERS = () =>
    [...document.querySelectorAll('#expertvoice-block, #ev-hold-clone, #expertvoice-block-clone, .expertvoice-block')].map(
      el => ({
        id: el.id,
        theme: el.className,
        display: el.style.display,
        inSection: Boolean(el.closest('[id^="shopify-section"]')),
        hasPrices: Boolean(
          el.querySelector('.expertvoice-price') && el.querySelector('.expertvoice-original-price')
        ),
      })
    );
  window.__EXPERTVOICE_DEBUG_STATE = () => {
    const block = expertVoiceGetSectionBannerBlock?.() || document.getElementById('expertvoice-block');
    return {
      build: EXPERTVOICE_TOGGLE_PRICE_BLOCK_BUILD,
      initialized: expertVoiceInitialized,
      usesSectionBannerBlock: expertVoiceUsesSectionBannerBlock,
      productId: expertVoiceGetCurrentProductId?.(),
      variantId: expertVoiceCurrentVariantId,
      dealId: expertVoiceCurrentShopifyDealId,
      givenSelector: window.expertVoiceGlobalGivenSelector || null,
      hasCachedEligibleDeal: expertVoiceHasCachedEligibleDeal?.(),
      banner: block
        ? {
            display: block.style.display,
            inSection: Boolean(block.closest('[id^="shopify-section"]')),
            hasPrices: expertVoiceBlockHasRequiredPriceElements?.(block),
          }
        : null,
    };
  };
  window.__EXPERTVOICE_DEBUG_CART = async () => {
    try {
      const cart = await fetch('/cart.js').then(response => response.json());
      const attributes = cart.attributes || {};
      return {
        attributes,
        evKeys: Object.keys(attributes).filter(key => key.startsWith('EV.')),
        dealId: attributes['EV.shopifyDealId'] || null,
        hasEvAttributes: hasEVAttributes(attributes),
      };
    } catch (error) {
      return { error: String(error) };
    }
  };
}
/*
 * Module state for variant/product tracking, caches, observers, and retry guards.
 */
let expertVoiceCurrentVariantId = null;
let expertVoiceCurrentProductId = null;
let expertVoiceGlobalObserverAppBlockInjector = null;
const expertVoiceDiscountDataCache = new Map();
const expertVoiceCartAttributesCache = new Map();
const expertVoiceLastKnownGoodDiscountData = new Map();
const expertVoiceDiscountFetchInProgress = new Map();

try {
  const keys = [];
  for (let i = 0; i < sessionStorage.length; i++) keys.push(sessionStorage.key(i));
  for (const key of keys) {
    if (!key?.startsWith('ev_lkg_')) continue;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) expertVoiceLastKnownGoodDiscountData.set(key.slice('ev_lkg_'.length), JSON.parse(raw));
    } catch (_) { /* corrupted entry — skip */ }
  }
} catch (_) { /* sessionStorage unavailable — silent */ }

let expertVoiceCurrentShopifyDealId = null;
let expertVoiceLastSyncedProductHandle = null;
let expertVoiceInitialized = false;
let expertVoiceVariantDetectorIntervalId = null;
let expertVoiceReAppearObserver = null;
let expertVoiceSectionRenderPlaceholder = null;
let expertVoiceCloneGuardObserver = null;
let expertVoiceHoldCloneGeneration = 0;
let expertVoiceUsesSectionBannerBlock = false;
let expertVoiceCheckDiscountGeneration = 0;
let expertVoiceDependenciesInitStarted = false;
let expertVoiceHiddenBannerRecheckAttempts = 0;
let expertVoiceHiddenBannerRetryTimeout = null;
let expertVoiceCartDealPollTimeout = null;
let expertVoiceUrlChangeRefreshCallback = null;
const EXPERTVOICE_MAX_HIDDEN_BANNER_RECHECKS = 5;
const EXPERTVOICE_CART_DEAL_POLL_MAX_ATTEMPTS = 20;
const EXPERTVOICE_CART_DEAL_POLL_INTERVAL_MS = 500;

async function retryWithBackoff(fn, { maxAttempts = 3, baseDelayMs = 1000, maxDelayMs = 10000 } = {}) {
  if (maxAttempts < 1) return await fn();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await fn();
    if (!result.shouldRetry || attempt === maxAttempts - 1) return result;
    const delay = Math.min(result.retryAfterMs ?? baseDelayMs * Math.pow(2, attempt), maxDelayMs);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/*
 * Waits for ThemeEnv, then runs initExpertVoice once.
 */
function checkEVDependencies(attempts = 0, maxAttempts = 10) {
  // Check if we've exceeded max attempts
  if (attempts >= maxAttempts) {
    console.error(
      'ExpertVoice: Max recursion reached - ThemeEnv dependencies not found after',
      maxAttempts,
      'attempts'
    );
    return;
  }

  // Check if dependencies exist
  if (!window.ThemeEnv || !window.ThemeEnv.EXPERT_VOICE_PRICE_CALCULATOR_ENDPOINT) {
    // Continue recursion with incremented attempts counter
    const timeoutId = setTimeout(() => checkEVDependencies(attempts + 1, maxAttempts), 100);
    return;
  }

  if (expertVoiceDependenciesInitStarted) {
    return;
  }
  expertVoiceDependenciesInitStarted = true;
  initExpertVoice();
}

/*
 * One-time setup: observers, variant/URL listeners, initial banner check.
 */
function initExpertVoice() {
  console.log('ExpertVoice: Initializing discount functionality');
  const isInDesignMode = window.Shopify && window.Shopify.designMode;
  const givenSelector = window.expertVoiceGlobalGivenSelector;

  if (isInDesignMode) {
    console.log('ExpertVoice: Running in Shopify Design Mode - using preview data');
    checkEVDiscountCode(givenSelector, true);
    return;
  }

  // Idempotency guard: on the Deal Manager flow this function is invoked twice
  // (once from ev-price-banner-functions.liquid, once from expertvoice-activate-
  // discount.js after the cart update resolves). The second call only needs to
  // refresh the banner now that EV cart attributes exist; starting another
  // detectEVChanges loop here is what produces the variant-switch flicker.
  if (expertVoiceInitialized) {
    console.log('ExpertVoice: Already initialized - refreshing banner only');
    expertVoiceMarkSectionBannerMode();
    expertVoiceRemoveStrayBodyTemplateBlocks();
    checkEVDiscountCode(givenSelector);
    return;
  }
  expertVoiceInitialized = true;

  // Get initial (current) product ID on real page load (not SPA-like refresh)
  expertVoiceCurrentProductId = expertVoiceNormalizeProductId(
    window.ExpertVoiceLiquidVariables.productId
  );
  expertVoiceLastSyncedProductHandle = getEVProductHandle();
  const initialVariantResult = getEVSelectedVariantId();
  expertVoiceCurrentVariantId = initialVariantResult.variantId;

  // Watch for #expertvoice-block being removed and re-added by the theme's Section
  // Rendering API. removedNodes (O.1) runs BEFORE addedNodes (O.2) to prevent an
  // atomic-innerHTML orphan: if addedNodes ran first, re-render would complete before
  // O.1 could create a clone, leaving an orphaned clone until the 5s safety timeout.
  if (!expertVoiceReAppearObserver) {
    expertVoiceReAppearObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // O.1 — removedNodes: hold space during section fetch (shopify-section targets only).
          // Skip mutations on document.body or other non-section targets to avoid spurious
          // clones when the full body is cleared (e.g. SPA navigations).
          if (/^shopify-section/.test(mutation.target.id || '')) {
            for (const node of mutation.removedNodes) {
              if (node.nodeType !== 1) continue;
              const removedBlock =
                node.id === 'expertvoice-block' ? node : node.querySelector?.('#expertvoice-block');
              if (removedBlock) {
                // If the live block is already back in the DOM, skip creating a duplicate clone.
                if (document.getElementById('expertvoice-block')) {
                  expertVoiceHoldCloneGeneration++;
                  expertVoiceDismissHoldClone();
                  break;
                }
                // G.1 no-tease gate: our code sets visibility exclusively via inline style,
                // so display:none usually means a non-EV customer. Themes may hide the block
                // via inline style before Section Rendering removes it.
                if (removedBlock.style.display !== 'none' || expertVoiceHasCachedEligibleDeal()) {
                  // Never insert hold-clones: O.2 + URL/variant refresh repaint from cache.
                  // Placeholders caused duplicate banners on Section Rendering variant switches.
                  expertVoiceHoldCloneGeneration++;
                }
                break;
              }
            }
          }
          // O.2 — addedNodes: run for any mutation target (themes re-add inside nested containers).
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            const addedBlock =
              node.id === 'expertvoice-block' ? node : node.querySelector?.('#expertvoice-block');
            if (addedBlock) {
              expertVoiceHoldCloneGeneration++;
              if (expertVoiceIsInsideShopifySection(addedBlock)) {
                expertVoiceUsesSectionBannerBlock = true;
                expertVoiceRemoveStrayBodyTemplateBlocks();
              }
              expertVoiceReAppearObserver.observe(addedBlock, {
                attributes: true,
                attributeFilter: ['style'],
              });
              expertVoicePruneDuplicateBanners(addedBlock);
              // Paint the re-added block synchronously from cache so the hold-clone can
              // be swapped out with no visible gap. Async checkEVDiscountCode refines after.
              expertVoiceSyncVariantFromUrl();
              expertVoiceApplyCachedBannerToBlock(addedBlock);
              expertVoiceDismissHoldClone();
              checkEVDiscountCode(givenSelector);
              return;
            }
            // App Embed: #expertvoice-block (the hidden source) never moves, so the
            // addedBlock check above never fires when the product section re-renders.
            // Detect the givenSelector element re-appearing in new section HTML and
            // re-inject the clone immediately — before the next render frame.
            if (givenSelector && !expertVoiceUsesSectionBannerBlock && !document.getElementById(expertVoiceBlockCloneId)) {
              const targetEl = (node.matches?.(givenSelector) ? node : null) || node.querySelector?.(givenSelector);
              if (targetEl) {
                expertVoiceHoldCloneGeneration++;
                expertVoiceSyncVariantFromUrl();
                checkEVDiscountCode(givenSelector);
                return;
              }
            }
          }
        }
        // Case 2: block is still in DOM but theme hid it via inline style during a
        // section fetch loading state. Re-trigger render if discount data is cached.
        if (
          mutation.type === 'attributes' &&
          mutation.target.id === 'expertvoice-block' &&
          mutation.target.style.display === 'none' &&
          expertVoiceCurrentShopifyDealId &&
          expertVoiceCartAttributesCache.has(expertVoiceCurrentShopifyDealId)
        ) {
          if (expertVoiceDiscountDataCache.has(expertVoiceGetCurrentProductId())) {
            checkEVDiscountCode(givenSelector);
          } else {
            const inFlightKey = `${expertVoiceGetCurrentProductId()}_${expertVoiceCurrentShopifyDealId}`;
            if (expertVoiceDiscountFetchInProgress.has(inFlightKey)) {
              mutation.target.style.display = 'flex';
              mutation.target.style.visibility = 'hidden';
            }
          }
        } else if (
          mutation.type === 'attributes' &&
          mutation.target.id === 'expertvoice-block' &&
          mutation.target.style.display === 'none' &&
          expertVoiceHasCachedEligibleDeal()
        ) {
          checkEVDiscountCode(givenSelector);
        }
      }
    });
    expertVoiceReAppearObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    const evBlock = document.getElementById('expertvoice-block');
    if (evBlock) {
      expertVoiceReAppearObserver.observe(evBlock, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }
  }

  expertVoiceStartCloneGuardObserver();
  expertVoiceMarkSectionBannerMode();
  expertVoiceRemoveStrayBodyTemplateBlocks();

  // Detect changes in variant and locale
  detectEVChanges(newVariantId => {
    // Update current variant ID
    expertVoiceCurrentVariantId = newVariantId;
    checkEVDiscountCode(givenSelector);
  });

  expertVoiceAttachVariantInputListeners(() => {
    checkEVDiscountCode(givenSelector);
  });

  expertVoiceAttachUrlChangeListeners(() => {
    checkEVDiscountCode(givenSelector);
  });

  window.addEventListener('expertvoice:cart-activated', () => {
    checkEVDiscountCode(givenSelector);
  });

  // Run after observers and body-template cleanup so checkEVDiscountCode never targets
  // a body embed that removeStrayBodyTemplateBlocks is about to delete.
  checkEVDiscountCode(givenSelector);
}

function isExpertVoiceCheckDiscountStale(generation) {
  return generation !== expertVoiceCheckDiscountGeneration;
}

function expertVoiceContinueIfDealReadyAfterStale(rawSelector, generation) {
  if (!isExpertVoiceCheckDiscountStale(generation) || !expertVoiceCurrentShopifyDealId) {
    return false;
  }
  queueMicrotask(() => checkEVDiscountCode(rawSelector));
  return true;
}

/*
 * Resolves the banner container, syncs cart/pricing, and paints the correct banner state.
 */
async function checkEVDiscountCode(rawSelector = null, inDesignMode = false) {
  const generation = ++expertVoiceCheckDiscountGeneration;
  let effectiveRawSelector = rawSelector;

  if (!inDesignMode && !expertVoiceCurrentProductId && window.ExpertVoiceLiquidVariables?.productId) {
    expertVoiceCurrentProductId = expertVoiceNormalizeProductId(window.ExpertVoiceLiquidVariables.productId);
  }

  let cartSyncResult = null;
  if (
    !inDesignMode &&
    (!expertVoiceCurrentShopifyDealId || !expertVoiceCartAttributesCache.has(expertVoiceCurrentShopifyDealId))
  ) {
    cartSyncResult = await expertVoiceSyncCartFromShopify();
  }

  // When pricing is cached, refresh whatever is on-screen immediately (live block or
  // hold-clone) so variant switches never wait on cart/API round-trips.
  if (!inDesignMode) {
    expertVoiceSyncVariantFromUrl();
    if (!effectiveRawSelector || document.getElementById('expertvoice-block')) {
      expertVoiceRefreshVisibleBannerFromCache();
    }
  }

  let expertvoiceBlockContainerSelector = `#expertvoice-block`;
  let usingInjectClone = false;
  try {
    expertVoiceMarkSectionBannerMode();
    const sectionBannerBlock = expertVoiceGetSectionBannerBlock();

    if (effectiveRawSelector && sectionBannerBlock && !inDesignMode) {
      // Product section app block wins over body-embed Click-to-Add when both exist.
      // Inject clones are pruned as duplicates and left checkEVDiscountCode targeting
      // #expertvoice-block-clone after dedupe removed it.
      expertVoiceRemoveExtraBannerShells(sectionBannerBlock);
      effectiveRawSelector = null;
    } else if (effectiveRawSelector) {
      const injectResult = await injectExpertVoiceAppBlock(effectiveRawSelector, inDesignMode);
      if (injectResult) {
        expertVoiceDismissHoldClone();
        usingInjectClone = true;
        expertvoiceBlockContainerSelector = `#${expertVoiceBlockCloneId}`;
      } else if (inDesignMode || !document.getElementById('expertvoice-block')) {
        // Design mode keeps the old early-return. On the storefront, a configured
        // Click-to-Add selector that is missing falls back to the section block.
        return;
      }
    }

    if (!usingInjectClone) {
      if (expertVoiceIsSectionBannerFetchGap()) {
        expertVoiceScheduleHiddenBannerRecheck(effectiveRawSelector);
        return;
      }

      if (!expertVoiceFindReadyBannerBlock(expertvoiceBlockContainerSelector)) {
        const shellBlock = document.querySelector(expertvoiceBlockContainerSelector);
        if (shellBlock && !expertVoiceBlockHasRequiredPriceElements(shellBlock)) {
          console.warn('ExpertVoice: Required price elements not found in DOM');
          expertVoiceScheduleHiddenBannerRecheck(effectiveRawSelector);
          return;
        }
      }

      const isAppBlockEmbedReady = await isExpertVoiceAppBlockEmbedReady(expertvoiceBlockContainerSelector);
      if (!isAppBlockEmbedReady) {
        return;
      }
    }

    // Get price elements scoped to the block container so a hold-clone cannot be updated
    // while the real #expertvoice-block is being re-rendered by the Section Rendering API.
    const expertvoiceBlockContainer = expertVoiceResolveBannerContainer(
      effectiveRawSelector,
      expertvoiceBlockContainerSelector,
      usingInjectClone
    );

    if (!effectiveRawSelector && !expertvoiceBlockContainer) {
      if (expertVoiceHasCachedEligibleDeal() || expertVoiceIsSectionBannerFetchGap()) {
        expertVoiceScheduleHiddenBannerRecheck(effectiveRawSelector);
        return;
      }
    }

    const bannerElements = expertVoiceGetBannerDetailElements(expertvoiceBlockContainer);
    if (!bannerElements) {
      console.warn('ExpertVoice: Required price elements not found in DOM');
      expertVoiceScheduleHiddenBannerRecheck(effectiveRawSelector);
      return;
    }

    const {
      expertvoicePriceText,
      originalPriceText,
      expertvoiceLogoContainer,
      activeDiscountDetailsContainer,
      onSaleDetailsContainer,
      ineligibleDetailsContainer,
      fallbackDetailsContainer,
      showCurrencyCode,
    } = bannerElements;
    const bannerDetails = {
      activeDiscountDetailsContainer,
      onSaleDetailsContainer,
      ineligibleDetailsContainer,
      fallbackDetailsContainer,
    };

    if (expertvoiceBlockContainer.id === 'expertvoice-block') {
      expertVoiceDismissHoldClone();
    }

    const currentLocale = getEVCurrentLocaleFromShopify();
    const localeCode = currentLocale.fullLocale;

    // Handle design mode separately - show the discount block without API calls
    if (inDesignMode) {
      showEVDiscountBlockWithOverwrites({
        expertvoiceLogoContainer,
        activeDiscountDetailsContainer,
        onSaleDetailsContainer,
        ineligibleDetailsContainer,
        expertvoiceBlockContainer,
        fallbackDetailsContainer,
      });

      expertvoicePriceText.innerHTML = `$[Deal Price]${showCurrencyCode ? ` USD` : ''}`;
      originalPriceText.innerHTML = `$[Original Price]${showCurrencyCode ? ` USD` : ''}`;
      return;
    }

    // Optimistic render from hot cache before async work (section re-render, variant switch).
    if (
      expertVoiceGetCurrentProductId() &&
      expertVoiceCurrentShopifyDealId &&
      expertVoiceCartAttributesCache.has(expertVoiceCurrentShopifyDealId) &&
      expertVoiceDiscountDataCache.has(expertVoiceGetCurrentProductId())
    ) {
      renderEVDiscountState({
        data: expertVoiceDiscountDataCache.get(expertVoiceGetCurrentProductId()),
        variantId: expertVoiceCurrentVariantId,
        elements: {
          expertvoiceLogoContainer,
          activeDiscountDetailsContainer,
          onSaleDetailsContainer,
          ineligibleDetailsContainer,
          fallbackDetailsContainer,
          expertvoiceBlockContainer,
          expertvoicePriceText,
          originalPriceText,
        },
        localeCode,
        showCurrencyCode,
      });
      expertVoiceMarkBannerVisible(expertvoiceBlockContainer);
    }

    // Sync product/variant from URL to avoid stale state when checkEVDiscountCode is
    // triggered by MutationObserver or other sources before detectEVChanges runs.
    // This prevents the "On sale now" flash when switching variants rapidly:
    // getEVVariantData returns null when we have Product A's data but Variant B's ID.
    const currentProductHandle = getEVProductHandle();
    if (currentProductHandle && currentProductHandle !== expertVoiceLastSyncedProductHandle) {
      expertVoiceCurrentProductId = expertVoiceNormalizeProductId(await getEVShopifyProductId());
      expertVoiceLastSyncedProductHandle = currentProductHandle;
      if (isExpertVoiceCheckDiscountStale(generation)) return;
    }
    const variantResult = getEVSelectedVariantId();
    expertVoiceCurrentVariantId = variantResult.variantId;

    // Try to fetch product ID if not set (e.g. first load before liquid productId)
    if (!expertVoiceCurrentProductId) {
      expertVoiceCurrentProductId = expertVoiceNormalizeProductId(await getEVShopifyProductId());
      expertVoiceLastSyncedProductHandle = getEVProductHandle();
      if (isExpertVoiceCheckDiscountStale(generation)) return;
    }

    // Exit if product ID is still unavailable after fetch attempt
    if (!expertVoiceGetCurrentProductId()) {
      console.warn('EV: Could not determine product ID');
      if (isExpertVoiceCheckDiscountStale(generation)) return;
      expertvoiceBlockContainer.style.display = 'none';
      return;
    }

    // Get cart data (synced at start of checkEVDiscountCode)
    if (!expertVoiceCurrentShopifyDealId || !expertVoiceCartAttributesCache.has(expertVoiceCurrentShopifyDealId)) {
      if (cartSyncResult === 'fetch_failed') {
        console.error('EV: Could not fetch cart after retries');
        if (isExpertVoiceCheckDiscountStale(generation)) return;
        expertvoiceBlockContainer.style.display = 'none';
        return;
      }
      if (expertVoiceContinueIfDealReadyAfterStale(effectiveRawSelector, generation)) return;
      if (isExpertVoiceCheckDiscountStale(generation)) return;
      if (!expertVoiceCurrentShopifyDealId) {
        console.error('EV: Could not determine deal ID');
        const cachedDiscount = expertVoiceGetCachedDiscount(expertVoiceGetCurrentProductId());
        if (cachedDiscount?.data?.isEVDiscountEligible) {
          if (isExpertVoiceCheckDiscountStale(generation)) return;
          expertVoiceShowBannerMode(expertvoiceBlockContainer, bannerDetails, 'fallback');
          return;
        }
        if (isExpertVoiceCheckDiscountStale(generation)) return;
        expertvoiceBlockContainer.style.display = 'none';
        expertVoicePollForCartDealId(effectiveRawSelector);
        return;
      }
    }
    const currentCartAttributes = expertVoiceCartAttributesCache.get(expertVoiceCurrentShopifyDealId);

    // Check if cart has ExpertVoice attributes
    const hasEVDiscount = hasEVAttributes(currentCartAttributes);
    if (hasEVDiscount) {
      // Get discount data from API
      if (!expertVoiceGetCachedDiscount(expertVoiceGetCurrentProductId())) {
        const inFlightKey = `${expertVoiceGetCurrentProductId()}_${expertVoiceCurrentShopifyDealId}`;
        if (!expertVoiceDiscountFetchInProgress.has(inFlightKey)) {
          const fetchPromise = getEVDiscountPriceFromAPI(
            currentCartAttributes,
            expertVoiceGetCurrentProductId(),
            currentLocale.localeCountryCode
          ).finally(() => expertVoiceDiscountFetchInProgress.delete(inFlightKey));
          expertVoiceDiscountFetchInProgress.set(inFlightKey, fetchPromise);
        }
        const freshDiscountData = await expertVoiceDiscountFetchInProgress.get(inFlightKey);
        if (isExpertVoiceCheckDiscountStale(generation)) return;
        if (freshDiscountData && !freshDiscountData.error) {
          expertVoiceDiscountDataCache.set(expertVoiceGetCurrentProductId(), freshDiscountData);
          expertVoiceSaveLastKnownGoodDiscount(
            expertVoiceGetCurrentProductId(),
            expertVoiceCurrentShopifyDealId,
            freshDiscountData
          );
        } else {
          if (isExpertVoiceCheckDiscountStale(generation)) return;
          if (
            expertVoiceRenderStaleOrFallback({
              expertvoiceLogoContainer,
              activeDiscountDetailsContainer,
              onSaleDetailsContainer,
              ineligibleDetailsContainer,
              fallbackDetailsContainer,
              expertvoiceBlockContainer,
              expertvoicePriceText,
              originalPriceText,
            }, localeCode, showCurrencyCode)
          ) {
            return;
          }
          if (expertVoiceApplyCachedBannerToBlock(expertvoiceBlockContainer)) {
            return;
          }
          expertvoiceBlockContainer.style.display = 'none';
          return;
        }
      }
      const currentDiscountData = expertVoiceGetCachedDiscount(expertVoiceGetCurrentProductId());
      if (currentDiscountData && currentDiscountData.error) {
        if (isExpertVoiceCheckDiscountStale(generation)) return;
        if (
          expertVoiceRenderStaleOrFallback({
            expertvoiceLogoContainer,
            activeDiscountDetailsContainer,
            onSaleDetailsContainer,
            ineligibleDetailsContainer,
            fallbackDetailsContainer,
            expertvoiceBlockContainer,
            expertvoicePriceText,
            originalPriceText,
          }, localeCode, showCurrencyCode)
        ) {
          return;
        }
        if (expertVoiceApplyCachedBannerToBlock(expertvoiceBlockContainer)) {
          return;
        }
        expertvoiceBlockContainer.style.display = 'none';
        return;
      }
      if (isExpertVoiceCheckDiscountStale(generation)) return;

      renderEVDiscountState({
        data: currentDiscountData,
        variantId: expertVoiceCurrentVariantId,
        elements: {
          expertvoiceLogoContainer,
          activeDiscountDetailsContainer,
          onSaleDetailsContainer,
          ineligibleDetailsContainer,
          fallbackDetailsContainer,
          expertvoiceBlockContainer,
          expertvoicePriceText,
          originalPriceText,
        },
        localeCode,
        showCurrencyCode,
      });
      expertVoiceMarkBannerVisible(expertvoiceBlockContainer);
    } else {
      // Cart attributes can be briefly unavailable during Section Rendering API swaps on
      // some themes. If we already have eligible cached pricing, keep the banner visible.
      const cachedDiscount = expertVoiceGetCachedDiscount(expertVoiceGetCurrentProductId());
      if (cachedDiscount?.data?.isEVDiscountEligible) {
        if (isExpertVoiceCheckDiscountStale(generation)) return;
        expertVoiceShowBannerMode(expertvoiceBlockContainer, bannerDetails, 'fallback', false);
        return;
      }
      // Hide the entire app block because there's no discount applied (in the cart)
      if (isExpertVoiceCheckDiscountStale(generation)) return;
      expertvoiceBlockContainer.style.display = 'none';
    }

    if (
      !inDesignMode &&
      expertVoiceHiddenBannerRecheckAttempts < EXPERTVOICE_MAX_HIDDEN_BANNER_RECHECKS &&
      expertvoiceBlockContainer?.style.display === 'none' &&
      expertVoiceBlockHasRequiredPriceElements(expertvoiceBlockContainer)
    ) {
      expertVoiceScheduleHiddenBannerRecheck(effectiveRawSelector, 250);
    }
  } catch (error) {
    console.error('ExpertVoice: Error checking discount code', error);
    if (!inDesignMode) {
      expertVoiceScheduleHiddenBannerRecheck(effectiveRawSelector, 250);
    }
  }
}

/**
 * Gets the numeric value for the original price to display.
 * Returns compareAtPrice if it's valid and greater than originalPrice, otherwise returns originalPrice.
 * @param {string|number} compareAtPrice - The compare at price value
 * @param {string|number} originalPrice - The original price value
 * @returns {number} The numeric price value to use for display
 */
function getEVOriginalPriceText(compareAtPrice, originalPrice) {
  // Check for null, undefined, empty string, or string 'null'
  if (!compareAtPrice || compareAtPrice === 'null') {
    return parseFloat(originalPrice);
  }

  const compareAtPriceNumber = parseFloat(compareAtPrice);
  const originalPriceNumber = parseFloat(originalPrice);

  // Check if compareAtPrice is 0, NaN, or less than or equal to originalPrice
  if (compareAtPriceNumber <= 0 || isNaN(compareAtPriceNumber) || compareAtPriceNumber <= originalPriceNumber) {
    return originalPriceNumber;
  }

  return compareAtPriceNumber;
}

/*
 * Shows the active discount block with overwriting styles.
 * The original styles are in the CSS file.
 *
 * @param {Object} htmlElements - The HTML elements to overwrite.
 * @param {HTMLElement} htmlElements.expertvoiceLogoContainer - The logo container.
 * @param {HTMLElement} htmlElements.activeDiscountDetailsContainer - The active discount details container (shows the prices).
 * @param {HTMLElement} htmlElements.onSaleDetailsContainer - The on sale details container (hidden).
 * @param {HTMLElement} htmlElements.ineligibleDetailsContainer - The ineligible details container (hidden).
 * @param {HTMLElement} htmlElements.expertvoiceBlockContainer - The expertvoice block (parent overall) container.
 */
function showEVDiscountBlockWithOverwrites(htmlElements) {
  if (!htmlElements || typeof htmlElements !== 'object' || Object.keys(htmlElements).length === 0) {
    console.error('Invalid HTML elements object');
    return;
  }

  const {
    expertvoiceLogoContainer,
    activeDiscountDetailsContainer,
    onSaleDetailsContainer,
    ineligibleDetailsContainer,
    expertvoiceBlockContainer,
    fallbackDetailsContainer,
  } = htmlElements;

  try {
    expertvoiceLogoContainer.style.display = 'block';
    activeDiscountDetailsContainer.style.display = 'flex';
    onSaleDetailsContainer.style.display = 'none';
    ineligibleDetailsContainer.style.display = 'none';
    if (fallbackDetailsContainer) fallbackDetailsContainer.style.display = 'none';
    expertvoiceBlockContainer.style.display = 'flex';
    expertvoiceBlockContainer.style.alignItems = 'flex-start';
    expertvoiceBlockContainer.style.padding = '12px';
  } catch (error) {
    console.error('ExpertVoice: Error showing discount block with overwrites', error);
  }
}

function renderEVDiscountState({ data, variantId, elements, localeCode, showCurrencyCode }) {
  const {
    expertvoiceLogoContainer,
    activeDiscountDetailsContainer,
    onSaleDetailsContainer,
    ineligibleDetailsContainer,
    fallbackDetailsContainer,
    expertvoiceBlockContainer,
    expertvoicePriceText,
    originalPriceText,
  } = elements;

  const { isEVDiscountEligible } = data?.data || {};
  const variantData = getEVVariantData(variantId, data?.data?.variantPricing || {});
  const { isEVDiscountApplied, discountedPrice, originalPrice, compareAtPrice, currencyCode } = variantData || {};

  expertvoiceBlockContainer.style.visibility = '';

  if (isEVDiscountEligible && variantData === null) {
    activeDiscountDetailsContainer.style.display = 'none';
    onSaleDetailsContainer.style.display = 'none';
    ineligibleDetailsContainer.style.display = 'none';
    if (fallbackDetailsContainer) fallbackDetailsContainer.style.display = 'flex';
    expertvoiceBlockContainer.style.display = 'flex';
    return;
  }

  if (isEVDiscountEligible && isEVDiscountApplied) {
    showEVDiscountBlockWithOverwrites({
      expertvoiceLogoContainer,
      activeDiscountDetailsContainer,
      onSaleDetailsContainer,
      ineligibleDetailsContainer,
      expertvoiceBlockContainer,
      fallbackDetailsContainer,
    });
    const originalPriceValue = getEVOriginalPriceText(compareAtPrice, originalPrice);
    const formatter = new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
    });
    expertvoicePriceText.innerHTML = `${formatter.format(discountedPrice)}${showCurrencyCode ? ` ${currencyCode}` : ''}`;
    originalPriceText.innerHTML = `${formatter.format(originalPriceValue)}${showCurrencyCode ? ` ${currencyCode}` : ''}`;
    return;
  }

  if (isEVDiscountEligible && !isEVDiscountApplied) {
    expertvoiceBlockContainer.style.alignItems = 'center';
    activeDiscountDetailsContainer.style.display = 'none';
    onSaleDetailsContainer.style.display = 'flex';
    ineligibleDetailsContainer.style.display = 'none';
    if (fallbackDetailsContainer) fallbackDetailsContainer.style.display = 'none';
    expertvoiceBlockContainer.style.display = 'flex';
    return;
  }

  if (!isEVDiscountEligible && !isEVDiscountApplied) {
    expertvoiceBlockContainer.style.alignItems = 'center';
    activeDiscountDetailsContainer.style.display = 'none';
    onSaleDetailsContainer.style.display = 'none';
    ineligibleDetailsContainer.style.display = 'flex';
    if (fallbackDetailsContainer) fallbackDetailsContainer.style.display = 'none';
    expertvoiceBlockContainer.style.display = 'flex';
  }
}

function expertVoiceGetLastKnownGoodDiscount(productId, dealId) {
  const lkgKey = `${productId}_${dealId}`;
  let stale = expertVoiceLastKnownGoodDiscountData.get(lkgKey);
  if (!stale) {
    try {
      const raw = sessionStorage.getItem(`ev_lkg_${lkgKey}`);
      stale = raw ? JSON.parse(raw) : null;
    } catch (_) {
      stale = null;
    }
  }
  return stale;
}

function expertVoiceSaveLastKnownGoodDiscount(productId, dealId, data) {
  const lkgKey = `${productId}_${dealId}`;
  expertVoiceLastKnownGoodDiscountData.set(lkgKey, data);
  try {
    sessionStorage.setItem(`ev_lkg_${lkgKey}`, JSON.stringify(data));
  } catch (_) { /* quota exceeded or private mode — silent */ }
}

function expertVoiceRenderStaleOrFallback(elements, localeCode, showCurrencyCode) {
  const productId = expertVoiceGetCurrentProductId();
  const stale = expertVoiceGetLastKnownGoodDiscount(productId, expertVoiceCurrentShopifyDealId);
  if (stale) {
    renderEVDiscountState({
      data: stale,
      variantId: expertVoiceCurrentVariantId,
      elements,
      localeCode,
      showCurrencyCode,
    });
    expertVoiceMarkBannerVisible(elements.expertvoiceBlockContainer);
    return true;
  }

  const { fallbackDetailsContainer, expertvoiceBlockContainer, activeDiscountDetailsContainer,
    onSaleDetailsContainer, ineligibleDetailsContainer } = elements;
  if (fallbackDetailsContainer) {
    activeDiscountDetailsContainer.style.display = 'none';
    onSaleDetailsContainer.style.display = 'none';
    ineligibleDetailsContainer.style.display = 'none';
    fallbackDetailsContainer.style.display = 'flex';
    expertvoiceBlockContainer.style.display = 'flex';
    expertVoiceMarkBannerVisible(expertvoiceBlockContainer);
    return true;
  }
  return false;
}

function expertVoiceGetBannerDetailElements(container) {
  if (!container) {
    return null;
  }
  const expertvoicePriceText = container.querySelector('.expertvoice-price');
  const originalPriceText = container.querySelector('.expertvoice-original-price');
  if (!expertvoicePriceText || !originalPriceText) {
    return null;
  }
  return {
    container,
    expertvoicePriceText,
    originalPriceText,
    expertvoiceLogoContainer: container.querySelector('.expertvoice-logo'),
    activeDiscountDetailsContainer: container.querySelector('.expertvoice-active-discount-details'),
    onSaleDetailsContainer: container.querySelector('.expertvoice-on-sale-details'),
    ineligibleDetailsContainer: container.querySelector('.expertvoice-ineligible-details'),
    fallbackDetailsContainer: container.querySelector('.expertvoice-fallback-details'),
    showCurrencyCode: container.getAttribute('data-currency-formatting') === 'symbol_and_currency',
  };
}

function expertVoiceShowBannerMode(container, details, mode, markVisible = true) {
  const {
    activeDiscountDetailsContainer,
    onSaleDetailsContainer,
    ineligibleDetailsContainer,
    fallbackDetailsContainer,
  } = details;
  activeDiscountDetailsContainer.style.display = 'none';
  onSaleDetailsContainer.style.display = 'none';
  ineligibleDetailsContainer.style.display = 'none';
  fallbackDetailsContainer.style.display = 'none';
  if (mode === 'fallback') {
    fallbackDetailsContainer.style.display = 'flex';
  } else if (mode === 'onSale') {
    container.style.alignItems = 'center';
    onSaleDetailsContainer.style.display = 'flex';
  } else if (mode === 'ineligible') {
    container.style.alignItems = 'center';
    ineligibleDetailsContainer.style.display = 'flex';
  }
  container.style.display = 'flex';
  if (markVisible) {
    expertVoiceMarkBannerVisible(container);
  }
}

function expertVoicePaintCachedDiscountOnBanner(container, variantId, options = {}) {
  const { requireEligible = false, paintIneligible = false } = options;
  const elements = expertVoiceGetBannerDetailElements(container);
  if (!elements) {
    return false;
  }

  const currentDiscountData = expertVoiceGetCachedDiscount(expertVoiceGetCurrentProductId());
  if (!currentDiscountData || currentDiscountData.error) {
    return false;
  }

  const { isEVDiscountEligible } = currentDiscountData.data || {};
  if (requireEligible && !isEVDiscountEligible) {
    return false;
  }

  const variantData = getEVVariantData(variantId, currentDiscountData.data?.variantPricing || {});
  if (!paintIneligible && !isEVDiscountEligible && !variantData?.isEVDiscountApplied) {
    return false;
  }

  const {
    container: blockContainer,
    expertvoicePriceText,
    originalPriceText,
    expertvoiceLogoContainer,
    activeDiscountDetailsContainer,
    onSaleDetailsContainer,
    ineligibleDetailsContainer,
    fallbackDetailsContainer,
    showCurrencyCode,
  } = elements;
  const localeCode = getEVCurrentLocaleFromShopify().fullLocale;

  renderEVDiscountState({
    data: currentDiscountData,
    variantId,
    elements: {
      expertvoiceLogoContainer,
      activeDiscountDetailsContainer,
      onSaleDetailsContainer,
      ineligibleDetailsContainer,
      fallbackDetailsContainer,
      expertvoiceBlockContainer: blockContainer,
      expertvoicePriceText,
      originalPriceText,
    },
    localeCode,
    showCurrencyCode,
  });
  expertVoiceMarkBannerVisible(blockContainer);
  return true;
}

function expertVoiceNormalizeProductId(productId) {
  if (productId === null || productId === undefined || productId === '') {
    return null;
  }
  return String(productId);
}

function expertVoiceGetCachedDiscount(productId) {
  const normalizedId = expertVoiceNormalizeProductId(productId);
  if (!normalizedId) {
    return undefined;
  }
  return (
    expertVoiceDiscountDataCache.get(normalizedId) ||
    expertVoiceDiscountDataCache.get(Number(normalizedId))
  );
}

/*
 * Returns true when cart + discount caches indicate the current product has an active EV deal.
 */
function expertVoiceGetCurrentProductId() {
  return expertVoiceNormalizeProductId(
    expertVoiceCurrentProductId || window.ExpertVoiceLiquidVariables?.productId || null
  );
}

function expertVoiceHasCachedEligibleDeal() {
  const productId = expertVoiceGetCurrentProductId();
  if (!productId) {
    return false;
  }
  const cachedDiscount = expertVoiceGetCachedDiscount(productId);
  if (!cachedDiscount || cachedDiscount.error || !cachedDiscount.data?.isEVDiscountEligible) {
    return false;
  }
  if (
    expertVoiceCurrentShopifyDealId &&
    expertVoiceCartAttributesCache.has(expertVoiceCurrentShopifyDealId) &&
    hasEVAttributes(expertVoiceCartAttributesCache.get(expertVoiceCurrentShopifyDealId))
  ) {
    return true;
  }
  for (const cartAttributes of expertVoiceCartAttributesCache.values()) {
    if (hasEVAttributes(cartAttributes)) {
      return true;
    }
  }
  return false;
}

function expertVoiceSyncVariantFromUrl() {
  const variantResult = getEVSelectedVariantId();
  if (variantResult.variantId) {
    expertVoiceCurrentVariantId = variantResult.variantId;
  }
}

async function expertVoiceSyncCartFromShopify() {
  try {
    const cartResult = await retryWithBackoff(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        let response;
        try {
          response = await fetch('/cart.js', { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }
        if (!response.ok) {
          return { shouldRetry: [429, 500, 502, 503].includes(response.status), data: null };
        }
        const data = await response.json();
        if (!data.attributes?.['EV.shopifyDealId'] && window.expertVoiceActivationInProgress) {
          return { shouldRetry: true, retryAfterMs: 500, data: null };
        }
        return { shouldRetry: false, data };
      } catch {
        return { shouldRetry: true, data: null };
      }
    }, { maxAttempts: 4, baseDelayMs: 500 });

    if (!cartResult?.data) {
      return 'fetch_failed';
    }
    const dealId = cartResult.data.attributes?.['EV.shopifyDealId'];
    if (dealId && hasEVAttributes(cartResult.data.attributes)) {
      if (!expertVoiceCartAttributesCache.has(dealId)) {
        expertVoiceCartAttributesCache.set(dealId, cartResult.data.attributes);
      }
      expertVoiceCurrentShopifyDealId = dealId;
      return 'ok';
    }
    return 'no_deal';
  } catch (error) {
    console.error('ExpertVoice: Error syncing cart attributes', error);
    return 'fetch_failed';
  }
}

function expertVoiceIsInsideShopifySection(element) {
  return Boolean(element?.closest?.('[id^="shopify-section"]'));
}

function expertVoiceGetSectionBannerBlock() {
  const block = document.querySelector('[id^="shopify-section"] #expertvoice-block');
  return block?.isConnected ? block : null;
}

function expertVoiceIsSectionBannerFetchGap() {
  return expertVoiceUsesSectionBannerBlock && !document.getElementById('expertvoice-block');
}

function expertVoiceScheduleHiddenBannerRecheck(rawSelector = null, delayMs = 100) {
  if (expertVoiceHiddenBannerRecheckAttempts >= EXPERTVOICE_MAX_HIDDEN_BANNER_RECHECKS) {
    return;
  }
  if (expertVoiceHiddenBannerRetryTimeout) {
    clearTimeout(expertVoiceHiddenBannerRetryTimeout);
  }
  expertVoiceHiddenBannerRetryTimeout = setTimeout(() => {
    expertVoiceHiddenBannerRetryTimeout = null;
    const block = expertVoiceGetSectionBannerBlock() || document.getElementById('expertvoice-block');
    if (!block || block.style.display !== 'none') {
      return;
    }
    if (!expertVoiceBlockHasRequiredPriceElements(block)) {
      return;
    }
    expertVoiceHiddenBannerRecheckAttempts++;
    if (expertVoiceRefreshVisibleBannerFromCache()) {
      return;
    }
    checkEVDiscountCode(rawSelector);
  }, delayMs);
}

/*
 * Polls /cart.js for EV attributes when the banner init races ahead of
 * expertvoice-activate-discount.js (ev_referral flow) or a stale cart read.
 */
function expertVoicePollForCartDealId(rawSelector = null, attempt = 0) {
  if (expertVoiceCurrentShopifyDealId || attempt >= EXPERTVOICE_CART_DEAL_POLL_MAX_ATTEMPTS) {
    return;
  }
  if (expertVoiceCartDealPollTimeout) {
    clearTimeout(expertVoiceCartDealPollTimeout);
  }
  expertVoiceCartDealPollTimeout = setTimeout(async () => {
    expertVoiceCartDealPollTimeout = null;
    if (expertVoiceCurrentShopifyDealId) {
      return;
    }
    if ((await expertVoiceSyncCartFromShopify()) === 'ok') {
      checkEVDiscountCode(rawSelector);
      return;
    }
    expertVoicePollForCartDealId(rawSelector, attempt + 1);
  }, EXPERTVOICE_CART_DEAL_POLL_INTERVAL_MS);
}

function expertVoiceBlockHasRequiredPriceElements(block) {
  if (!block?.isConnected) {
    return false;
  }
  return Boolean(
    block.querySelector('.expertvoice-price') && block.querySelector('.expertvoice-original-price')
  );
}

function expertVoiceMarkSectionBannerMode() {
  if (expertVoiceGetSectionBannerBlock()) {
    expertVoiceUsesSectionBannerBlock = true;
  }
}

function expertVoiceRemoveStrayBodyTemplateBlocks() {
  const sectionBlock = expertVoiceGetSectionBannerBlock();
  if (!sectionBlock) {
    return;
  }
  expertVoiceUsesSectionBannerBlock = true;
  document.querySelectorAll('#expertvoice-block').forEach(block => {
    if (block !== sectionBlock) {
      block.remove();
    }
  });
}

function expertVoiceResolveBannerContainer(rawSelector, containerSelector, usingInjectClone = false) {
  expertVoiceMarkSectionBannerMode();

  const sectionBlock = expertVoiceGetSectionBannerBlock();
  if (sectionBlock && expertVoiceBlockHasRequiredPriceElements(sectionBlock)) {
    return sectionBlock;
  }

  if (usingInjectClone) {
    const injectClone = document.getElementById(expertVoiceBlockCloneId);
    if (injectClone && expertVoiceBlockHasRequiredPriceElements(injectClone)) {
      return injectClone;
    }
  }

  // App Embed: when called from the givenSelector path, #expertvoice-block is the hidden
  // source template — not the display container. Prefer the clone; if absent, return null
  // so the caller schedules re-injection rather than painting the source at the wrong position.
  if (rawSelector && window.expertVoiceGlobalGivenSelector && !expertVoiceUsesSectionBannerBlock) {
    const clone = document.getElementById(expertVoiceBlockCloneId);
    if (clone?.isConnected && expertVoiceBlockHasRequiredPriceElements(clone)) {
      return clone;
    }
    return null;
  }

  if (rawSelector) {
    const selected = document.querySelector(containerSelector);
    if (selected && expertVoiceBlockHasRequiredPriceElements(selected)) {
      return selected;
    }
  }

  const activeBlock = expertVoiceGetActiveBannerBlock();
  if (activeBlock && expertVoiceBlockHasRequiredPriceElements(activeBlock)) {
    return activeBlock;
  }

  const fallbackBlock = document.querySelector('#expertvoice-block');
  if (fallbackBlock && expertVoiceBlockHasRequiredPriceElements(fallbackBlock)) {
    return fallbackBlock;
  }

  return activeBlock || sectionBlock || fallbackBlock || expertVoicePruneDuplicateBanners();
}

/*
 * Returns the banner container that should be shown/updated. Prefers the product
 * section block over a body-embed template (duplicate id, often different theme).
 */
function expertVoiceGetActiveBannerBlock(preferredBlock = null) {
  if (preferredBlock?.isConnected) {
    return preferredBlock;
  }

  const sectionBlock = expertVoiceGetSectionBannerBlock();
  if (sectionBlock) {
    expertVoiceUsesSectionBannerBlock = true;
    return sectionBlock;
  }

  const injectedClone = document.getElementById('expertvoice-block-clone');
  if (injectedClone?.isConnected) {
    return injectedClone;
  }

  if (expertVoiceUsesSectionBannerBlock) {
    return null;
  }

  const blocks = [...document.querySelectorAll('#expertvoice-block')].filter(block => block.isConnected);
  return blocks[blocks.length - 1] || null;
}

function expertVoiceDismissHoldClone() {
  if (expertVoiceSectionRenderPlaceholder?.isConnected) {
    expertVoiceSectionRenderPlaceholder.remove();
  }
  document.querySelectorAll('#ev-hold-clone').forEach(clone => clone.remove());
  expertVoiceSectionRenderPlaceholder = null;
}

/*
 * Removes hold-clones, inject clones, and duplicate .expertvoice-block shells that are
 * not the chosen keeper. Duplicates often use #ev-hold-clone or #expertvoice-block-clone
 * rather than a second #expertvoice-block id.
 */
function expertVoiceRemoveExtraBannerShells(keeper) {
  expertVoiceDismissHoldClone();

  document.querySelectorAll(`#${expertVoiceBlockCloneId}, #ev-hold-clone`).forEach(element => {
    if (element.isConnected && element !== keeper) {
      element.remove();
    }
  });

  // Only prune duplicate .expertvoice-block shells when the keeper is known.
  // When keeper is null (Section Rendering gap), removing all .expertvoice-block nodes
  // would delete the real banner because element !== null is always true.
  if (!keeper) {
    return;
  }

  document.querySelectorAll('.expertvoice-block').forEach(element => {
    if (element.isConnected && element !== keeper) {
      // App Embed: the body-level #expertvoice-block is a source template — never remove it.
      if (
        window.expertVoiceGlobalGivenSelector &&
        element.id === 'expertvoice-block' &&
        !expertVoiceIsInsideShopifySection(element)
      ) {
        return;
      }
      element.remove();
    }
  });
}

/*
 * Section Rendering can briefly leave multiple banner nodes in the DOM
 * (same id, hold-clone, or inject clone — both painted visible). Keep one banner.
 */
function expertVoicePruneDuplicateBanners(preferredBlock = null) {
  expertVoiceMarkSectionBannerMode();

  const blocks = [...document.querySelectorAll('#expertvoice-block')].filter(block => block.isConnected);
  const keeper = expertVoiceGetActiveBannerBlock(preferredBlock);

  blocks.forEach(block => {
    // App Embed: #expertvoice-block is the hidden source used by injectExpertVoiceAppBlock.
    // Removing it breaks re-injection after section re-renders. Never remove it in App Embed mode.
    if (window.expertVoiceGlobalGivenSelector && !expertVoiceIsInsideShopifySection(block)) {
      return;
    }
    if (keeper && block !== keeper) {
      block.remove();
      return;
    }
    if (!keeper && expertVoiceUsesSectionBannerBlock && !expertVoiceIsInsideShopifySection(block)) {
      block.remove();
    }
  });

  expertVoiceRemoveExtraBannerShells(keeper);
  return keeper;
}

function expertVoiceEnforceSingleVisibleBanner(preferredBlock = null) {
  return expertVoicePruneDuplicateBanners(preferredBlock);
}

function expertVoiceStartCloneGuardObserver() {
  if (expertVoiceCloneGuardObserver) {
    return;
  }
  expertVoiceCloneGuardObserver = new MutationObserver(() => {
    expertVoiceEnforceSingleVisibleBanner();
  });
  expertVoiceCloneGuardObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function expertVoiceMarkBannerVisible(container) {
  if (container?.style.display === 'flex') {
    expertVoiceHiddenBannerRecheckAttempts = 0;
  }
  if (container?.id === 'expertvoice-block' || container?.id === expertVoiceBlockCloneId) {
    expertVoiceEnforceSingleVisibleBanner(container);
  }
}

/*
 * Synchronously paints cached deal pricing into a block or hold-clone container.
 * @returns {boolean} True when the container was made visible.
 */
function expertVoiceApplyCachedBannerToBlock(container) {
  if (!container || container.id === 'ev-hold-clone' || !expertVoiceHasCachedEligibleDeal()) {
    return false;
  }
  if (
    expertVoiceUsesSectionBannerBlock &&
    container.id === 'expertvoice-block' &&
    !expertVoiceIsInsideShopifySection(container)
  ) {
    return false;
  }
  // App Embed: #expertvoice-block is the hidden source element; the visible display
  // container is #expertvoice-block-clone, managed by injectExpertVoiceAppBlock.
  // Painting the source directly would make it visible at the wrong DOM position.
  if (
    window.expertVoiceGlobalGivenSelector &&
    !expertVoiceUsesSectionBannerBlock &&
    container.id === 'expertvoice-block' &&
    !expertVoiceIsInsideShopifySection(container)
  ) {
    return false;
  }

  const variantId = expertVoiceCurrentVariantId || getEVSelectedVariantId().variantId;
  return expertVoicePaintCachedDiscountOnBanner(container, variantId, { requireEligible: true });
}

function expertVoiceRefreshVisibleBannerFromCache() {
  expertVoiceEnforceSingleVisibleBanner();

  if (!expertVoiceHasCachedEligibleDeal()) {
    return false;
  }

  const block = expertVoiceGetSectionBannerBlock() || expertVoiceGetActiveBannerBlock();
  if (!block) {
    return false;
  }

  const applied = expertVoiceApplyCachedBannerToBlock(block);
  expertVoiceDismissHoldClone();
  return applied;
}

/*
 * Listens for native variant control changes (select/input) so cached banner updates
 * immediately without waiting for the URL polling loop.
 */
function expertVoiceAttachVariantInputListeners(refreshCallback) {
  document.addEventListener(
    'change',
    event => {
      const target = event.target;
      if (
        !target?.matches?.(
          'input[name="id"], select[name="id"], [sm-rc-variant-selector], #productSelect'
        )
      ) {
        return;
      }
      if (!target.value) {
        return;
      }
      expertVoiceCurrentVariantId = target.value;
      expertVoiceRefreshVisibleBannerFromCache();
      refreshCallback(target.value);
    },
    true
  );
}

/*
 * Patches history.pushState/replaceState so themes that update ?variant= via SPA
 * navigation refresh the cached banner immediately instead of waiting for the poll loop.
 */
function expertVoiceNotifyUrlChange() {
  expertVoiceEnforceSingleVisibleBanner();
  expertVoiceSyncVariantFromUrl();
  if (expertVoiceRefreshVisibleBannerFromCache()) {
    expertVoiceUrlChangeRefreshCallback?.();
  }
}

function expertVoiceAttachUrlChangeListeners(refreshCallback) {
  expertVoiceUrlChangeRefreshCallback = refreshCallback;
  if (typeof window !== 'undefined') {
    window.__expertVoiceNotifyUrlChange = expertVoiceNotifyUrlChange;
  }

  if (window.expertVoiceUrlChangeListenersAttached) {
    return;
  }
  window.expertVoiceUrlChangeListenersAttached = true;

  if (!window.__expertVoiceNativePushState) {
    window.__expertVoiceNativePushState = history.pushState.bind(history);
    window.__expertVoiceNativeReplaceState = history.replaceState.bind(history);
  }

  history.pushState = function (...args) {
    window.__expertVoiceNativePushState(...args);
    window.__expertVoiceNotifyUrlChange?.();
  };

  history.replaceState = function (...args) {
    window.__expertVoiceNativeReplaceState(...args);
    window.__expertVoiceNotifyUrlChange?.();
  };

  window.addEventListener('popstate', expertVoiceNotifyUrlChange);
}

function expertVoiceResetUrlChangeListeners() {
  if (window.__expertVoiceNativePushState) {
    history.pushState = window.__expertVoiceNativePushState;
  }
  if (window.__expertVoiceNativeReplaceState) {
    history.replaceState = window.__expertVoiceNativeReplaceState;
  }
  window.removeEventListener('popstate', expertVoiceNotifyUrlChange);
  window.expertVoiceUrlChangeListenersAttached = false;
  window.__expertVoiceNotifyUrlChange = null;
  expertVoiceUrlChangeRefreshCallback = null;
}

/*
 * Checks if the cart has ExpertVoice attributes.
 * @param {Object} obj - The cart attributes object.
 * @returns {boolean} True if the cart has ExpertVoice attributes, false otherwise.
 */
function hasEVAttributes(obj) {
  // Check if the object is null or not an object
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Iterate through object properties
  for (const key in obj) {
    if (key.startsWith('EV.')) {
      return true;
    }
  }

  return false;
}

/*
 * Gets the variant data from the pricing data object.
 * @param {string} variantId - The variant ID.
 * @param {Object} pricingData - The pricing data object.
 * @returns {Object} The variant data object { isEVDiscountApplied, discountedPrice, originalPrice, compareAtPrice, percentage }
 */
function getEVVariantData(variantId, pricingData) {
  // Check if the variantId exists in the pricingData object
  if (pricingData[variantId]) {
    return pricingData[variantId];
  } else {
    return null; // Return null if the variant ID is not found
  }
}

/*
 * Gets the discount price from the API.
 * @param {Object} cartAttributes - The cart attributes object.
 * @param {string} productId - The product ID.
 * @returns {Object} The discount data object.
 */
async function getEVDiscountPriceFromAPI(cartAttributes, productId, countryCode) {
  const url = new URL(window.ThemeEnv.EXPERT_VOICE_PRICE_CALCULATOR_ENDPOINT);
  url.searchParams.append('productId', productId);
  url.searchParams.append('dealId', cartAttributes['EV.shopifyDealId']);
  url.searchParams.append('shopifyStoreName', window.ExpertVoiceLiquidVariables.shopifyStoreName);
  url.searchParams.append('countryCode', countryCode);

  const requestOptions = { method: 'GET', redirect: 'follow' };
  const RETRYABLE = [429, 500, 502, 503];

  const result = await retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(url.toString(), { ...requestOptions, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const retryAfterMs = response.status === 429
          ? (parseFloat(response.headers.get('Retry-After') || '0') * 1000) || undefined
          : undefined;
        return {
          shouldRetry: RETRYABLE.includes(response.status),
          retryAfterMs,
          data: { error: true, status: response.status, message: `HTTP ${response.status}: ${response.statusText}` },
        };
      }
      try {
        return { shouldRetry: false, data: await response.json() };
      } catch (e) {
        return { shouldRetry: false, data: { error: true, message: e.message } };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      return { shouldRetry: true, data: { error: true, message: error.message } };
    }
  }, { maxAttempts: 2, baseDelayMs: 500 });

  if (result.data?.error) {
    console.error('ExpertVoice:', result.data.message);
  }
  return result.data;
}

/*
 * Gets the product handle from the URL.
 * @returns {string|null} The product handle or null if not found
 */
function getEVProductHandle() {
  const pathMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/i);
  const productHandle = pathMatch ? pathMatch[1] : null;
  return productHandle;
}
/*
 * Gets the Shopify product ID from the shop using the product JSON file.
 * @depends on getEVProductHandle function.
 * @returns {string|null} The product ID or null if not found
 */
async function getEVShopifyProductId() {
  const productHandle = getEVProductHandle();
  if (!productHandle) {
    return null;
  }

  const result = await retryWithBackoff(async () => {
    try {
      const response = await fetch(`/products/${productHandle}.json`);
      if (!response.ok) {
        return { shouldRetry: [429, 500, 502, 503].includes(response.status), data: null };
      }
      const productData = await response.json();
      return { shouldRetry: false, data: productData.product?.id?.toString() || null };
    } catch {
      return { shouldRetry: true, data: null };
    }
  }, { maxAttempts: 3, baseDelayMs: 800 });

  if (getEVProductHandle() !== productHandle) {
    return null;
  }

  return result.data;
}

/*
 * Gets the selected variant ID from the shop.
 * @returns {Object} { variantId: string|null, method: string, debugInfo: object }
 */
function getEVSelectedVariantId() {
  // Method 1: URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('variant')) {
    return {
      variantId: urlParams.get('variant'),
      method: 'Method 1: URL parameter',
      debugInfo: { source: 'window.location.search' }
    };
  }

  // Method 2: Custom theme selectors
  const customSelectors = [
    '[sm-rc-variant-selector]',
    '#productSelect',
    // add more custom selectors here as needed
    // example: '[data-variant-select]',
    // example: '.product-variant-id'
    // example: '[data-variant-id]'
    // example: '[data-variant-id="123"]'
    // example: '[data-variant-id="123"]'
  ];

  for (const selector of customSelectors) {
    const element = document.querySelector(selector);
    if (element?.value) {
      return {
        variantId: element.value,
        method: `Method 2: Custom selector (${selector})`,
        debugInfo: { selector }
      };
    }
  }

  // Method 3: Direct input field - SCOPED TO MAIN PRODUCT
  if (expertVoiceCurrentProductId) {
    const productForms = document.querySelectorAll('form[action*="/cart/add"]');
    for (const form of productForms) {
      const formProductIdInput = form.querySelector('input[name="product-id"]');
      const formProductId = formProductIdInput?.value || form.dataset.productId;

      if (formProductId === expertVoiceCurrentProductId) {
        const variantInput = form.querySelector('input[name="id"], select[name="id"]');
        if (variantInput && variantInput.value) {
          return {
            variantId: variantInput.value,
            method: 'Method 3: Scoped to main product form',
            debugInfo: {
              formAction: form.action,
              formProductId: formProductId,
              inputTag: variantInput.tagName,
              inputId: variantInput.id
            }
          };
        }
      }
    }
  }

  // Method 4: Direct input field fallback
  const variantInput = document.querySelector('input[name="id"], select[name="id"]');
  if (variantInput && variantInput.value) {
    const parentForm = variantInput.closest('form');
    return {
      variantId: variantInput.value,
      method: 'Method 4: Fallback (first input/select found)',
      debugInfo: {
        inputTag: variantInput.tagName,
        inputId: variantInput.id,
        inputClass: variantInput.className,
        parentFormAction: parentForm?.action || 'none'
      }
    };
  }

  // Method 5: From Shopify analytics
  if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && window.ShopifyAnalytics.meta.selectedVariantId) {
    return {
      variantId: window.ShopifyAnalytics.meta.selectedVariantId,
      method: 'Method 5: ShopifyAnalytics.meta.selectedVariantId',
      debugInfo: { source: 'window.ShopifyAnalytics.meta' }
    };
  }

  // Method 6: From data attribute
  const addToCartBtn = document.querySelector('[data-product-id]');
  if (addToCartBtn && addToCartBtn.dataset.variantId) {
    return {
      variantId: addToCartBtn.dataset.variantId,
      method: 'Method 6: data-variant-id attribute',
      debugInfo: { element: '[data-product-id]' }
    };
  }

  return { variantId: null, method: 'No method found variant', debugInfo: {} };
}

/*
 * Gets a parameter by name from the URL.
 * @param {string} name - The name of the parameter.
 * @param {string} url - The URL to get the parameter from.
 * @returns {string|null} The parameter value or null if not found.
 */
function getEVParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/*
 * Gets the current locale codes from multiple sources with fallbacks
 * @returns {Object} Object with localeIsoCode, localeCountryCode, and fullLocale
 */
function getEVCurrentLocaleFromShopify() {
  let localeIsoCode = null;
  let localeCountryCode = null;
  let fullLocale = null;

  // Method 1: From URL path (MOST RELIABLE for both language + country)
  // e.g., /en-mx/products/... or /ja-jp/products/...
  const pathMatch = window.location.pathname.match(/^\/([a-z]{2})-([a-z]{2})\//i);
  if (pathMatch) {
    localeIsoCode = pathMatch[1].toLowerCase(); // 'en'
    localeCountryCode = pathMatch[2].toUpperCase(); // 'MX'
    fullLocale = `${localeIsoCode}-${localeCountryCode}`; // 'en-MX'

    return { localeIsoCode, localeCountryCode, fullLocale };
  }

  // Method 2: From window.Shopify.locale (if available and has country)
  if (window.Shopify && window.Shopify.locale) {
    fullLocale = window.Shopify.locale;
    const parts = fullLocale.toLowerCase().split('-');
    localeIsoCode = parts[0];
    localeCountryCode = parts[1] ? parts[1].toUpperCase() : null;

    if (localeIsoCode && localeCountryCode) {
      return { localeIsoCode, localeCountryCode, fullLocale };
    }
  }

  // Method 3: Combine document.documentElement.lang + window.Shopify.country (or other country source)
  if (document.documentElement.lang) {
    localeIsoCode = document.documentElement.lang.split('-')[0].toLowerCase();
  }

  // Try to get country code from various sources
  if (!localeCountryCode) {
    // From window.Shopify.country
    if (window.Shopify && window.Shopify.country) {
      localeCountryCode = window.Shopify.country.toUpperCase();
    }

    // From liquid variables as fallback
    if (!localeCountryCode && window.ExpertVoiceLiquidVariables) {
      localeCountryCode = window.ExpertVoiceLiquidVariables.localeCountryCode;
    }
  }

  // If we still don't have language code, get it from liquid variables
  if (!localeIsoCode && window.ExpertVoiceLiquidVariables) {
    localeIsoCode = window.ExpertVoiceLiquidVariables.localeIsoCode;
  }

  // Final fallback to en-US if we still don't have both
  if (!localeIsoCode || !localeCountryCode) {
    localeIsoCode = localeIsoCode || 'en';
    localeCountryCode = localeCountryCode || 'US';
  }

  fullLocale = `${localeIsoCode}-${localeCountryCode}`;

  return {
    localeIsoCode,
    localeCountryCode,
    fullLocale,
  };
}

/*
 * Inserts a visible hold-clone of #expertvoice-block beside the node that held the block
 * so EV customers see no gap while the theme's Section Rendering API fetches replacement
 * section HTML. Only called when the block was already visible (G.1 gate in O.1) and
 * cached pricing is not available to repaint on re-add.
 */
function expertVoiceInsertHoldClone(removedBlock, sectionTarget) {
  if (
    expertVoiceUsesSectionBannerBlock ||
    document.getElementById('expertvoice-block') ||
    expertVoiceHasCachedEligibleDeal()
  ) {
    return;
  }

  // Idempotency: remove any prior clone before creating a new one.
  // Handles rapid variant switches where a second removal fires before Case 1 (O.2) runs.
  if (expertVoiceSectionRenderPlaceholder) {
    expertVoiceSectionRenderPlaceholder.remove();
    expertVoiceSectionRenderPlaceholder = null;
  }

  const clone = removedBlock.cloneNode(true);
  clone.id = 'ev-hold-clone';
  clone.style.pointerEvents = 'none';

  // Insert after the immediate removal parent so the clone stays in the product info
  // column. Walking up to shopify-section and using afterend placed clones above the
  // Sale badge on multi-section PDP layouts.
  if (sectionTarget?.nodeType === 1) {
    sectionTarget.insertAdjacentElement('afterend', clone);
  } else {
    document.body.appendChild(clone);
  }

  expertVoiceSectionRenderPlaceholder = clone;

  // Safety: remove orphaned clone if O.2 (addedNodes) never fires within 5s.
  // Capture clone reference so a late-firing timer cannot remove a newer clone
  // created by a subsequent variant switch (G.5 identity check).
  const capturedClone = clone;
  setTimeout(() => {
    if (expertVoiceSectionRenderPlaceholder === capturedClone) {
      capturedClone.remove();
      expertVoiceSectionRenderPlaceholder = null;
    }
  }, 5000);
}

function detectEVChanges(variantCallback) {
  // Defensive: never let two detection loops coexist. The expertVoiceInitialized
  // guard in initExpertVoice already prevents re-entry on the Deal Manager flow,
  // but clearing any prior interval here makes detectEVChanges itself safe to
  // call more than once.
  if (expertVoiceVariantDetectorIntervalId !== null) {
    clearInterval(expertVoiceVariantDetectorIntervalId);
    expertVoiceVariantDetectorIntervalId = null;
  }

  const initialResult = getEVSelectedVariantId();
  let currentVariant = initialResult.variantId;
  let currentUrlPath = window.location.pathname;
  let currentUrlSearch = window.location.search;

  let updateTimeout;
  let isVariantUpdating = false;

  expertVoiceVariantDetectorIntervalId = setInterval(async () => {
    expertVoiceEnforceSingleVisibleBanner();

    const hiddenSectionBlock =
      expertVoiceGetSectionBannerBlock() || document.getElementById('expertvoice-block');
    if (
      hiddenSectionBlock?.style.display === 'none' &&
      expertVoiceBlockHasRequiredPriceElements(hiddenSectionBlock)
    ) {
      if (!expertVoiceRefreshVisibleBannerFromCache()) {
        expertVoiceScheduleHiddenBannerRecheck(window.expertVoiceGlobalGivenSelector || null, 500);
      }
    }

    const newUrlPath = window.location.pathname;
    const newUrlSearch = window.location.search;

    const urlPathChanged = newUrlPath !== currentUrlPath;
    const urlSearchChanged = newUrlSearch !== currentUrlSearch;

    // Update product ID FIRST if URL path changed (new product)
    if (urlPathChanged) {
      expertVoiceCurrentProductId = expertVoiceNormalizeProductId(await getEVShopifyProductId());
      expertVoiceLastSyncedProductHandle = getEVProductHandle();
    }

    // NOW get the variant ID (after product ID is updated)
    const newVariantResult = getEVSelectedVariantId();
    const newVariant = newVariantResult.variantId;
    const variantChanged = newVariant && newVariant !== currentVariant;

    if ((variantChanged || urlPathChanged || urlSearchChanged) && !isVariantUpdating) {
      isVariantUpdating = true;
      currentVariant = newVariant;
      currentUrlPath = newUrlPath;
      currentUrlSearch = newUrlSearch;

      if (variantChanged || urlSearchChanged) {
        expertVoiceSyncVariantFromUrl();
        expertVoiceRefreshVisibleBannerFromCache();
        expertVoiceEnforceSingleVisibleBanner();
      }

      if (updateTimeout) clearTimeout(updateTimeout);

      updateTimeout = setTimeout(() => {
        variantCallback(currentVariant);
        isVariantUpdating = false;
      }, 500);
    }
  }, 1000);
}

/*
 * Injects the ExpertVoice app block into the DOM.
 * @param {string} rawSelector - The selector to use for the app block.
 * @param {boolean} inDesignMode - Whether the user is viewing
 * * the shop in design mode (UI Editor)
 * @returns {Promise} A promise that resolves to the expert voice block element or null or boolean (true)
 */
async function injectExpertVoiceAppBlock(rawSelector = null, inDesignMode = false) {
  return new Promise((resolve, reject) => {
    if (!rawSelector || !rawSelector.trim()) {
      reject(false);
      return;
    }

    const selector = document.querySelector(rawSelector.trim());

    // If selector doesn't exist in the DOM
    if (!selector) {
      // In design mode, we'll resolve anyway to allow showing the block
      // This allows design mode to continue even if selector is temporarily missing
      if (inDesignMode) {
        resolve(null);
        return;
      }

      // Regular mode - set up observer to watch for it
      if (expertVoiceGlobalObserverAppBlockInjector) {
        expertVoiceGlobalObserverAppBlockInjector.disconnect();
        expertVoiceGlobalObserverAppBlockInjector = null;
      }

      expertVoiceGlobalObserverAppBlockInjector = setupEVMutationObserver(rawSelector, _targetElement => {
        // Calls checkEVDiscountCode function to check now that the element with the
        // given rawSelector is in the DOM in order to determine cloning and injection
        // of the ExpertVoice app block with the appropriate overwrites.
        // Skip if a clone already exists — Change C (O.2) handles re-injection after
        // section re-renders and injectExpertVoiceAppBlock would remove a valid clone.
        if (document.getElementById(expertVoiceBlockCloneId)) {
          return;
        }
        checkEVDiscountCode(rawSelector, inDesignMode);
      });

      expertVoiceGlobalObserverAppBlockInjector.observe(document.body, {
        childList: true,
        subtree: true,
      });
      resolve(false);
      return;
    }

    // If a clone is already in the DOM, return it rather than replacing it.
    // Replacing an existing clone resets any painted state and is unnecessary when
    // the selector is still in its correct position.
    const existingCloneBeforeInject = document.getElementById(expertVoiceBlockCloneId);
    if (existingCloneBeforeInject?.isConnected) {
      resolve(existingCloneBeforeInject);
      return;
    }

    const expertVoiceBlockElement = document.getElementById('expertvoice-block');

    // Make sure we have a block to clone
    if (!expertVoiceBlockElement) {
      if (inDesignMode) {
        resolve(null); // Allow design mode to continue
      } else {
        reject(false);
      }
      return;
    }

    // Clone the original block element
    const expertVoiceBlockClonedElement = expertVoiceBlockElement.cloneNode(true);
    expertVoiceBlockClonedElement.id = expertVoiceBlockCloneId;

    try {
      // Remove any existing cloned element before inserting new one
      const existingClonedElement = document.getElementById(expertVoiceBlockCloneId);
      if (existingClonedElement) {
        existingClonedElement.remove();
      }

      selector.insertAdjacentElement('afterend', expertVoiceBlockClonedElement);

      resolve(expertVoiceBlockClonedElement);
    } catch (error) {
      reject(error);
    }
  });
}

/*
 * Sets up mutation observer to watch for elements to appear in the DOM.
 * Used to watch for the app block embed to appear in the DOM in the Click-to-Add scenario.
 * Also used to watch for the element with the target selector to appear in the DOM.
 * @param {string} selector - The selector to watch for.
 * @param {Function} callback - The function to call when the target selector appears in the DOM.
 * @returns {MutationObserver} A mutation observer that is used to watch for elements to appear in the DOM.
 */
function setupEVMutationObserver(selector, callback) {
  let processedElement = null;

  return new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      // Handle added nodes - watch for target selector appearance
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node itself matches the selector
          if (node.matches && node.matches(selector) && node !== processedElement) {
            callback(node);
            processedElement = node;
          }

          // Check for a matching child element
          if (node.querySelector) {
            const match = node.querySelector(selector);
            if (match && match !== processedElement) {
              callback(match);
              processedElement = match;
            }
          }
        }
      });
    });
  });
}

/*
 * Checks if the ExpertVoice app block embed exists in the DOM.
 * Used when Click-to-Add is version is used by the store (in a no selector given scenario)
 * because the Shopify theme system will inject the app block embed into the DOM sometime after
 * the page is loaded. But some themes are custom that sections that are dynamically added later
 * contain the app block embed. Therefore, we have detect when the app block embed appears in
 * the DOM then determine how to show the app block (which is in checkEVDiscountCode function).
 * @param {string} expertVoiceBlockContainerSelector - The selector to use for the app block.
 * @returns {Promise} A promise that resolves to true if the app block embed is ready, false otherwise.
 */
function expertVoiceFindReadyBannerBlock(expertVoiceBlockContainerSelector) {
  const sectionBlock = expertVoiceGetSectionBannerBlock();
  if (sectionBlock && expertVoiceBlockHasRequiredPriceElements(sectionBlock)) {
    return sectionBlock;
  }

  const existingBlock = document.querySelector(expertVoiceBlockContainerSelector);
  if (existingBlock && expertVoiceBlockHasRequiredPriceElements(existingBlock)) {
    return existingBlock;
  }

  return null;
}

async function isExpertVoiceAppBlockEmbedReady(expertVoiceBlockContainerSelector) {
  return new Promise((resolve, reject) => {
    // Check if block already exists with the price nodes checkEVDiscountCode needs.
    if (expertVoiceFindReadyBannerBlock(expertVoiceBlockContainerSelector)) {
      resolve(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (expertVoiceFindReadyBannerBlock(expertVoiceBlockContainerSelector)) {
        observer.disconnect();
        resolve(true);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Fallback timeout to prevent infinite waiting
    setTimeout(() => {
      observer.disconnect();
      reject(new Error('ExpertVoice: Block not found after 5 seconds'));
    }, 5000);
  });
}

// Export functions for testing (if in a module environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkEVDependencies,
    initExpertVoice,
    checkEVDiscountCode,
    getEVOriginalPriceText,
    showEVDiscountBlockWithOverwrites,
    renderEVDiscountState,
    retryWithBackoff,
    hasEVAttributes,
    getEVVariantData,
    getEVDiscountPriceFromAPI,
    getEVProductHandle,
    getEVShopifyProductId,
    getEVSelectedVariantId,
    getEVParameterByName,
    getEVCurrentLocaleFromShopify,
    detectEVChanges,
    injectExpertVoiceAppBlock,
    setupEVMutationObserver,
    isExpertVoiceAppBlockEmbedReady,
    // Export variables if needed for testing
    expertVoiceBlockCloneId,
    expertVoiceCurrentVariantId,
    expertVoiceCurrentProductId,
    expertVoiceLastSyncedProductHandle,
    expertVoiceDiscountDataCache,
    expertVoiceCartAttributesCache,
    expertVoiceLastKnownGoodDiscountData,
    expertVoiceDiscountFetchInProgress,
    expertVoiceCurrentShopifyDealId,
    expertVoiceInitialized,
    expertVoiceVariantDetectorIntervalId,
    expertVoiceHoldCloneGeneration,
    expertVoiceInsertHoldClone,
    expertVoiceHasCachedEligibleDeal,
    expertVoiceNormalizeProductId,
    expertVoiceGetCachedDiscount,
    expertVoiceApplyCachedBannerToBlock,
    expertVoiceRefreshVisibleBannerFromCache,
    expertVoiceDismissHoldClone,
    expertVoiceEnforceSingleVisibleBanner,
    expertVoiceUsesSectionBannerBlock,
    expertVoiceGetActiveBannerBlock,
    expertVoiceMarkSectionBannerMode,
    expertVoiceRemoveStrayBodyTemplateBlocks,
    expertVoiceGetSectionBannerBlock,
    expertVoiceBlockHasRequiredPriceElements,
    expertVoiceResolveBannerContainer,
    expertVoiceFindReadyBannerBlock,
    expertVoiceIsSectionBannerFetchGap,
    expertVoiceScheduleHiddenBannerRecheck,
    expertVoicePollForCartDealId,
    expertVoiceSyncCartFromShopify,
    expertVoiceIsInsideShopifySection,
    expertVoiceRemoveExtraBannerShells,
    expertVoicePruneDuplicateBanners,
    EXPERTVOICE_TOGGLE_PRICE_BLOCK_BUILD,
    expertVoiceStartCloneGuardObserver,
    expertVoiceResetUrlChangeListeners,
    // Note: CommonJS exports primitives by copy, so this reflects the initial null value.
    // Tests should check DOM state via document.getElementById('ev-hold-clone') instead.
    expertVoiceSectionRenderPlaceholder,
    // Test-only: disconnect and clear the re-appear observer so it doesn't leak across jest module resets
    _resetReAppearObserver: () => {
      if (expertVoiceReAppearObserver) {
        expertVoiceReAppearObserver.disconnect();
        expertVoiceReAppearObserver = null;
      }
      if (expertVoiceSectionRenderPlaceholder) {
        expertVoiceSectionRenderPlaceholder.remove();
        expertVoiceSectionRenderPlaceholder = null;
      }
      if (expertVoiceCloneGuardObserver) {
        expertVoiceCloneGuardObserver.disconnect();
        expertVoiceCloneGuardObserver = null;
      }
      expertVoiceHoldCloneGeneration++;
      expertVoiceUsesSectionBannerBlock = false;
      expertVoiceResetUrlChangeListeners();
    },
  };
}
