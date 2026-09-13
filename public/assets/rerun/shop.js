// RE:RUN storefront behaviour: cart, checkout, account and forms.
// ponytail: localStorage store, no backend — swap the storage layer for an API when one exists.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const FREE_OVER = 99, STANDARD = 8, EXPRESS = 18, INTL = 25;
  const PROMOS = { RERUN10: 0.10, NEWRUNNER: 0.15, THUONGMAIDIENTU: 0.90, GIVEME10STARS: 0.90 }; // codes are matched case-insensitively
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const cart = {
    items: () => store.get('rr_cart', []),
    save(items) { store.set('rr_cart', items); badge(); },
    add(item) {
      const items = cart.items();
      const key = i => [i.id, i.color, i.size].join('|');
      const hit = items.find(i => key(i) === key(item));
      if (hit) hit.qty += item.qty; else items.push(item);
      cart.save(items);
    },
    count: () => cart.items().reduce((n, i) => n + i.qty, 0),
    subtotal: () => cart.items().reduce((n, i) => n + i.qty * i.price, 0),
  };
  const badge = () => $$('.cartCount').forEach(el => { el.textContent = cart.count(); });

  let toastEl;
  const toast = (msg, link) => {
    toastEl ||= Object.assign(document.body.appendChild(document.createElement('div')), { className: 'rr-toast' });
    toastEl.innerHTML = msg + (link ? ` <a href="${link[1]}">${link[0]}</a>` : '');
    toastEl.classList.add('is-on');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  };

  // Header: cart icon goes to the cart page instead of the cloned Shopify drawer.
  document.addEventListener('click', e => {
    const a = e.target.closest('a.cart-link, a[data-cart-toggle]');
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    location.href = '/cart.html';
  }, true);
  badge();

  // Homepage PDP: the cloned form posts to Shopify; capture it and add to the local cart.
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-rr-home-atc]');
    if (!btn) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const color = ($('#color-limited-selected')?.textContent.trim()) || ($('#color-core-selected')?.textContent.trim()) || 'Chalk';
    const size = $('#rr-home-size')?.value || '';
    if (!size) { toast('Please choose a size first.'); $('#rr-home-size')?.focus(); $('#rr-home-size')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const key = { Chalk: 'chalk', Hydro: 'hydro', Cosmic: 'cosmic', Burgundy: 'burgundy', 'Canyon Clay': 'clay', Calypso: 'calypso' }[color] || 'chalk';
    cart.add({ id: 'rerun-one', name: 'RE:RUN One — Complete Sneaker', price: 189, image: `/assets/rerun/v2/${key}-v2.webp`, color, size, qty: 1 });
    toast(`Added RE:RUN One · ${color} · ${size}`, ['View cart', '/cart.html']);
  }, true);
  const homeForm = $('#product-swatches');
  if (homeForm) homeForm.addEventListener('submit', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true);

  // Product page + quick add buttons.
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-rr-add]');
    if (!btn) return;
    e.preventDefault();
    const d = btn.dataset;
    const scope = btn.closest('[data-rr-product]') || document;
    const color = $('.rr-swatch.is-active', scope)?.dataset.value || '';
    const size = $('.rr-size.is-active', scope)?.dataset.value || '';
    if ($('.rr-sizes', scope) && !size) { toast('Please choose a size.'); $('.rr-sizes', scope).scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const qty = Math.max(1, parseInt($('.rr-qty input', scope)?.value || '1', 10));
    cart.add({ id: d.rrAdd, name: d.name, price: Number(d.price), image: d.image, color, size, qty });
    toast(`Added ${d.name}${color ? ' · ' + color : ''}${size ? ' · ' + size : ''}`, ['View cart', '/cart.html']);
  });
  function setProductGallery(scope, images) {
    const main = $('.rr-gallery__main img', scope);
    const thumbs = $('.rr-gallery__thumbs', scope);
    if (!main || !thumbs || !Array.isArray(images) || !images.length) return;
    const buttons = images.map((image, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.src = image.src;
      button.dataset.alt = image.alt;
      button.classList.toggle('is-active', index === 0);
      button.setAttribute('aria-label', `View ${image.alt}`);
      button.setAttribute('aria-pressed', String(index === 0));
      const img = document.createElement('img');
      img.src = image.src; img.alt = image.alt;
      button.append(img);
      return button;
    });
    thumbs.replaceChildren(...buttons);
    main.src = images[0].src; main.alt = images[0].alt;
  }
  document.addEventListener('click', e => {
    const sw = e.target.closest('.rr-swatch, .rr-size');
    if (sw) {
      const scope = sw.closest('[data-rr-product]') || document;
      const group = sw.parentElement;
      $$('.is-active', group).forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      sw.classList.add('is-active');
      sw.setAttribute('aria-pressed', 'true');
      const label = group.closest('.rr-opt')?.querySelector('label span');
      if (label) label.textContent = sw.dataset.value;
      const stockEl = $('[data-rr-stock]', scope);
      if (sw.classList.contains('rr-swatch') && stockEl) {
        const low = JSON.parse(stockEl.dataset.rrStock || '{}')[sw.dataset.key];
        stockEl.textContent = low ? `Only ${low} left in ${sw.dataset.value}` : 'In stock';
        stockEl.classList.toggle('is-low', !!low);
      }
      const main = $('.rr-gallery__main img', scope);
      if (sw.dataset.gallery) {
        setProductGallery(scope, JSON.parse(sw.dataset.gallery));
      } else if (sw.dataset.image && main) {
        main.src = sw.dataset.image; main.alt = sw.dataset.imageAlt || sw.dataset.value;
        $$('.rr-gallery__thumbs button', scope).forEach(button => {
          const selected = button.dataset.src === sw.dataset.image;
          button.classList.toggle('is-active', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
      }
      if (sw.dataset.image) {
        const add = $('[data-rr-add]', scope);
        if (add) add.dataset.image = sw.dataset.image;
      }
    }
    const thumb = e.target.closest('.rr-gallery__thumbs button');
    if (thumb) {
      const scope = thumb.closest('[data-rr-product]') || document;
      const colour = $$('.rr-swatch', scope).find(button => button.dataset.image === thumb.dataset.src);
      if (colour && !colour.classList.contains('is-active')) colour.click();
      $$('.rr-gallery__thumbs button', scope).forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      thumb.classList.add('is-active');
      thumb.setAttribute('aria-pressed', 'true');
      const main = $('.rr-gallery__main img', scope);
      main.src = thumb.dataset.src; main.alt = thumb.dataset.alt || '';
    }
    const q = e.target.closest('.rr-qty button');
    if (q) { const inp = $('input', q.parentElement); inp.value = Math.max(1, (+inp.value || 1) + (+q.dataset.step)); }
  });

  // The six colour cards lead to the matching product selection.
  const requestedColour = new URLSearchParams(location.search).get('colour');
  if (requestedColour) $$('.rr-swatch').find(button => button.dataset.key === requestedColour)?.click();

  // Cart page.
  const cartRoot = $('#rr-cart-root');
  if (cartRoot) {
    const render = () => {
      const items = cart.items();
      const promo = store.get('rr_promo', '');
      if (!items.length) {
        cartRoot.innerHTML = `<div class="rr-empty"><h2 class="rr-h2">Your cart is empty</h2><p class="rr-muted">Modules, sneakers and the care kit all ship within 1–2 business days.</p><a class="rr-btn" href="/shop.html">Shop RE:RUN</a></div>`;
        return;
      }
      const sub = cart.subtotal();
      const disc = PROMOS[promo] ? sub * PROMOS[promo] : 0;
      const ship = sub - disc >= FREE_OVER ? 0 : STANDARD;
      const total = sub - disc + ship;
      cartRoot.innerHTML = `
        <div class="rr-layout-2">
          <div>
            <table class="rr-cart-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody>
            ${items.map((i, n) => `<tr>
              <td><div class="rr-cart-item"><img src="${i.image}" alt=""><div><b>${i.name}</b><small>${[i.color, i.size].filter(Boolean).join(' · ') || 'One size'}</small></div></div></td>
              <td><div class="rr-qty"><button type="button" data-cart-step="-1" data-n="${n}">−</button><input value="${i.qty}" readonly aria-label="Quantity"><button type="button" data-cart-step="1" data-n="${n}">+</button></div></td>
              <td><b>${money(i.price * i.qty)}</b></td>
              <td><button type="button" class="rr-remove" data-remove="${n}">Remove</button></td>
            </tr>`).join('')}
            </tbody></table>
            <p class="rr-muted" style="margin-top:18px">${ship ? `Add ${money(FREE_OVER - (sub - disc))} more for free standard shipping.` : 'You qualify for free standard shipping.'}</p>
          </div>
          <aside class="rr-summary">
            <h3 class="rr-h3">Order summary</h3>
            <dl>
              <dt>Subtotal</dt><dd>${money(sub)}</dd>
              ${disc ? `<dt>Promo ${promo}</dt><dd>−${money(disc)}</dd>` : ''}
              <dt>Shipping (standard)</dt><dd>${ship ? money(ship) : 'Free'}</dd>
              <dt class="rr-total">Total</dt><dd class="rr-total">${money(total)}</dd>
            </dl>
            <form class="rr-form" id="rr-promo" style="margin-bottom:16px"><div class="rr-field"><label for="promo">Promo code</label><div style="display:flex;gap:8px"><input id="promo" placeholder="RERUN10" value="${promo}"><button class="rr-btn rr-btn--sm rr-btn--dark" type="submit">Apply</button></div><div class="rr-error">That code is not valid.</div></div></form>
            <a class="rr-btn" href="/checkout.html" style="width:100%">Checkout</a>
            <p class="rr-muted" style="font-size:13px;margin-top:12px">Taxes and duties calculated at checkout. 30-day free returns.</p>
          </aside>
        </div>`;
      $('#rr-promo').addEventListener('submit', e => {
        e.preventDefault();
        const code = $('#promo').value.trim().toUpperCase();
        if (!code) { store.set('rr_promo', ''); render(); return; }
        if (PROMOS[code]) { store.set('rr_promo', code); render(); toast(`Promo ${code} applied`); }
        else $('#promo').closest('.rr-field').classList.add('is-invalid');
      });
    };
    cartRoot.addEventListener('click', e => {
      const items = cart.items();
      const rm = e.target.closest('[data-remove]');
      if (rm) { items.splice(+rm.dataset.remove, 1); cart.save(items); render(); }
      const st = e.target.closest('[data-cart-step]');
      if (st) { const it = items[+st.dataset.n]; it.qty = Math.max(1, it.qty + (+st.dataset.cartStep)); cart.save(items); render(); }
    });
    render();
  }

  // Checkout page.
  // ---- Demo account with history, store credit and a passport (seeded on first sign-in).
  const DEMO = {
    email: 'kietchuyenlyhsgs@gmail.com', password: 'Kiet0302@', name: 'Kiet Tran', since: '2026-03-14T09:20:00.000Z',
    address: '88 Nguyen Hue Boulevard, District 1, Ho Chi Minh City 700000, Vietnam', size: 'US 9',
    credit: 1012.00,
    orders: [
      { id: 'RR-1A4F2C', date: '2026-03-14T09:20:00.000Z', items: [{ id: 'rerun-one', name: 'RE:RUN One — Complete Sneaker', price: 189, image: '/assets/rerun/v2/chalk-v2.webp', color: 'Chalk', size: 'US 9', qty: 1 }, { id: 'care-kit', name: 'Care Kit', price: 19, image: '/assets/rerun/repair.webp', color: '', size: '', qty: 1 }], sub: 208, disc: 0, ship: 0, tax: 16.64, total: 224.64, method: 'standard', promo: '', email: 'kietchuyenlyhsgs@gmail.com', name: 'Kiet Tran', address: '88 Nguyen Hue Boulevard, District 1, Ho Chi Minh City 700000, Vietnam', payment: 'card', card: '•••• 4242', creditUsed: 0, status: 'Delivered 19 Mar 2026' },
      { id: 'RR-3B9E71', date: '2026-06-02T14:05:00.000Z', items: [{ id: 'insole-module', name: 'Insole Module', price: 29, image: '/assets/rerun/insole.webp', color: '', size: 'US 9', qty: 2 }], sub: 58, disc: 0, ship: 8, tax: 4.64, total: 70.64, method: 'standard', promo: '', email: 'kietchuyenlyhsgs@gmail.com', name: 'Kiet Tran', address: '88 Nguyen Hue Boulevard, District 1, Ho Chi Minh City 700000, Vietnam', payment: 'momo', card: '', creditUsed: 0, status: 'Delivered 8 Jun 2026' },
      { id: 'RR-7C2D58', date: '2026-08-28T08:41:00.000Z', items: [{ id: 'outsole-module', name: 'Outsole Module', price: 59, image: '/assets/rerun/v3/outsole-hydro.webp', color: 'Hydro', size: 'US 9', qty: 1 }, { id: 'upper-module', name: 'Upper Module', price: 79, image: '/assets/rerun/v3/upper-hydro.webp', color: 'Hydro', size: 'US 9', qty: 1 }], sub: 138, disc: 0, ship: 0, tax: 11.04, total: 149.04, method: 'express', promo: '', email: 'kietchuyenlyhsgs@gmail.com', name: 'Kiet Tran', address: '88 Nguyen Hue Boulevard, District 1, Ho Chi Minh City 700000, Vietnam', payment: 'card', card: '•••• 4242', creditUsed: 30, due: 119.04, status: 'Delivered 31 Aug 2026' },
    ],
    ledger: [
      { date: '2026-04-02', note: 'Welcome credit — running club pilot', amount: 50 },
      { date: '2026-06-11', note: 'Returned worn insoles ×2', amount: 12 },
      { date: '2026-07-20', note: 'Repair Lab referral bonus (3 friends)', amount: 900 },
      { date: '2026-08-28', note: 'Applied to order RR-7C2D58', amount: -30 },
      { date: '2026-09-04', note: 'Returned worn outsole + upper', amount: 30 },
      { date: '2026-09-10', note: 'Passport milestone — 500 km logged', amount: 50 },
    ],
    passports: [
      { code: 'RR1-7K4M-Q2X', model: 'RE:RUN One · Chalk · US 9', since: '14 Mar 2026', modules: [['Chassis', '14 Mar 2026', '612 km', 'to Mar 2031'], ['Outsole #2 (Hydro)', '31 Aug 2026', '84 km', 'to Aug 2027'], ['Upper #2 (Hydro)', '31 Aug 2026', '84 km', 'to Aug 2027'], ['Insole #2', '08 Jun 2026', '240 km', 'to Jun 2027']], note: 'Repair Lab visits: 1 (Jun 2026, deep clean).' },
    ],
  };
  const credit = { get: () => Number(store.get('rr_credit', 0)), set: v => store.set('rr_credit', Math.round(v * 100) / 100) };
  const seedDemo = () => {
    if (store.get('rr_demo_seeded', false)) return;
    const orders = store.get('rr_orders', []);
    DEMO.orders.forEach(o => { if (!orders.some(x => x.id === o.id)) orders.push(o); });
    orders.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    store.set('rr_orders', orders);
    store.set('rr_ledger', DEMO.ledger);
    store.set('rr_passports', DEMO.passports);
    credit.set(DEMO.credit);
    store.set('rr_demo_seeded', true);
  };

  // Checkout page.
  const checkout = $('#rr-checkout');
  if (checkout) {
    const items = cart.items();
    if (!items.length) { location.replace('/cart.html'); return; }
    const promo = store.get('rr_promo', '');
    const rates = { standard: STANDARD, express: EXPRESS, international: INTL };
    const user = store.get('rr_user', null);
    const balance = user ? credit.get() : 0;
    const creditOpt = $('#rr-credit-option');
    if (creditOpt && user && balance > 0) { creditOpt.hidden = false; $('b', creditOpt).textContent = `Balance ${money(balance)}`; $('input', creditOpt).checked = true; }
    if (user) {
      const fill = (id, v) => { const el = $('#' + id, checkout); if (el && !el.value) el.value = v; };
      fill('email', user.email); if (user.name) { const [f, ...l] = user.name.split(' '); fill('first', f); fill('last', l.join(' ')); }
      if (user.address) { fill('address', '88 Nguyen Hue Boulevard, District 1'); fill('city', 'Ho Chi Minh City'); fill('zip', '700000'); const c = $('#country', checkout); if (c) c.value = 'Vietnam'; }
      fill('phone', '+84 901 234 567');
    }
    const summary = () => {
      const sub = cart.subtotal();
      const disc = PROMOS[promo] ? sub * PROMOS[promo] : 0;
      const method = $('input[name=shipping]:checked', checkout).value;
      const ship = method === 'standard' && sub - disc >= FREE_OVER ? 0 : rates[method];
      const tax = Math.round((sub - disc) * 0.08 * 100) / 100;
      const total = Math.round((sub - disc + ship + tax) * 100) / 100;
      const payment = $('input[name=payment]:checked', checkout)?.value;
      const creditUsed = payment === 'credit' ? Math.min(balance, total) : 0;
      const due = Math.round((total - creditUsed) * 100) / 100;
      $('#rr-sum').innerHTML = `
        ${items.map(i => `<dt>${i.name} × ${i.qty}<br><small class="rr-muted">${[i.color, i.size].filter(Boolean).join(' · ')}</small></dt><dd>${money(i.price * i.qty)}</dd>`).join('')}
        <dt>Subtotal</dt><dd>${money(sub)}</dd>
        ${disc ? `<dt>Promo ${promo}</dt><dd>−${money(disc)}</dd>` : ''}
        <dt>Shipping</dt><dd>${ship ? money(ship) : 'Free'}</dd>
        <dt>Estimated tax (8%)</dt><dd>${money(tax)}</dd>
        <dt class="rr-total">Total</dt><dd class="rr-total">${money(total)}</dd>
        ${creditUsed ? `<dt style="color:#1b7a3d">Store credit applied</dt><dd style="color:#1b7a3d">−${money(creditUsed)}</dd><dt class="rr-total">Due now</dt><dd class="rr-total">${money(due)}</dd>` : ''}`;
      const note = $('#rr-credit-note');
      if (note) { note.hidden = payment !== 'credit'; note.innerHTML = due > 0 ? `Your credit covers ${money(creditUsed)}. The remaining <b>${money(due)}</b> is charged to your card below.` : `Your credit covers the whole order. Nothing to pay today — balance after this order: <b>${money(balance - creditUsed)}</b>.`; }
      const card = $('#rr-card-fields');
      const needCard = payment === 'card' || (payment === 'credit' && due > 0);
      card.hidden = !needCard; $$('input', card).forEach(i => { i.required = needCard; });
      return { sub, disc, ship, tax, total, method, creditUsed, due };
    };
    checkout.addEventListener('change', summary);
    summary();
    checkout.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', checkout).forEach(f => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) || (f.dataset.pattern && !new RegExp(f.dataset.pattern).test(f.value.replace(/\s/g, '')));
        f.closest('.rr-field').classList.toggle('is-invalid', bad);
        ok = ok && !bad;
      });
      if (!ok) { $('.rr-field.is-invalid input, .rr-field.is-invalid select', checkout)?.focus(); return; }
      const t = summary();
      const fd = Object.fromEntries(new FormData(checkout).entries());
      const order = {
        id: 'RR-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        date: new Date().toISOString(),
        items, ...t, promo,
        email: fd.email, name: `${fd.first} ${fd.last}`, address: `${fd.address}, ${fd.city} ${fd.zip}, ${fd.country}`,
        payment: fd.payment, card: fd.card ? '•••• ' + fd.card.replace(/\s/g, '').slice(-4) : '', status: 'Processing',
      };
      const orders = store.get('rr_orders', []); orders.unshift(order); store.set('rr_orders', orders);
      if (t.creditUsed) {
        credit.set(balance - t.creditUsed);
        const ledger = store.get('rr_ledger', []); ledger.push({ date: order.date.slice(0, 10), note: `Applied to order ${order.id}`, amount: -t.creditUsed }); store.set('rr_ledger', ledger);
      }
      // A complete sneaker gets its own passport the moment it is ordered.
      const pairs = items.filter(i => i.id === 'rerun-one');
      if (pairs.length && user) {
        const passports = store.get('rr_passports', []);
        pairs.forEach(i => { for (let n = 0; n < i.qty; n++) passports.push({ code: 'RR1-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(), model: `RE:RUN One · ${i.color} · ${i.size}`, since: new Date().toDateString().slice(4), modules: [['Chassis', 'on delivery', '0 km', '5 years'], [`Outsole #1 (${i.color})`, 'on delivery', '0 km', '12 months'], [`Upper #1 (${i.color})`, 'on delivery', '0 km', '12 months'], ['Insole #1', 'on delivery', '0 km', '12 months']], note: `Activates when order ${order.id} is delivered.`, fresh: true }); });
        store.set('rr_passports', passports);
      }
      cart.save([]); store.set('rr_promo', ''); store.set('rr_fresh_order', order.id);
      location.href = '/order-confirmed.html?order=' + order.id;
    });
  }

  // Order confirmation: confetti, animated check, receipt.
  const conf = $('#rr-order');
  if (conf) {
    const id = new URLSearchParams(location.search).get('order');
    const order = store.get('rr_orders', []).find(o => o.id === id) || store.get('rr_orders', [])[0];
    if (!order) conf.innerHTML = `<div class="rr-empty"><h2 class="rr-h2">No order found</h2><a class="rr-btn" href="/shop.html">Back to shop</a></div>`;
    else {
      const eta = new Date(Date.parse(order.date) + ({ standard: 7, express: 3, international: 14 }[order.method] || 7) * 864e5);
      const paid = order.creditUsed
        ? `${money(order.creditUsed)} store credit${order.due > 0 ? ' + ' + money(order.due) + ' on card ' + order.card : ''} · credit balance now ${money(credit.get())}`
        : order.payment === 'card' ? 'Card ' + order.card : (order.payment || 'card')[0].toUpperCase() + (order.payment || 'card').slice(1);
      const newPassports = store.get('rr_passports', []).filter(p => p.fresh);
      const isFresh = store.get('rr_fresh_order', '') === order.id;
      conf.innerHTML = `
        <div class="rr-celebrate"><div class="rr-check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-16"/></svg></div>
          <div><h2 class="rr-h2" style="margin:0 0 6px">${isFresh ? `Thanks, ${order.name.split(' ')[0]}. It is yours.` : 'Order ' + order.id}</h2><p style="margin:0">Order <b>${order.id}</b> is confirmed. A receipt is on its way to ${order.email}; tracking follows as soon as the parcel leaves the hub.</p></div></div>
        ${newPassports.length ? `<div class="rr-notice" style="margin-top:18px"><b>New digital passport${newPassports.length > 1 ? 's' : ''} created:</b> ${newPassports.map(p => `<code>${p.code}</code> (${p.model})`).join(', ')}. It activates on delivery — <a href="/account.html#passport">see it in your account</a>.</div>` : ''}
        <div class="rr-layout-2" style="margin-top:28px">
          <div>
            <h3 class="rr-h3">Items</h3>
            <table class="rr-cart-table"><tbody>${order.items.map(i => `<tr><td><div class="rr-cart-item"><img src="${i.image}" alt=""><div><b>${i.name}</b><small>${[i.color, i.size].filter(Boolean).join(' · ') || 'One size'} · Qty ${i.qty}</small></div></div></td><td><b>${money(i.price * i.qty)}</b></td></tr>`).join('')}</tbody></table>
            <h3 class="rr-h3" style="margin-top:28px">Delivery</h3>
            <p>${order.name}<br>${order.address}<br><span class="rr-muted">${order.method[0].toUpperCase() + order.method.slice(1)} shipping · estimated delivery ${eta.toDateString()}</span></p>
            <h3 class="rr-h3">Payment</h3>
            <p>${paid}</p>
          </div>
          <aside class="rr-summary"><h3 class="rr-h3">Summary</h3><dl>
            <dt>Subtotal</dt><dd>${money(order.sub)}</dd>${order.disc ? `<dt>Promo ${order.promo}</dt><dd>−${money(order.disc)}</dd>` : ''}
            <dt>Shipping</dt><dd>${order.ship ? money(order.ship) : 'Free'}</dd><dt>Tax</dt><dd>${money(order.tax)}</dd>
            <dt class="rr-total">Total</dt><dd class="rr-total">${money(order.total)}</dd>
            ${order.creditUsed ? `<dt style="color:#1b7a3d">Store credit</dt><dd style="color:#1b7a3d">−${money(order.creditUsed)}</dd><dt class="rr-total">Paid today</dt><dd class="rr-total">${money(order.due)}</dd>` : ''}</dl>
            <a class="rr-btn rr-btn--dark" href="/account.html" style="width:100%">Track in my account</a></aside>
        </div>`;
      store.set('rr_passports', store.get('rr_passports', []).map(p => { delete p.fresh; return p; }));
      if (isFresh) { store.set('rr_fresh_order', ''); confetti(); setTimeout(() => $('.rr-celebrate')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300); }
    }
  }
  function confetti() {
    const c = document.body.appendChild(document.createElement('canvas'));
    c.className = 'rr-confetti'; c.width = innerWidth; c.height = innerHeight;
    const ctx = c.getContext('2d'); const colors = ['#d00b2b', '#68101c', '#ece6db', '#bedde9', '#805bb0', '#279c9b', '#a6d86a', '#d0b79a'];
    const bits = Array.from({ length: 260 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2, vy: 2 + Math.random() * 3, vx: (Math.random() - 0.5) * 1.5, col: colors[Math.floor(Math.random() * colors.length)] }));
    const t0 = performance.now();
    const frame = t => {
      ctx.clearRect(0, 0, c.width, c.height);
      bits.forEach(b => { b.y += b.vy; b.x += b.vx + Math.sin(t / 300 + b.r) * 0.6; b.r += b.vr; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.col; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore(); });
      if (t - t0 < 7000) requestAnimationFrame(frame); else c.remove();
    };
    requestAnimationFrame(frame);
  }

  // Account page: login / register / orders / passport / credit.
  const acct = $('#rr-account');
  if (acct) {
    let user = store.get('rr_user', null);
    const show = tab => { $$('.rr-tabs button', acct).forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab)); $$('[data-panel]', acct).forEach(p => { p.hidden = p.dataset.panel !== tab; }); };
    acct.addEventListener('click', e => { const b = e.target.closest('.rr-tabs button'); if (b) show(b.dataset.tab); });
    const renderOrders = () => {
      const orders = store.get('rr_orders', []);
      $('#rr-orders').innerHTML = orders.length
        ? orders.map(o => `<div class="rr-order"><div><b>${o.id}</b> · ${new Date(o.date).toDateString()}<br><small class="rr-muted">${o.items.map(i => i.name + (i.color ? ' (' + i.color + ')' : '') + ' × ' + i.qty).join(', ')}</small></div><div style="text-align:right"><b>${money(o.total)}</b>${o.creditUsed ? `<br><small style="color:#1b7a3d">${money(o.creditUsed)} paid with credit</small>` : ''}<br><small class="rr-muted">${o.status || (Date.now() - Date.parse(o.date) > 2 * 864e5 ? 'Shipped' : 'Processing')}</small> · <a href="/order-confirmed.html?order=${o.id}">Receipt</a></div></div>`).join('')
        : '<p class="rr-muted">No orders yet. Your first order will show up here with live tracking.</p>';
    };
    const renderCredit = () => {
      const bal = credit.get(); const ledger = store.get('rr_ledger', []).slice().reverse();
      const el = $('#rr-credit'); if (!el) return;
      el.innerHTML = `<div class="rr-credit-balance"><span class="rr-eyebrow">Return credit balance</span><strong>${money(bal)}</strong><p class="rr-muted" style="margin:6px 0 0">Choose <b>Store credit</b> at checkout to pay with it. Credit never expires.</p>${bal > 0 ? '<a class="rr-btn rr-btn--sm" href="/shop.html" style="margin-top:14px">Spend it on a new pair</a>' : ''}</div>
        <h3 class="rr-h3" style="margin-top:24px">History</h3>${ledger.length ? `<table class="rr-ledger">${ledger.map(l => `<tr><td>${l.date}</td><td>${l.note}</td><td class="${l.amount < 0 ? 'is-neg' : 'is-pos'}">${l.amount < 0 ? '−' : '+'}${money(Math.abs(l.amount))}</td></tr>`).join('')}</table>` : '<p class="rr-muted">Send a worn module back in its prepaid mailer and the credit appears here within 5 business days: outsole $12, upper $18, insole $6.</p>'}`;
    };
    const renderPassports = () => {
      const list = $('#rr-passports'); if (!list) return;
      const passports = store.get('rr_passports', []);
      list.innerHTML = passports.length ? passports.map(p => `<div class="rr-passport"><span class="rr-eyebrow">${p.model} · since ${p.since}</span><code>${p.code}</code>
        <table><tr><th>Module</th><th>Installed</th><th>Distance</th><th>Warranty</th></tr>${p.modules.map(m => `<tr>${m.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table><small style="opacity:.7">${p.note || ''} Passport transfers with the pair on resale.</small></div>`).join('')
        : '<p class="rr-muted">No pairs linked yet. Buy a RE:RUN One or enter the code under your tongue.</p>';
    };
    const signedIn = u => { $('#rr-greeting').textContent = `Hi ${u.name.split(' ')[0]} — ${u.email}`; $('#rr-auth').hidden = true; $('#rr-dash').hidden = false; const d = $('#d-addr'); if (d && u.address) d.value = u.address; const sz = $('#d-size'); if (sz && u.size) sz.value = u.size; renderOrders(); renderCredit(); renderPassports(); show(location.hash === '#passport' ? 'passport' : location.hash === '#credit' ? 'credit' : 'orders'); };
    if (user) signedIn(user); else { $('#rr-auth').hidden = false; $('#rr-dash').hidden = true; }
    $$('form[data-auth]', acct).forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f).entries());
      let ok = true;
      $$('[required]', f).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)); i.closest('.rr-field').classList.toggle('is-invalid', bad); ok = ok && !bad; });
      if (!ok) return;
      const email = fd.email.trim().toLowerCase();
      const isLogin = !('name' in fd);
      const fail = msg => { const pf = $('input[name=password]', f).closest('.rr-field'); pf.classList.add('is-invalid'); $('.rr-error', pf).textContent = msg; };
      if (email === DEMO.email) {
        if (fd.password !== DEMO.password) return fail('Wrong password for this account.');
        seedDemo();
        user = { name: DEMO.name, email: DEMO.email, since: DEMO.since, address: DEMO.address, size: DEMO.size };
      } else if (isLogin) {
        const known = store.get('rr_accounts', {})[email];
        if (!known || known.password !== fd.password) return fail(known ? 'Wrong password.' : 'No account with that email — create one on the right.');
        user = { name: known.name, email, since: known.since };
      } else {
        const accounts = store.get('rr_accounts', {}); accounts[email] = { name: fd.name, password: fd.password, since: new Date().toISOString() }; store.set('rr_accounts', accounts);
        user = { name: fd.name, email, since: accounts[email].since };
      }
      store.set('rr_user', user); signedIn(user); toast(`Welcome back, ${user.name.split(' ')[0]}`);
    }));
    $('#rr-signout')?.addEventListener('click', () => { localStorage.removeItem('rr_user'); location.reload(); });
  }

  // Generic forms (contact, notify, repair booking): validate, then show the success state.
  $$('form[data-rr-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', f).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)); i.closest('.rr-field')?.classList.toggle('is-invalid', bad); ok = ok && !bad; });
    if (!ok) return;
    const done = $('[data-rr-success]', f);
    if (done) done.hidden = false;
    f.reset();
    toast(f.dataset.rrToast || 'Thanks — we have received your message.');
  }));
  // Cloned "notify me" modal posts to the old store; confirm locally instead.
  const notify = $('#notify-me-form');
  if (notify) notify.addEventListener('submit', e => {
    e.preventDefault(); e.stopImmediatePropagation();
    const email = $('input[name=email]', notify);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) { email.focus(); toast('Please enter a valid email.'); return; }
    notify.hidden = true; const ty = $('#thank-you-msg'); if (ty) ty.style.display = 'block';
    toast('Noted — we will email you when it is back.');
  }, true);
  const news = $('form.newsletter');
  if (news) news.addEventListener('submit', e => {
    e.preventDefault(); e.stopImmediatePropagation();
    const input = $('#footer-subscribe');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) { input.focus(); toast('Please enter a valid email.'); return; }
    input.value = ''; $('.newsletter-success-text')?.classList.add('active'); toast('Subscribed — your 10% code is on its way.');
  }, true);

  // Shop page search (?q=) filters the product grid client-side.
  const grid = $('[data-rr-grid]');
  const q = new URLSearchParams(location.search).get('q');
  if (grid && q) {
    const term = q.toLowerCase();
    let n = 0;
    $$('[data-rr-search]', grid).forEach(c => { const hit = c.dataset.rrSearch.toLowerCase().includes(term); c.hidden = !hit; n += hit; });
    const note = $('.rr-search-note');
    if (note) note.innerHTML = n ? `<b>${n}</b> result${n > 1 ? 's' : ''} for “${q}”. <a href="/shop.html">Clear</a>` : `No results for “${q}”. Showing everything instead. <a href="/shop.html">Clear</a>`;
    if (!n) $$('[data-rr-search]', grid).forEach(c => { c.hidden = false; });
  }
  $$('form.search-bar').forEach(f => { f.action = '/shop.html'; $('input[name=type]', f)?.remove(); });

  // Links the cloned scripts inject at runtime still point at the old store; re-point them.
  const DEAD = [[/loopreturns/, '/shipping-returns.html#returns'], [/^\/pages\/warranty/, '/policies.html#warranty'], [/^\/pages\/contact/, '/contact.html'],
    [/^\/pages\/|selkirk\.com/, '/'], [/^\/account/, '/account.html'], [/^\/cart$/, '/cart.html'], [/^\/collections/, '/shop.html'], [/^\/products\/(?!.*\.html)/, '/shop.html']];
  const fixLinks = () => $$('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    for (const [re, to] of DEAD) if (re.test(h)) { a.setAttribute('href', to); break; }
  });
  // The cloned chat widget writes its own paddle-store labels after load; rewrite them.
  const CHAT_TEXT = [[/Help Selecting a Paddle/g, 'Help finding my size'], [/Let's Find Your Paddle!/g, "Let's find your fit!"], [/\bpaddles?\b/gi, 'sneaker'], [/\bpickleball\b/gi, 'running']];
  const fixChatText = () => $$('.chat-card, .popup-chat, .popup-chat-view, #popup-links-view').forEach(root => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { let v = n.nodeValue; for (const [re, to] of CHAT_TEXT) v = v.replace(re, to); if (v !== n.nodeValue) n.nodeValue = v; }
  });
  fixLinks(); fixChatText();
  new MutationObserver(() => { fixLinks(); fixChatText(); }).observe(document.body, { childList: true, subtree: true });

  // On-page assistant: answers from faq.json. The cloned widget talked to the old store's chat
  // backend, so its chips, input and floating button are captured here before it sees them.
  const embed = $('.selkirk-chat-embed');
  if (embed) {
    let faq = null, panel = null;
    const loadFaq = () => faq || fetch('/assets/rerun/faq.json').then(r => r.json()).then(d => (faq = d)).catch(() => (faq = []));
    const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'you', 'your', 'are', 'can', 'how', 'what', 'does', 'with', 'this', 'that'].includes(w));
    const answer = q => {
      const exact = faq.find(f => f.q.toLowerCase() === q.toLowerCase());
      if (exact) return exact;
      const words = norm(q);
      let best = null, score = 0;
      const stem = w => w.replace(/(ing|ies|es|s|ed)$/, '').slice(0, 5);
      faq.forEach(f => { const bag = new Set(norm(f.q + ' ' + f.a).map(stem)); const n = words.map(stem).filter(w => bag.has(w)).length + (norm(f.q).map(stem).filter(w => words.map(stem).includes(w)).length); if (n > score) { score = n; best = f; } });
      return score >= 2 ? best : null;
    };
    const show = async q => {
      await loadFaq();
      panel ||= embed.appendChild(Object.assign(document.createElement('div'), { className: 'rr-assistant' }));
      const hit = answer(q);
      panel.innerHTML = `<p class="rr-assistant__q">${q.replace(/</g, '&lt;')}</p><p class="rr-assistant__a">${hit ? hit.a : 'I could not find that in our FAQ. Email <a href="mailto:support@rerun.run">support@rerun.run</a> — Thao replies within one business day — or browse the <a href="/faq.html">full FAQ</a>.'}</p>${hit ? '<p class="rr-assistant__more"><a href="/faq.html">More answers in the FAQ</a> · <a href="/contact.html">Contact us</a></p>' : ''}`;
      panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    const input = $('.chat-embed-input', embed);
    document.addEventListener('click', e => {
      const chip = e.target.closest('.chat-embed-chip');
      const send = e.target.closest('.chat-embed-send');
      const fab = e.target.closest('.chat-fab');
      if (chip) { e.preventDefault(); e.stopImmediatePropagation(); show(chip.dataset.question || chip.textContent.trim()); }
      else if (send) { e.preventDefault(); e.stopImmediatePropagation(); if (input?.value.trim()) { show(input.value.trim()); input.value = ''; } else input?.focus(); }
      else if (fab) { e.preventDefault(); e.stopImmediatePropagation(); embed.scrollIntoView({ block: 'center', behavior: 'smooth' }); input?.focus(); toast('Ask a question — answers come straight from our FAQ.'); }
    }, true);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (input.value.trim()) { show(input.value.trim()); input.value = ''; } } }, true);
  }
})();
