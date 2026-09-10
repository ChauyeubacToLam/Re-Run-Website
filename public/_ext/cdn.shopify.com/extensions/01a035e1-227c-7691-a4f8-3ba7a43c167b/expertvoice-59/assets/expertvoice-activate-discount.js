// Check for evReferral query param
let evReferralQuerys = window.location.search;
if (window.location.search.startsWith('?')) {
  evReferralQuerys = evReferralQuerys.substring(1, evReferralQuerys.length);
}

const evQueryParams = {};
evReferralQuerys.split('&').forEach(param => {
  const [key, value] = param.split('=');
  return (evQueryParams[key] = value);
});

function evIsValidT(t) {
  if (!t || !/^\d{12}$/.test(t)) return false;
  const y = 2000 + parseInt(t.slice(0, 2), 10);
  const m = parseInt(t.slice(2, 4), 10) - 1;
  const d = parseInt(t.slice(4, 6), 10);
  const h = parseInt(t.slice(6, 8), 10);
  const min = parseInt(t.slice(8, 10), 10);
  const s = parseInt(t.slice(10, 12), 10);

  // Create a UTC timestamp for the given values as if they are in America/Denver
  const denverTZOffset = new Date()
    .toLocaleString('en-US', { timeZone: 'America/Denver', timeZoneName: 'short' })
    .includes('MDT')
    ? -6
    : -7;
  const denverUTCDate = new Date(Date.UTC(y, m, d, h - denverTZOffset, min, s));

  const nowUTC = new Date();

  const diffMs = Math.abs(nowUTC - denverUTCDate);
  const diffMin = diffMs / 60000;
  return diffMin <= 75;
}

// Fallback: some themes/scripts overwrite the URL before our script loads, stripping ev_referral.
// If the inline script in ev-price-banner-functions ran first, it saved to sessionStorage.
// Stores that don't modify the URL will have ev_referral in evQueryParams - no fallback needed.
const evReferral = evQueryParams['ev_referral'] || (function () {
  try {
    var stored = sessionStorage.getItem('EV.ev_referral');
    if (stored) {
      sessionStorage.removeItem('EV.ev_referral');
      return stored;
    }
  } catch (e) {}
  return null;
})();


if (evReferral) {
  const decodedInputs = atob(decodeURIComponent(evReferral));
  const inputs = {};
  decodedInputs.split('&').forEach(param => {
    const [key, value] = param.split('=');
    inputs[key] = value;
  });

  const shopifyDealId = inputs['shopifyDealId'];
  console.log('EV: Deal ID ', shopifyDealId, 'received.');
  const evUUID = inputs['userUUID'];
  const _evauth = inputs['_evauth'];
  const _t = inputs['_t'];

  if (!evIsValidT(_t)) {
    console.warn('EV: Invalid or expired _t timestamp, skipping cart update. Deal activation failed.');
    const url = new URL(window.location.href);
    url.searchParams.delete('ev_referral');
    history.replaceState(null, '', url.pathname + url.search);
  } else {
    // Attach cart attributes
    var formData = new FormData();
    formData.append('attributes[EV._evauth]', _evauth);
    formData.append('attributes[EV._t]', _t);
    formData.append('attributes[EV.shopifyDealId]', shopifyDealId);
    formData.append('attributes[EV.userUUID]', evUUID);

    window.expertVoiceActivationInProgress = true;
    fetch('/cart/update.js', {
      method: 'POST',
      body: formData,
    })
      .then(async function (response) {
        var data = await response.json();
        if (!response.ok || (data.status >= 400)) {
          console.error('EV: Activation in Cart failed', response.status, data);
          return;
        }
        console.log('EV: Deal activated successfully', data);
        window.dispatchEvent(
          new CustomEvent('expertvoice:cart-activated', { detail: data.attributes || {} })
        );
        await initExpertVoice();
        return data;
      })
      .then(function (data) {
        if (data) {
          const url = new URL(window.location.href);
          url.searchParams.delete('ev_referral');
          history.replaceState(null, '', url.pathname + url.search);
        }
      })
      .catch(function (error) {
        console.error('EV: Error activating deal:', error);
      })
      .finally(function () {
        window.expertVoiceActivationInProgress = false;
      });
  }
}
