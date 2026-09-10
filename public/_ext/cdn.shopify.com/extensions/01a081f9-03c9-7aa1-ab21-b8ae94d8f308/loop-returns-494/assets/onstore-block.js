(function() {
  "use strict";
  var __vite_style__ = document.createElement("style");
  __vite_style__.textContent = "/*@TODO: Update Variables for customization*/\n:root {\n  --loop-primary-color: #030712;\n  --loop-text-color: white;\n  --loop-badge-background: #F9FAFB;\n  --loop-badge-text: #374151;\n  --loop-button-background: #D1D5DB;\n  --loop-button-text: #1F2937;\n\n  --loop-onstore-button-padding: 14px 16px;\n  --loop-onstore-checkout-background: #030712;\n  --loop-onstore-checkout-text-color: white;\n  --loop-onstore-button-radius: 0;\n  --loop-onstore-button-gap: 0.25rem;\n  --loop-onstore-add-more-background: white;\n  --loop-onstore-add-more-text-color: black;\n  --loop-onstore-add-more-border: black;\n  --loop-onstore-casing: uppercase;\n}\n\n.loop-returns-activated .loop-onstore {\n  transform: translateY(0);\n  display: flex;\n}\n\n.loop-onstore {\n  box-sizing: border-box;\n  width: 100%;\n  position: fixed;\n  display: none;\n  align-items: center;\n  justify-content: space-between;\n  top: auto !important;\n  bottom: 0 !important;\n  left: 0;\n  z-index: 2147483647;\n  background-color: var(--onstore-bg-color);\n  color: var(--onstore-text-color);\n  transform: translateY(100%);\n  transition: transform 0.2s;\n  font-family: 'SF Pro Text', untitled sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' !important;\n  font-size: 1rem;\n  padding: 1.25rem 2rem;\n}\n\n.loop-onstore *,\n.loop-onstore *::before,\n.loop-onstore *::after {\n  box-sizing: inherit;\n}\n\n.loop-onstore--full {\n  width: 100% !important;\n  left: 0 !important;\n  right: 0 !important;\n}\n\n.loop-onstore--half-right {\n  width: 50% !important;\n  right: 0 !important;\n  left: unset !important;\n}\n\n.loop-onstore--half-left {\n  width: 50% !important;\n  left: 0 !important;\n  right: unset !important;\n}\n\n.loop-onstore__credit {\n  display: flex;\n  align-items: baseline;\n}\n\n.loop-onstore__amount {\n  margin: 0;\n  margin-right: 0.5rem;\n  font-size: var(--onstore-value-size);\n  font-weight: 800;\n  color: var(--onstore-text-color);\n}\n\n.loop-onstore__percent-discount {\n  display: none;\n  align-items: baseline;\n}\n\n.loop-onstore__percent-discount-amount {\n  font-size: var(--onstore-value-size) !important;\n  color: var(--onstore-bg-color) !important;\n  background-color: var(--onstore-text-color) !important;\n  padding: 0.25rem 0.75rem !important;\n  border-radius: 0.5rem;\n  margin-right: 0.5rem;\n}\n\n.loop-onstore__copy {\n  margin: 0;\n  color: var(--onstore-text-color);\n  font-size: var(--onstore-label-size);\n}\n\n.loop-onstore__back {\n  color: var(--onstore-bg-color);\n  background: var(--onstore-text-color);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.75rem 1.25rem;\n  margin-left: 0;\n  border: none;\n  appearance: none;\n  transition: all 0.2s;\n  font-size: var(--onstore-button-size);\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.loop-onstore__back-icon {\n  color: var(--onstore-bg-color);\n  fill: var(--onstore-bg-color);\n  font-size: var(--button-size);\n}\n\n.loop-onstore__back span {\n  font-size: var(--onstore-button-size);\n}\n\n.loop-onstore__back:hover {\n  opacity: 0.7;\n}\n\n.loop-returns-modal {\n  font-family: 'SF Pro Text', untitled sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,\n    Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji !important;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-style: normal;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 999;\n}\n\n.loop-onstore__percent-copy {\n  display: none;\n}\n\n.loop-returns-modal__backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(65, 69, 74, 0.7);\n}\n\n.loop-returns-modal__content {\n  overflow: auto;\n  max-height: 600px;\n  background-color: #fff;\n  box-shadow: 0px 1px 4px rgb(0 0 0 / 12%), 0px 6px 12px rgb(0 0 0 / 8%);\n  border-radius: 8px;\n  width: 500px;\n  max-width: 700px;\n  position: relative;\n  z-index: 1000;\n}\n\n.loop-returns-modal__header {\n  color: #3256e5;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 15px 20px;\n  border-bottom: 1px solid #eaeaea;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.loop-returns-modal__close--icon {\n  height: 20px;\n  width: 20px;\n  cursor: pointer;\n}\n\n.loop-returns-modal__body {\n  padding: 20px;\n}\n\n.loop-onstore__credit-copy {\n  display: none;\n}\n\n.loop-onstore__mobile-credit-copy {\n  display: block;\n}\n\nloop-onstore {\n  flex: 1;\n}\nloop-onstore::part(loop-onstore-checkout-btn) {\n  padding: var(--loop-onstore-button-padding);\n  background: var(--loop-onstore-checkout-background);\n  color: var(--loop-onstore-checkout-text-color);\n  border-radius: var(--loop-onstore-button-radius);\n  cursor: pointer;\n  font-weight: 500;\n  text-transform: var(--loop-onstore-casing);\n}\nloop-onstore::part(loop-onstore-add-more-btn) {\n  padding: var(--loop-onstore-button-padding);\n  background: transparent;\n  border: 1px solid var(--loop-onstore-add-more-border);\n  border-radius: var(--loop-onstore-button-radius);\n  color: var(--loop-onstore-add-more-text-color);\n  cursor: pointer;\n  font-weight: 500;\n  text-transform: var(--loop-onstore-casing);\n}\n\n@media screen and (max-width: 680px) {\n  .loop-onstore {\n    z-index: 200;\n    bottom: 3.2rem;\n    padding: 1rem 1.5rem;\n  }\n\n  .loop-onstore__copy {\n    font-size: 0.875rem !important;\n  }\n\n  .loop-onstore__amount,\n  .loop-onstore__percent-discount-amount {\n    font-size: 1rem !important;\n  }\n\n  .loop-onstore__back {\n    padding: 0.25rem 0.5rem;\n  }\n\n  .loop-onstore__percent-discount-amount {\n    padding: 0.25rem 0.5rem;\n  }\n\n  .loop-onstore--half-left, .loop-onstore--half-right {\n    width: 100% !important;\n  }\n}\n\n@media screen and (min-width: 680px) {\n  .loop-onstore__credit-copy {\n    display: block;\n  }\n\n  .loop-onstore__mobile-credit-copy {\n    display: none;\n  }\n}\n/*$vite$:1*/";
  document.head.appendChild(__vite_style__);
  const onstoreBlock = document.querySelector("#loop-onstore-data");
  const onstoreRootEl = document.querySelector(":root");
  if (onstoreBlock) {
    const {
      textcolor,
      bgcolor,
      valuesize,
      labelsize,
      buttonsize
    } = onstoreBlock.dataset;
    if (onstoreRootEl) {
      onstoreRootEl.style.setProperty("--onstore-bg-color", bgcolor || "#000000");
      onstoreRootEl.style.setProperty("--onstore-text-color", textcolor || "#ffffff");
      onstoreRootEl.style.setProperty("--onstore-value-size", valuesize ? `${valuesize}px` : "15px");
      onstoreRootEl.style.setProperty("--onstore-label-size", labelsize ? `${labelsize}px` : "10px");
      onstoreRootEl.style.setProperty(
        "--onstore-button-size",
        buttonsize ? `${buttonsize}px` : "10px"
      );
    }
  }
  const {
    showOnstoreBar,
    apikey,
    checkoutselector,
    cartdetails,
    preservecart,
    label,
    mobileLabel,
    alignment,
    replacecheckoutbutton
  } = onstoreBlock.dataset;
  const storeName = "loop-onstore-data";
  const storage = {
    /**
     * Get an item from localstorage
     * @param {string} name
     * @returns {*}
     */
    get(name = storeName) {
      return JSON.parse(localStorage.getItem(name) || null);
    },
    /**
     * Save an item to localstorage
     * @param {*} storeData
     * @param {string} name - the key to save to
     * @returns {void}
     */
    set(storeData, name = storeName) {
      localStorage.setItem(name, JSON.stringify(storeData));
    },
    /**
     * Remove an item from localstorage
     * @param {string} name
     * @returns {void}
     */
    remove(name = storeName) {
      localStorage.removeItem(name);
    }
  };
  let loopOnStoreState = {
    debug: false,
    testMode: false,
    redirect: true,
    active: false,
    params: null,
    key: null,
    api: null,
    token: null,
    id: null,
    fullPayload: false,
    preserveCart: false,
    draftOrderId: null,
    inExperiment: false,
    singleItem: false,
    attach: null,
    isEmbeddedPortal: false
  };
  const getState = (key) => {
    if (key) {
      return loopOnStoreState[key];
    }
    return loopOnStoreState;
  };
  const setState = (key, data) => {
    loopOnStoreState[key] = data;
    storage.set(loopOnStoreState);
  };
  const initState = () => {
    const saved = storage.get();
    if (saved) {
      loopOnStoreState = {
        ...loopOnStoreState,
        ...saved
      };
    }
  };
  const loopOnstoreEncrypt = (value) => {
    const isObject = typeof value === "object" && value !== null;
    const valueAsString = isObject ? JSON.stringify(value) : String(value);
    return window.btoa(unescape(encodeURIComponent(valueAsString)));
  };
  const __vite_import_meta_env__$1 = {};
  const ALLOWED_API_HOSTS = ["api.loopreturns.com"];
  const DEFAULT_API_URL = "https://api.loopreturns.com/api/v1/";
  const isAllowedApiHost = (url) => {
    try {
      const parsedUrl = new URL(url);
      return ALLOWED_API_HOSTS.includes(parsedUrl.hostname);
    } catch {
      return false;
    }
  };
  const getApi = () => {
    const configuredApi = getState("api");
    if (configuredApi) {
      if (isAllowedApiHost(configuredApi)) {
        return configuredApi;
      }
      console.warn("Invalid API host configured, falling back to production");
    }
    if (typeof __vite_import_meta_env__$1 !== "undefined" && "https://api.loopreturns.com/api/v1/") {
      if (isAllowedApiHost("https://api.loopreturns.com/api/v1/")) {
        return "https://api.loopreturns.com/api/v1/";
      }
      console.warn("Invalid VITE_API_URL configured, falling back to production");
    }
    return DEFAULT_API_URL;
  };
  const mapCart = (shopifyCart) => {
    const {
      token,
      total_discount,
      original_total_price,
      total_price,
      items,
      currency,
      items_subtotal_price,
      cart_level_discount_applications
    } = shopifyCart;
    return loopOnstoreEncrypt({
      token,
      total_discount,
      original_total_price,
      total_price,
      items: items.map((item) => {
        const {
          id,
          quantity,
          variant_id,
          price,
          original_price,
          discounted_price,
          original_line_price,
          line_price,
          total_discount: total_discount2,
          final_price,
          final_line_price,
          taxable,
          product_id,
          discount_allocations,
          line_level_discount_allocations,
          properties
        } = item;
        return {
          id,
          quantity,
          variant_id,
          price,
          original_price,
          discounted_price,
          original_line_price,
          line_price,
          total_discount: total_discount2,
          final_price,
          final_line_price,
          taxable,
          product_id,
          discount_allocations,
          line_level_discount_allocations,
          properties
        };
      }),
      currency,
      items_subtotal_price,
      cart_level_discount_applications
    });
  };
  const request = async (url, type = "GET", payload, key = getState("key") || "") => {
    try {
      const data = payload !== void 0 ? JSON.stringify(payload) : null;
      const response = await fetch(url, {
        method: type,
        body: data,
        headers: {
          "X-Authorization": key,
          "Content-Type": "application/json"
        }
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      return { error: err };
    }
  };
  const getShopifyCart = () => {
    const url = "/cart.js";
    return request(url);
  };
  const clearShopifyCart = () => {
    const url = "/cart/clear.js";
    return request(url, "POST");
  };
  const updateShopifyCart = (cart) => {
    if (!cart?.length) {
      return clearShopifyCart();
    }
    const url = "/cart/update.js";
    const updates = cart?.reduce((acc, cur) => {
      if (acc[cur]) {
        return {
          ...acc,
          [cur]: acc[cur] + 1
        };
      }
      return {
        ...acc,
        [cur]: 1
      };
    }, {});
    return request(url, "POST", { updates });
  };
  const getLoopCart = (token) => {
    const api = getApi();
    const url = `${api}onstore/${token}`;
    return request(url);
  };
  const createLoopCart = (variants, cart) => {
    const api = getApi();
    const url = `${api}onstore/`;
    let fullPayload = {};
    if (getState("fullPayload")) {
      fullPayload = { shopify: mapCart(cart) };
    }
    return request(url, "POST", {
      cart: variants,
      draftOrderId: getState("draftOrderId"),
      ...fullPayload
    });
  };
  const updateLoopCart = (token, variants, cart) => {
    const api = getApi();
    const url = `${api}onstore/${token}`;
    let fullPayload = {};
    if (getState("fullPayload")) {
      fullPayload = { shopify: mapCart(cart) };
    }
    return request(url, "POST", {
      cart: variants,
      draftOrderId: getState("draftOrderId"),
      ...fullPayload
    });
  };
  const checkOnstoreEligibility = async (apikey2) => {
    const api = getApi();
    const url = `${api}onstore/check`;
    try {
      const response = await request(url, "GET", void 0, apikey2);
      if (response.enabled) {
        return {
          ...response,
          successful: true
        };
      }
      if (response.error) {
        return {
          ...response,
          successful: false
        };
      }
      return response;
    } catch (err) {
      console.error(err);
      return {
        enabled: null,
        successful: false,
        error: err
      };
    }
  };
  const loopLogger = new Proxy(
    {},
    {
      get(obj, prop) {
        if (!obj[prop] && getState("debug")) {
          return (arg) => {
            if (typeof arg === "string") {
              return console[prop](`%c${arg}`, "color: #3256E6");
            }
            return console[prop](arg);
          };
        }
        return obj[prop] || function() {
        };
      }
    }
  );
  class LoopOnstoreButton extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      if (!LoopOnstore.isActive() || !getState("inExperiment")) return;
      const attach = getState("attach");
      const checkoutButtonList = document.querySelectorAll(attach) ?? [];
      checkoutButtonList.forEach((btn) => btn.remove());
      const container = this.buildBtnContainer();
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(container);
    }
    buildBtnContainer() {
      const container = document.createElement("div");
      container.className = "loop-onstore-btn-container";
      container.style = "display:flex; flex-direction: column; gap: 1rem;";
      const checkoutBtn = this.buildCheckoutBtn();
      const addMoreBtn = this.buildAddMoreBtn();
      container.appendChild(checkoutBtn);
      if (!getState("singleItem")) {
        container.appendChild(addMoreBtn);
      }
      return container;
    }
    buildAddMoreBtn() {
      const addMoreBtn = document.createElement("button");
      addMoreBtn.textContent = "Select more items to return";
      addMoreBtn.part = "loop-onstore-add-more-btn";
      addMoreBtn.addEventListener("click", this.handleAddMore);
      return addMoreBtn;
    }
    buildCheckoutBtn() {
      const checkoutBtn = document.createElement("button");
      checkoutBtn.textContent = "Checkout";
      checkoutBtn.part = "loop-onstore-checkout-btn";
      checkoutBtn.addEventListener("click", this.handleCheckout);
      return checkoutBtn;
    }
    handleCheckout() {
      LoopOnstore.submit();
    }
    handleAddMore() {
      LoopOnstore.submit(getState("key"), null, "lineItems");
    }
  }
  const attachListeners = (selectors, listener) => {
    const attached = [...document.querySelectorAll(selectors)];
    if (attached.length > 1) {
      loopLogger.warn(`Attaching Loop.submit() to more than one element. Make sure you're using the right selector!`);
    }
    attached.forEach((element) => {
      console.log(`Attaching Onstore listener for element with selector ${selectors}: `, element);
      element.addEventListener("click", listener);
    });
    if (!customElements.get("loop-onstore")) {
      customElements.define("loop-onstore", LoopOnstoreButton);
    }
    return attached;
  };
  const getNodes = (list, type) => {
    return list.filter((item) => item[type].length).reduce((acc, item) => {
      return [
        ...acc,
        ...item[type]
      ];
    }, []);
  };
  const loopOnstoreCurrencyMap = {
    JPY: {
      constant: 1,
      decimals: 0,
      decimalSymbol: "",
      thousandSymbol: ",",
      symbol: "¥"
    },
    GBP: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "£"
    },
    EUR: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ",",
      thousandSymbol: ".",
      symbol: "€"
    },
    USD: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "$"
    },
    CAD: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "$"
    },
    AUD: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "$"
    },
    HKD: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "$"
    },
    NZD: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "$"
    },
    SGD: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: ",",
      symbol: "$"
    },
    CHF: {
      constant: 100,
      decimals: 2,
      decimalSymbol: ".",
      thousandSymbol: "'",
      symbol: "CHF"
    }
  };
  const splitCurrency = (value, rules) => {
    const [dollars, cents] = Number.parseFloat(value / rules.constant).toFixed(rules.decimals).split(".");
    return {
      dollars: dollars ? dollars.replace(/\B(?=(\d{3})+(?!\d))/g, rules.thousandSymbol) : "0",
      cents: cents ? cents : ""
    };
  };
  const format = (value, currency = "USD", { showCode = false } = {}) => {
    if (!value) {
      return "";
    }
    const rules = loopOnstoreCurrencyMap[currency];
    const ambiguousSymbol = rules?.symbol === "$" && currency !== "USD";
    const suffix = showCode && ambiguousSymbol ? ` ${currency}` : "";
    if (rules) {
      const { dollars, cents } = splitCurrency(value, rules);
      return `${rules.symbol}${dollars}${rules.decimalSymbol}${cents}${suffix}`;
    }
    return `${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value / 100)}${suffix}`;
  };
  const getStorefrontCurrency = (fallbackCurrency = "USD") => {
    const shopifyCurrency = typeof window !== "undefined" ? window.Shopify?.currency : void 0;
    const active = shopifyCurrency?.active;
    const rate = Number.parseFloat(shopifyCurrency?.rate);
    if (active && Number.isFinite(rate) && rate > 0) {
      return { currency: active, rate };
    }
    return { currency: fallbackCurrency, rate: 1 };
  };
  const formatCredit = (baseMinorValue, fallbackCurrency = "USD") => {
    const { currency, rate } = getStorefrontCurrency(fallbackCurrency);
    const converted = Math.round((baseMinorValue || 0) * rate);
    return format(converted, currency, { showCode: true });
  };
  const syncCart = (variants, cart) => {
    loopLogger.info("Creating cart request...");
    loopLogger.info("Syncing these variants to the Loop cart:");
    loopLogger.info(variants);
    const token = getState("token");
    if (token) {
      return updateLoopCart(token, variants, cart).then((res) => {
        return {
          ...res,
          token
        };
      });
    }
    return createLoopCart(variants, cart);
  };
  const convertNumbers = (str) => {
    const converted = Number(str);
    return Number.isNaN(converted) ? str : converted;
  };
  const params = {
    /**
     * Get an object of key/values pairs from the query params
     * @param {string} str
     * @returns {object}
     */
    get(str = window.location.search) {
      return str.substr(1).split("&").reduce((acc, cur) => {
        const [key, value] = decodeURIComponent(cur).split("=");
        return {
          ...acc,
          [key]: convertNumbers(value)
        };
      }, {});
    },
    /**
     * Looks for loop data in the query params
     * @param {string} str
     * @returns {boolean}
     */
    hasLoopData(str = window.location.search) {
      return str.includes("loop_total");
    },
    /**
     *
     * @param {object} obj - an object of key/value pairs from the current query params
     * @param {string} prefix - the query param prefix to look for
     * @returns {array}
     */
    getKeys(obj, prefix = "loop") {
      return Object.keys(obj).filter((key) => key.startsWith(prefix));
    },
    /**
     * Removes a list of params from query params
     * @param {array} keys - an array of keys to remove
     * @returns {string}
     */
    clear(keys = []) {
      const params2 = Object.entries(this.get()).reduce((acc, [key, value]) => {
        if (keys.includes(key)) {
          return acc;
        }
        const prefix = !acc.length ? "?" : "&";
        return `${acc}${prefix}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }, "");
      window.history.replaceState({}, "", `${window.location.origin}${window.location.pathname}${params2}`);
    }
  };
  const stringToBool = (boolString) => boolString === "true";
  const onstoreBannerTemplate = (label2 = "in available credit", mobileLabel2 = "credit") => `
  <div class="loop-onstore__percent-discount">
    <span class="loop-onstore__amount loop-onstore__percent-discount-amount"></span>
    <span class="loop-onstore__copy loop-onstore__percent-discount-copy">
        applied at checkout
    </span>
  </div>
  <div class="loop-onstore__credit">
    <span class="loop-onstore__amount loop-onstore__credit-amount"></span>
    <span class="loop-onstore__copy loop-onstore__credit-copy">
      ${label2}
    </span>
    <span class="loop-onstore__copy loop-onstore__mobile-credit-copy">
      ${mobileLabel2} 
    </span>
  </div>
  <button class="loop-onstore__back">
    <svg
      class="loop-onstore__back-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.6667 8H3.33333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 12.6666L3.33333 7.99998L8 3.33331" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Go back</span>
  </button>
`;
  const loopOnstoreSelectors = {
    credit: {
      container: ".loop-onstore__credit",
      amount: ".loop-onstore__credit-amount"
    },
    percentDiscount: {
      container: ".loop-onstore__percent-discount",
      amount: ".loop-onstore__percent-discount-amount"
    }
  };
  const createBar = (data = {}, barOpts = {}) => {
    const element = document.createElement("div");
    element.classList.add("loop-onstore");
    element.classList.add(`loop-onstore--${barOpts.alignment}`);
    element.id = "loop-onstore";
    element.innerHTML = onstoreBannerTemplate(barOpts.label, barOpts.mobileLabel);
    Object.keys(data).forEach((sectionKey) => {
      const sectionData = data[sectionKey];
      const sectionSelectors = loopOnstoreSelectors[sectionKey];
      if (sectionSelectors && sectionData) {
        const sectionElement = element.querySelector(sectionSelectors.container);
        if (sectionElement && sectionElement.matches(sectionSelectors.container)) {
          sectionElement.style.display = "flex";
          const amountElement = sectionElement.querySelector(sectionSelectors.amount);
          if (amountElement && sectionData.amount) {
            amountElement.textContent = sectionData.amount;
            renderProperty(sectionElement, sectionData.amount, sectionSelectors.amount);
          }
        }
      }
    });
    const backButton = element.querySelector(".loop-onstore__back");
    if (backButton) {
      backButton.addEventListener("click", async () => {
        const cart = await getShopifyCart();
        const variants = cart.items.reduce((acc, item) => {
          return [...acc, ...Array(item.quantity).fill(item.variant_id)];
        }, []);
        const loopCart = await syncCart(variants, cart);
        LoopOnstore$1.backToLoop(loopCart.token, "lineItems");
      });
    }
    return element;
  };
  const SIDE_CART_STYLE_ID = "loop-onstore-side-cart-height";
  const BAR_HEIGHT_PROPERTY = "--loop-onstore-bar-height";
  let barSizeObserver = null;
  let barResizeListener = null;
  const setBarHeightProperty = (bar) => {
    document.documentElement.style.setProperty(BAR_HEIGHT_PROPERTY, `${bar.clientHeight}px`);
  };
  const watchBarHeight = (bar) => {
    if (typeof ResizeObserver !== "undefined") {
      barSizeObserver?.disconnect();
      barSizeObserver = new ResizeObserver(() => setBarHeightProperty(bar));
      barSizeObserver.observe(bar);
      return;
    }
    if (barResizeListener) {
      window.removeEventListener("resize", barResizeListener);
    }
    barResizeListener = () => setBarHeightProperty(bar);
    window.addEventListener("resize", barResizeListener);
  };
  const writeSideCartRule = (selector) => {
    let styleElement = document.getElementById(SIDE_CART_STYLE_ID);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = SIDE_CART_STYLE_ID;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = `body.loop-returns-activated :is(${selector}) { height: calc(100% - var(${BAR_HEIGHT_PROPERTY}, 0px)) !important; }`;
  };
  const isValidSelector = (selector) => {
    try {
      document.querySelector(selector);
      return true;
    } catch {
      return false;
    }
  };
  const liftCart = () => {
    const onstoreBlock2 = document.querySelector("#loop-onstore-data");
    if (!onstoreBlock2) {
      return;
    }
    const { bumpsidecart, sidecartselector } = onstoreBlock2.dataset;
    if (!stringToBool(bumpsidecart) || !sidecartselector) {
      return;
    }
    const loopOnstoreBar = document.querySelector(".loop-onstore");
    if (!loopOnstoreBar || !isValidSelector(sidecartselector)) {
      return;
    }
    setBarHeightProperty(loopOnstoreBar);
    writeSideCartRule(sidecartselector);
    watchBarHeight(loopOnstoreBar);
  };
  const renderProperty = (ref, prop, selector) => {
    const element = ref.querySelector(selector);
    element.textContent = prop;
    return ref;
  };
  const loopRender = (existing, data = {}, barOpts = {}) => {
    const element = createBar(data, barOpts);
    return document.body.appendChild(element);
  };
  const generateModalTemplate = (modalOpts = { modalHeader: "Loop On-Store Installed", modalBody: "Test Mode Successful" }) => {
    return `
    <div class="loop-returns-modal">
      <div class="loop-returns-modal__backdrop"></div>
      <div class="loop-returns-modal__content">
        <div class="loop-returns-modal__header">
          <div class="loop-returns-modal__text">${modalOpts.modalHeader}</div>
          <div class="loop-returns-modal__close">
          <svg class="loop-returns-modal__close--icon width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M0 7.50024C0 3.36474 3.3645 0.000244141 7.5 0.000244141C11.6355 0.000244141 15 3.36474 15 7.50024C15 11.6357 11.6355 15.0002 7.5 15.0002C3.3645 15.0002 0 11.6357 0 7.50024ZM5.78025 4.71999C5.6388 4.58338 5.44935 4.50778 5.2527 4.50949C5.05605 4.5112 4.86794 4.59007 4.72889 4.72913C4.58983 4.86819 4.51095 5.0563 4.50924 5.25294C4.50754 5.44959 4.58313 5.63904 4.71975 5.78049L6.4395 7.50024L4.71975 9.21999C4.64812 9.28918 4.59098 9.37194 4.55167 9.46344C4.51237 9.55494 4.49168 9.65336 4.49081 9.75294C4.48995 9.85253 4.50892 9.95129 4.54663 10.0435C4.58434 10.1356 4.64003 10.2194 4.71045 10.2898C4.78087 10.3602 4.86461 10.4159 4.95678 10.4536C5.04896 10.4913 5.14772 10.5103 5.2473 10.5094C5.34689 10.5086 5.4453 10.4879 5.5368 10.4486C5.62831 10.4093 5.71106 10.3521 5.78025 10.2805L7.5 8.56074L9.21975 10.2805C9.3612 10.4171 9.55065 10.4927 9.7473 10.491C9.94395 10.4893 10.1321 10.4104 10.2711 10.2714C10.4102 10.1323 10.489 9.94419 10.4908 9.74754C10.4925 9.5509 10.4169 9.36145 10.2802 9.21999L8.5605 7.50024L10.2802 5.78049C10.4169 5.63904 10.4925 5.44959 10.4908 5.25294C10.489 5.0563 10.4102 4.86819 10.2711 4.72913C10.1321 4.59007 9.94395 4.5112 9.7473 4.50949C9.55065 4.50778 9.3612 4.58338 9.21975 4.71999L7.5 6.43974L5.78025 4.71999Z"
              fill="black" />
      </svg>
          </div>
        </div>
        <div class="loop-returns-modal__body">
          ${modalOpts.modalBody}
          </div>
        </div>
      </div>
    </div>`;
  };
  const loopOnstoreOpenModal = (modalOpts) => {
    document.body.style.overflow = "hidden";
    const modal = document.createElement("div");
    modal.classList.add("loop-returns-modal");
    modal.innerHTML = generateModalTemplate(modalOpts);
    document.body.appendChild(modal);
    const closeModal = document.querySelector(".loop-returns-modal__close");
    const closeOutsideModal = document.querySelector(
      ".loop-returns-modal__backdrop"
    );
    const handler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", handler);
      }
    };
    document.addEventListener("keydown", handler);
    closeModal?.addEventListener("click", () => {
      modal.remove();
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "auto";
    });
    closeOutsideModal?.addEventListener("click", () => {
      modal.remove();
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "auto";
    });
  };
  const loopCheckoutBtnSelector = "loop-checkout-button";
  const LOOP_REPLACED_ATTR = "data-loop-replaced";
  const handleCheckoutButton = (oldCheckoutBtnSelector, listener, attachListeners2, replaceCheckoutButton, apikey2) => {
    try {
      if (!oldCheckoutBtnSelector) throw new Error("No checkout button selector provided.");
      if (!replaceCheckoutButton) return attachListeners2(oldCheckoutBtnSelector, listener);
      const oldSelectors = oldCheckoutBtnSelector.split(",");
      const allAttached = oldSelectors.flatMap((selector) => {
        const shopifyBtn = document.querySelector(selector);
        if (!shopifyBtn) {
          throw new Error(`Button with ${selector} selector not found in DOM.`, apikey2);
        }
        if (shopifyBtn.hasAttribute(LOOP_REPLACED_ATTR)) {
          return attachListeners2(`#${loopCheckoutBtnSelector}`, listener);
        }
        const newBtn = document.createElement("button");
        newBtn.classList = shopifyBtn.classList;
        newBtn.setAttribute("id", loopCheckoutBtnSelector);
        newBtn.setAttribute(LOOP_REPLACED_ATTR, "true");
        newBtn.innerText = shopifyBtn.innerText;
        newBtn.innerHTML = shopifyBtn.innerHTML;
        const shopifyBtnParent = shopifyBtn.parentElement;
        shopifyBtnParent.appendChild(newBtn);
        shopifyBtn.remove();
        return attachListeners2(`#${loopCheckoutBtnSelector}`, listener);
      });
      return allAttached;
    } catch (e) {
      console.error(e);
      return [];
    }
  };
  const isUnique = (selector) => document.querySelectorAll(selector).length === 1;
  const getUniqueClassSelector = (element) => {
    if (element.classList.length > 0) {
      const classNames = Array.from(element.classList);
      let selector = "";
      for (const className of classNames) {
        selector += `.${className}`;
        if (isUnique(selector)) {
          return selector;
        }
      }
    }
    return "";
  };
  const getUniqueAttributesSelector = (element, attributes) => {
    for (let attr of attributes) {
      if (element.hasAttribute(attr)) {
        let selector = `[${attr}="${element.getAttribute(attr)}"]`;
        if (isUnique(selector)) {
          return selector;
        }
      }
    }
    return "";
  };
  const buildUniqueSelector = (element) => {
    let selector = element.nodeName.toLowerCase();
    const classSelector = getUniqueClassSelector(element);
    if (classSelector) {
      return classSelector;
    }
    if (element.id && isUnique(`#${element.id}`)) {
      return `#${element.id}`;
    }
    const attributeSelector = getUniqueAttributesSelector(element, ["name", "type", "alt", "title", "value"]);
    if (attributeSelector) {
      selector += attributeSelector;
    }
    if (!attributeSelector) {
      let parent = element.parentNode;
      if (!parent) return selector;
      let index = Array.prototype.indexOf.call(parent.children, element) + 1;
      return buildUniqueSelector(parent) + " > " + selector + `:nth-child(${index})`;
    }
    return selector;
  };
  function inspect() {
    const fn = (e) => {
      e.preventDefault();
      console.log(buildUniqueSelector(e.target));
      console.log("Disabling LoopOnstore inspector.");
      window.removeEventListener("click", fn);
    };
    console.log("Enabling LoopOnstore inspector. Click your checkout button to generate a unique selector.");
    window.addEventListener("click", fn);
  }
  const __vite_import_meta_env__ = {};
  const loopElements = {
    bar: null,
    attached: []
  };
  const getAppProxyPath = () => {
    if (typeof __vite_import_meta_env__ !== "undefined" && "returns") {
      return "returns";
    }
    return "returns";
  };
  const loopInit = async (opts) => {
    initState();
    const restoreSessionAfterCookieConsent = function() {
      const currentState = getState();
      if (currentState.params) {
        storage.set(currentState);
      }
    };
    window.addEventListener("CookiebotOnAccept", restoreSessionAfterCookieConsent, false);
    window.addEventListener("CookiebotOnDecline", restoreSessionAfterCookieConsent, false);
    if (opts?.key) {
      loopSetKey(opts.key);
    } else if (!getState("key")) {
      throw new Error("Loop Returns On-Store API requires an API key.");
    }
    if (opts.isInBuilder) {
      builderMode(opts.barOpts);
    }
    if (opts?.api) {
      loopLogger.info(`Setting api to ${opts.api}.`);
      setState("api", opts.api);
    }
    if (opts?.preservecart) {
      loopLogger.info(`Setting preserve cart to ${opts.preservecart}`);
      setState("preserveCart", opts.preservecart);
    }
    const loopCurrentParams = params.get();
    if (params.hasLoopData()) {
      if (getState("id") !== loopCurrentParams.loop_return_id) {
        setState("token", null);
      }
      setState("params", loopCurrentParams);
      setState("id", loopCurrentParams.loop_return_id);
      setState("inExperiment", Boolean(loopCurrentParams?.loop_experiment_b_eligible === "true"));
      setState("singleItem", Boolean(loopCurrentParams?.loop_single_item_eligible === "true"));
      setState("isEmbeddedPortal", Boolean(loopCurrentParams?.loop_embedded_portal === "true"));
      if (getState("inExperiment")) {
        setState("preserveCart", true);
      }
      params.clear(params.getKeys(loopCurrentParams));
      if (!opts?.preservecart) {
        await clearShopifyCart();
      }
      const token = getState("token");
      if (token) {
        try {
          const cart = await getLoopCart(token);
          await updateShopifyCart(cart);
          loopLogger.info("Updating Shopify cart to match loop cart.");
          document.dispatchEvent(new Event("Loop:Cart Update"));
        } catch (error) {
          loopLogger.warn("Unable to reboot cart");
          loopLogger.error(error);
        }
      }
    }
    const data = getState("params");
    if (data) {
      setState("active", true);
      document.body.classList.add("loop-returns-activated");
      const renderData = {};
      if (data.loop_total ?? 0 > 0) {
        renderData.credit = {
          amount: formatCredit(data.loop_total, data.loop_currency)
        };
      }
      if (data.loop_discount_percentage ?? 0 > 0) {
        renderData.percentDiscount = {
          amount: `${data.loop_discount_percentage}% off`
        };
      }
      const bar = loopRender(null, renderData, opts.barOpts);
      loopElements.bar = bar;
      loopLogger.info("Loop returns activated");
      document.dispatchEvent(new Event("Loop:Activated"));
    }
    if (opts?.attach) {
      setState("attach", opts?.attach);
      loopAttach(opts.attach, opts.replacecheckoutbutton, opts.isInBuilder, opts.key);
    }
    if (opts?.cartdetails) {
      setState("fullPayload", opts?.cartdetails);
    }
    window.LoopOnstore = {
      testMode: loopTestMode,
      testModeNewShopperFlow: loopTestModeNewShopperFlow,
      testModeOff: loopTestModeOff,
      isActive: loopIsActive,
      backToLoop,
      submit: loopSubmit,
      info,
      inspect
    };
  };
  const loopTestMode = (redirect = true) => {
    setState("debug", true);
    setState("testMode", true);
    loopLogger.info("Test mode activated");
    setState("redirect", redirect);
    window.location = `${window.location.origin}${window.location.pathname}?loop_domain=example.loopreturns.com&loop_return_id=this-is-a-test&loop_currency=USD&loop_total=12099&loop_discount_percentage=25&loop_base=799&loop_credit=500&loop_subdomain=example&loop_redirect_url=example.loopreturns.com%2F%23%2Fcredit&loop_customer_name=Jane%20Doe`;
  };
  const loopTestModeNewShopperFlow = () => {
    setState("debug", true);
    setState("testMode", true);
    setState("redirect", false);
    loopLogger.info("Test mode Flow B activated");
    window.location = `${window.location.origin}${window.location.pathname}?loop_domain=example.loopreturns.com&loop_return_id=this-is-a-test&loop_currency=USD&loop_total=12099&loop_discount_percentage=25&loop_base=799&loop_credit=500&loop_subdomain=example&loop_redirect_url=example.loopreturns.com%2F%23%2Fcredit&loop_customer_name=Jane%20Doe&loop_experiment_b_eligible=true&loop_single_item_eligible=false`;
  };
  const loopTestModeOff = () => {
    setState("debug", false);
    setState("testMode", false);
    loopLogger.info("Test mode deactivated");
    setState("redirect", true);
    localStorage.removeItem("loop-onstore-data");
    window.location.reload();
  };
  const builderMode = (barOpts) => {
    setState("debug", true);
    document.body.classList.add("loop-returns-activated");
    const bar = loopRender(null, { credit: { amount: format(1e4, "USD") }, percentDiscount: { amount: "25% off" } }, barOpts);
    loopElements.bar = bar;
  };
  const loopDebug = () => {
    const loopToggled = !getState("debug");
    setState("debug", loopToggled);
    return `Debug ${loopToggled ? "on" : "off"}`;
  };
  const loopSetKey = (key) => {
    if (!key || typeof key !== "string") {
      return console.error("Your api key is either undefined or not a string.");
    }
    setState("key", key);
    loopLogger.info(`Loop Returns On-Store API key set.`);
  };
  const loopSubmit = async (apikey2, variants, redirectTo = null) => {
    let cart = null;
    if (!variants) {
      loopLogger.info("Requesting updated cart from Shopify");
      cart = await getShopifyCart();
      variants = cart.items.reduce((acc, item) => {
        return [...acc, ...Array(item.quantity).fill(item.variant_id)];
      }, []);
    }
    try {
      if (window.stackableService && typeof window.stackableService?.send === "function") {
        window.stackableService.send({
          type: "checkout",
          data: { preventRedirect: true }
        });
        let loopTries = 0;
        await (async () => {
          return await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (window.stackableService.state.context.draftOrderId || loopTries === 6) {
                resolve();
                clearInterval(interval);
              }
              loopTries++;
            }, 500);
          });
        })();
        setState(
          "draftOrderId",
          window.stackableService.state.context.draftOrderId
        );
      }
      const loopCart = await syncCart(variants, cart);
      setState("token", loopCart.token);
      const preserveCart = getState("preserveCart");
      if (!preserveCart) {
        await clearShopifyCart();
      }
      backToLoop(loopCart.token, redirectTo);
      return Promise.resolve(loopCart.token);
    } catch (error) {
      loopLogger.info("Unable to create Loop Returns cart:");
      loopLogger.error(error);
      return Promise.reject(error);
    }
  };
  const loopAttach = (selectors, replaceCheckoutButton, isInBuilderMode, apikey2) => {
    if (getState("active") || isInBuilderMode) {
      liftCart();
      const listener = async (e) => {
        if (getState("active") || isInBuilderMode) {
          e.stopImmediatePropagation();
          e.preventDefault();
          e.target.disabled = true;
          e.target.classList.add("loop-activated");
          try {
            await loopSubmit(apikey2);
            e.target.disabled = false;
            e.target.classList.remove("loop-activated");
          } catch (_error) {
            e.target.disabled = false;
            e.target.classList.remove("loop-activated");
          }
        }
      };
      loopElements.attached = handleCheckoutButton(selectors, listener, attachListeners, replaceCheckoutButton, apikey2);
      const observer = new MutationObserver((list) => {
        const added = getNodes(list, "addedNodes");
        if (added.length) {
          const changed = added.some((item) => {
            if (!item || item.nodeType !== 1) return false;
            if (item.hasAttribute && item.hasAttribute(LOOP_REPLACED_ATTR)) return false;
            return item.matches(selectors) || item.querySelector(selectors);
          });
          if (changed) {
            let alreadyAttached = false;
            const splitSelectors = selectors.split(",");
            const flatAttached = (loopElements?.attached ?? []).flat();
            if (flatAttached.length > 0) {
              flatAttached.forEach((element) => {
                splitSelectors.forEach((selector) => {
                  const selectorElement = document.querySelector(selector);
                  if (selectorElement === element) {
                    alreadyAttached = true;
                  }
                });
              });
            }
            if (!alreadyAttached) {
              loopElements.attached = handleCheckoutButton(selectors, listener, attachListeners, replaceCheckoutButton, apikey2);
              loopLogger.info(`Loop reattached to: "${selectors}"`);
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
  const getPageFromRedirectUrl = (redirectUrl) => {
    if (!redirectUrl || typeof redirectUrl !== "string") {
      return null;
    }
    const hashMatch = redirectUrl.match(/#\/([^/?]+)/);
    if (!hashMatch) {
      return null;
    }
    const route = hashMatch[1].toLowerCase();
    const routeToPage = {
      exchange: "exchange",
      credit: "credit",
      review: "review",
      return: "return"
    };
    return routeToPage[route] || null;
  };
  const resolveTrustedCartReturnUrl = (cartReturnUrl, loopDomain) => {
    if (!cartReturnUrl || !loopDomain || typeof cartReturnUrl !== "string" || typeof loopDomain !== "string") {
      return null;
    }
    try {
      const parsed = new URL(cartReturnUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      const expectedHost = new URL(
        loopDomain.includes("://") ? loopDomain : `http://${loopDomain}`
      ).host.toLowerCase();
      if (parsed.host.toLowerCase() !== expectedHost) {
        return null;
      }
      return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "") || null;
    } catch {
      return null;
    }
  };
  const backToLoop = (token, redirectTo = null) => {
    const isTest = getState("testMode");
    setState("active", false);
    const params2 = getState("params");
    if (!params2 || Object.keys(params2).length === 0) {
      loopLogger.error("backToLoop called without valid params. Cannot redirect.");
      return;
    }
    const isEmbeddedPortal = getState("isEmbeddedPortal");
    const encodedToken = token ? encodeURIComponent(token) : null;
    const encodedRedirectTo = redirectTo ? encodeURIComponent(redirectTo) : null;
    const encodedReturnKey = params2.loop_return_key ? encodeURIComponent(params2.loop_return_key) : null;
    const trustedCartReturnUrl = resolveTrustedCartReturnUrl(
      params2.loop_cart_return_url,
      params2.loop_domain
    );
    let url = `http://${params2.loop_redirect_url}`;
    if (token && trustedCartReturnUrl) {
      const returnKeyPath = encodedReturnKey ? `/${encodedReturnKey}` : "";
      const redirectQuery = encodedRedirectTo ? `?to=${encodedRedirectTo}` : "";
      url = `${trustedCartReturnUrl}/${encodedToken}${returnKeyPath}${redirectQuery}`;
    } else if (token && encodedReturnKey) {
      url = `http://${params2.loop_domain}/#/cart/v2/${encodedToken}/${encodedReturnKey}`;
    } else if (token) {
      url = `http://${params2.loop_domain}/#/cart/v2/${encodedToken}${encodedRedirectTo ? "?to=" + encodedRedirectTo : ""}`;
    }
    if (isEmbeddedPortal) {
      const baseUrl = `${window.location.origin}/apps/${getAppProxyPath()}`;
      const page = getPageFromRedirectUrl(params2.loop_redirect_url);
      url = `${baseUrl}${page ? "?page=" + page : ""}`;
      if (token) {
        const queryParams = [`token=${encodedToken}`];
        if (encodedRedirectTo) {
          queryParams.push(`to=${encodedRedirectTo}`);
        }
        if (encodedReturnKey) {
          queryParams.push(`return_key=${encodedReturnKey}`);
        }
        if (trustedCartReturnUrl) {
          queryParams.push("portal_version=v2");
        }
        url = `${baseUrl}?${queryParams.join("&")}`;
      }
    }
    setState("params", null);
    loopLogger.info("Redirecting to:");
    loopLogger.info(url);
    document.dispatchEvent(new Event("Loop:Back To Loop"));
    if (isTest) {
      loopOnstoreOpenModal();
      setState("testMode", false);
      return;
    }
    if (getState("redirect")) {
      window.location.href = url;
    }
  };
  const info = () => {
    console.log("Using Embedded On-Store");
    console.log("API Key Last 4:", getState("key")?.slice(-4) ?? "No key set");
    console.log("Attached To:", getState("attach") ?? "No selector set");
    console.log("Portal Embedded:", getState("isEmbeddedPortal") ?? false);
  };
  const loopIsActive = () => getState("active");
  const LoopOnstore$1 = {
    init: loopInit,
    testMode: loopTestMode,
    testModeNewShopperFlow: loopTestModeNewShopperFlow,
    testModeOff: loopTestModeOff,
    submit: loopSubmit,
    attach: loopAttach,
    debug: loopDebug,
    setKey: loopSetKey,
    backToLoop,
    isActive: loopIsActive,
    info,
    inspect
  };
  const isInBuilder = !!Shopify?.designMode;
  const paramsInStorage = JSON.parse(
    localStorage.getItem("loop-onstore-data")
  )?.params;
  const inBuilderBarEnabled = isInBuilder && stringToBool(showOnstoreBar);
  const hasLoopParams = params.hasLoopData() || !!paramsInStorage;
  if (!window.LoopOnstore || window.LoopOnstore === "undefined") {
    window.LoopOnstore = LoopOnstore$1;
    if (isInBuilder && apikey !== "test-key") {
      checkOnstoreEligibility(apikey).then(({ enabled, error }) => {
        if (enabled && (inBuilderBarEnabled || hasLoopParams)) {
          LoopOnstore$1.init({
            key: apikey,
            attach: checkoutselector,
            cartdetails: stringToBool(cartdetails),
            preservecart: stringToBool(preservecart),
            isInBuilder,
            replacecheckoutbutton: stringToBool(replacecheckoutbutton),
            barOpts: { label, alignment, mobileLabel }
          });
        }
        if (!enabled && isInBuilder) {
          const modalHeader = "On-Store Feature Not Available";
          const modalBody = 'You may need to configure/add your API key or upgrade your plan to gain access to this feature. If you have already added your API key to the left, reach out to <a href = "mailto: support@loopreturns.com">support@loopreturns.com</a> to get help.';
          loopOnstoreOpenModal({ modalHeader, modalBody });
          return;
        }
        if (error) {
          console.error(
            "Something went wrong while enabling On-Store. Please try again later.",
            apikey,
            ...error
          );
        }
      });
    } else if (hasLoopParams) {
      LoopOnstore$1.init({
        key: apikey,
        attach: checkoutselector,
        cartdetails: stringToBool(cartdetails),
        preservecart: stringToBool(preservecart),
        isInBuilder,
        replacecheckoutbutton: stringToBool(replacecheckoutbutton),
        barOpts: { label, alignment, mobileLabel }
      });
    }
  } else if (isInBuilder) {
    const oldOnstoreRunningHeader = "Loop Manual On-Store is Already Running";
    const oldOnstoreRunningBody = 'Your store is currently running the old Loop <a href = "https://help.loopreturns.com/article/83-on-store-setup">Manual On-Store</a>. To migrate to the new <a href = "https://help.loopreturns.com/article/266-new-shop-now-on-store-setup">Embedded On-Store</a>, follow the migration instructions in the <a href = "https://help.loopreturns.com/article/247-shop-now-on-store-troubleshooting#Switching-to-embedded-Onstore-FEBaO">On-Store Troubleshooting article</a> or reach out to your Merchant Success Manager.';
    loopOnstoreOpenModal({
      modalHeader: oldOnstoreRunningHeader,
      modalBody: oldOnstoreRunningBody
    });
  }
})();
