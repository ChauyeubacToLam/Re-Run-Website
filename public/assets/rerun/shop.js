// RE:RUN storefront behaviour: cart, checkout, account and forms.
// ponytail: localStorage store, no backend — swap the storage layer for an API when one exists.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '$' + Number(n).toFixed(2);
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
  document.addEventListener('click', e => {
    const sw = e.target.closest('.rr-swatch, .rr-size');
    if (sw) {
      const group = sw.parentElement;
      $$('.is-active', group).forEach(x => x.classList.remove('is-active'));
      sw.classList.add('is-active');
      const label = group.closest('.rr-opt')?.querySelector('label span');
      if (label) label.textContent = sw.dataset.value;
      const stockEl = $('[data-rr-stock]');
      if (sw.classList.contains('rr-swatch') && stockEl) {
        const low = JSON.parse(stockEl.dataset.rrStock || '{}')[sw.dataset.key];
        stockEl.textContent = low ? `Only ${low} left in ${sw.dataset.value}` : 'In stock';
        stockEl.classList.toggle('is-low', !!low);
      }
      const main = $('.rr-gallery__main img');
      if (sw.dataset.image && main) main.src = sw.dataset.image;
    }
    const thumb = e.target.closest('.rr-gallery__thumbs button');
    if (thumb) {
      $$('.rr-gallery__thumbs button').forEach(b => b.classList.remove('is-active'));
      thumb.classList.add('is-active');
      const main = $('.rr-gallery__main img');
      main.src = thumb.dataset.src; main.alt = thumb.dataset.alt || '';
    }
    const q = e.target.closest('.rr-qty button');
    if (q) { const inp = $('input', q.parentElement); inp.value = Math.max(1, (+inp.value || 1) + (+q.dataset.step)); }
  });

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
  const checkout = $('#rr-checkout');
  if (checkout) {
    const items = cart.items();
    if (!items.length) { location.replace('/cart.html'); return; }
    const promo = store.get('rr_promo', '');
    const rates = { standard: STANDARD, express: EXPRESS, international: INTL };
    const summary = () => {
      const sub = cart.subtotal();
      const disc = PROMOS[promo] ? sub * PROMOS[promo] : 0;
      const method = $('input[name=shipping]:checked', checkout).value;
      const ship = method === 'standard' && sub - disc >= FREE_OVER ? 0 : rates[method];
      const tax = Math.round((sub - disc) * 0.08 * 100) / 100;
      const total = sub - disc + ship + tax;
      $('#rr-sum').innerHTML = `
        ${items.map(i => `<dt>${i.name} × ${i.qty}<br><small class="rr-muted">${[i.color, i.size].filter(Boolean).join(' · ')}</small></dt><dd>${money(i.price * i.qty)}</dd>`).join('')}
        <dt>Subtotal</dt><dd>${money(sub)}</dd>
        ${disc ? `<dt>Promo ${promo}</dt><dd>−${money(disc)}</dd>` : ''}
        <dt>Shipping</dt><dd>${ship ? money(ship) : 'Free'}</dd>
        <dt>Estimated tax (8%)</dt><dd>${money(tax)}</dd>
        <dt class="rr-total">Total</dt><dd class="rr-total">${money(total)}</dd>`;
      return { sub, disc, ship, tax, total, method };
    };
    checkout.addEventListener('change', summary);
    summary();
    $$('input[name=payment]', checkout).forEach(r => r.addEventListener('change', () => {
      const card = $('#rr-card-fields'); card.hidden = r.value !== 'card' || !r.checked;
      $$('input', card).forEach(i => { i.required = !card.hidden; });
    }));
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
        payment: fd.payment, card: fd.card ? '•••• ' + fd.card.replace(/\s/g, '').slice(-4) : '',
      };
      const orders = store.get('rr_orders', []); orders.unshift(order); store.set('rr_orders', orders);
      cart.save([]); store.set('rr_promo', '');
      location.href = '/order-confirmed.html?order=' + order.id;
    });
  }

  // Order confirmation.
  const conf = $('#rr-order');
  if (conf) {
    const id = new URLSearchParams(location.search).get('order');
    const order = store.get('rr_orders', []).find(o => o.id === id) || store.get('rr_orders', [])[0];
    if (!order) conf.innerHTML = `<div class="rr-empty"><h2 class="rr-h2">No order found</h2><a class="rr-btn" href="/shop.html">Back to shop</a></div>`;
    else {
      const eta = new Date(Date.parse(order.date) + ({ standard: 7, express: 3, international: 14 }[order.method] || 7) * 864e5);
      conf.innerHTML = `
        <div class="rr-notice rr-success"><b>Order ${order.id} confirmed.</b> A receipt has been sent to ${order.email}. Tracking follows as soon as the parcel leaves the hub.</div>
        <div class="rr-layout-2" style="margin-top:28px">
          <div>
            <h3 class="rr-h3">Items</h3>
            <table class="rr-cart-table"><tbody>${order.items.map(i => `<tr><td><div class="rr-cart-item"><img src="${i.image}" alt=""><div><b>${i.name}</b><small>${[i.color, i.size].filter(Boolean).join(' · ') || 'One size'} · Qty ${i.qty}</small></div></div></td><td><b>${money(i.price * i.qty)}</b></td></tr>`).join('')}</tbody></table>
            <h3 class="rr-h3" style="margin-top:28px">Delivery</h3>
            <p>${order.name}<br>${order.address}<br><span class="rr-muted">${order.method[0].toUpperCase() + order.method.slice(1)} shipping · estimated delivery ${eta.toDateString()}</span></p>
            <h3 class="rr-h3">Payment</h3>
            <p>${order.payment === 'card' ? 'Card ' + order.card : order.payment[0].toUpperCase() + order.payment.slice(1)}</p>
          </div>
          <aside class="rr-summary"><h3 class="rr-h3">Summary</h3><dl>
            <dt>Subtotal</dt><dd>${money(order.sub)}</dd>${order.disc ? `<dt>Promo ${order.promo}</dt><dd>−${money(order.disc)}</dd>` : ''}
            <dt>Shipping</dt><dd>${order.ship ? money(order.ship) : 'Free'}</dd><dt>Tax</dt><dd>${money(order.tax)}</dd>
            <dt class="rr-total">Total</dt><dd class="rr-total">${money(order.total)}</dd></dl>
            <a class="rr-btn rr-btn--dark" href="/account.html" style="width:100%">Track in my account</a></aside>
        </div>`;
    }
  }

  // Account page: login / register / orders / passport.
  const acct = $('#rr-account');
  if (acct) {
    const user = store.get('rr_user', null);
    const orders = store.get('rr_orders', []);
    const show = tab => { $$('.rr-tabs button', acct).forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab)); $$('[data-panel]', acct).forEach(p => { p.hidden = p.dataset.panel !== tab; }); };
    acct.addEventListener('click', e => { const b = e.target.closest('.rr-tabs button'); if (b) show(b.dataset.tab); });
    const renderOrders = () => {
      $('#rr-orders').innerHTML = orders.length
        ? orders.map(o => `<div class="rr-order"><div><b>${o.id}</b> · ${new Date(o.date).toDateString()}<br><small class="rr-muted">${o.items.map(i => i.name + ' × ' + i.qty).join(', ')}</small></div><div><b>${money(o.total)}</b><br><small class="rr-muted">${Date.now() - Date.parse(o.date) > 2 * 864e5 ? 'Shipped' : 'Processing'}</small></div></div>`).join('')
        : '<p class="rr-muted">No orders yet. Your first order will show up here with live tracking.</p>';
    };
    const signedIn = u => { $('#rr-greeting').textContent = `Hi ${u.name.split(' ')[0]} — ${u.email}`; $('#rr-auth').hidden = true; $('#rr-dash').hidden = false; show('orders'); renderOrders(); };
    if (user) signedIn(user); else { $('#rr-auth').hidden = false; $('#rr-dash').hidden = true; }
    $$('form[data-auth]', acct).forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f).entries());
      let ok = true;
      $$('[required]', f).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)); i.closest('.rr-field').classList.toggle('is-invalid', bad); ok = ok && !bad; });
      if (!ok) return;
      const u = { name: fd.name || fd.email.split('@')[0], email: fd.email, since: user?.since || new Date().toISOString() };
      store.set('rr_user', u); signedIn(u); toast(`Welcome, ${u.name.split(' ')[0]}`);
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
})();
