
    (function() {
      var preconnectOrigins = ["/_ext/cdn.shopify.com/","/_ext/extensions.shopifycdn.com/"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.Db3KX98s.js","/cdn/shopifycloud/checkout-web/assets/c1/app.sGMsWDjI.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.Dqyj125j.js","/cdn/shopifycloud/checkout-web/assets/c1/context-browser.CFeAJlQf.js","/cdn/shopifycloud/checkout-web/assets/c1/checkout-policy.CJnTuawr.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-installmentsNotSupportedForAddress.BM4CUG_3.js","/cdn/shopifycloud/checkout-web/assets/c1/receipt-mapper-load-recovery.D5_AhtwI.js","/cdn/shopifycloud/checkout-web/assets/c1/receipt-eager-mappers.CNYJWb8K.js","/cdn/shopifycloud/checkout-web/assets/c1/consent-manager-shared.BlqZhdCN.js","/cdn/shopifycloud/checkout-web/assets/c1/sections-shared.DlWG5jT4.js","/cdn/shopifycloud/checkout-web/assets/c1/error-logger-report-graphql-error.B0rYc0pz.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-pay-normalizeBuyerDetails.D6NxOs_3.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-derivations.BsGpVLPY.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shopCashMoney.2QUhB-5b.js","/cdn/shopifycloud/checkout-web/assets/c1/color-contrast-colorContrast.CcjiGI4l.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-redeemable.BuA4Yj_g.js","/cdn/shopifycloud/checkout-web/assets/c1/hydrate.DokPsy9a.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayExternalAppContext.DmsLMy8i.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.BqHdjmAI.js","/cdn/shopifycloud/checkout-web/assets/c1/OnePage.BijHRXAk.js","/cdn/shopifycloud/checkout-web/assets/c1/components-DeliveryTransition.ETiN5tIz.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.DQxK9TPx.js","/cdn/shopifycloud/checkout-web/assets/c1/cross-border-hooks.CAP3tDRS.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePickupPoints.efLtT_DJ.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.CtXjTtn_.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressForm.D5dXi0M8.js","/cdn/shopifycloud/checkout-web/assets/c1/PhoneField.j5IsS2hI.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useSuppressShopPayModalOnLoad.DamzyvwT.js","/cdn/shopifycloud/checkout-web/assets/c1/components-RedirectionNotice.module.PqAvhx7B.js","/cdn/shopifycloud/checkout-web/assets/c1/Popover.B66CpGWg.js","/cdn/shopifycloud/checkout-web/assets/c1/Choice.rHPG5KL-.js","/cdn/shopifycloud/checkout-web/assets/c1/Checkbox.B6jGWxKm.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useCanChangeCompanyLocation.OhbMdapc.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.Cp0WIGnH.js","/cdn/shopifycloud/checkout-web/assets/c1/ImpressionEventCapture.BcHYFzzK.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-previous.BK_T2vZ0.js","/cdn/shopifycloud/checkout-web/assets/c1/CaptureEvents-ButtonWithRegisterWebPixel.Yc3GFNss.js","/cdn/shopifycloud/checkout-web/assets/c1/ShopPayLogo.DCuM1VxL.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.BzTydLpi.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePostPurchase.B7ugzjY6.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsMonorailTrack.DPXHEjdI.js","/cdn/shopifycloud/checkout-web/assets/c1/EmptyState.E-XOKoXe.js","/cdn/shopifycloud/checkout-web/assets/c1/Section-SectionStyleOverride.C677KVc_.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.B-RtL_63.js","/cdn/shopifycloud/checkout-web/assets/c1/PendingShipping.gPbKs_hV.js","/cdn/shopifycloud/checkout-web/assets/c1/RememberMeSection.qR-Fux1S.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentIcon.3tnVK7bs.js","/cdn/shopifycloud/checkout-web/assets/c1/cvv-cvvBridge.5CJdmMf1.js","/cdn/shopifycloud/checkout-web/assets/c1/payment-usePaymentExemptionReason.Ct1IO-Ke.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage.Dt__NQZN.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentLine.C_oYt7tN.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUpdateCheckoutAddress.rRhlF5jN.js","/cdn/shopifycloud/checkout-web/assets/c1/Section.CXBkJisf.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentErrorBanner.CQx_VJFV.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useOnePageFormSubmit.C-5H_Vv8.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentButtons.DDMsR7LA.js","/cdn/shopifycloud/checkout-web/assets/c1/PayButton-sizing.Bol8hWT0.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPaySessionTokenStorage.CqiJtFlp.js","/cdn/shopifycloud/checkout-web/assets/c1/sandbox-helpers.B8pEt4Y7.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-useViolationsHandler.C6iIQ_ME.js","/cdn/shopifycloud/checkout-web/assets/c1/checkout-as-guest-amazon-pay.DPalKFUJ.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-payment-button.C3G8NA9F.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShouldRevealExtension.BureSAub.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePreselectSpi.B4Vh44sC.js","/cdn/shopifycloud/checkout-web/assets/c1/Switch.ChUwfNLq.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useAvailableShopPromotionDiscounts.Bh6Yfevr.js","/cdn/shopifycloud/checkout-web/assets/c1/Middot.CN5ChUc-.js","/cdn/shopifycloud/checkout-web/assets/c1/EstimatedDeliveryContent.CewUh9ry.js","/cdn/shopifycloud/checkout-web/assets/c1/shipping-methods-consolidated-included.C3M8mEcN.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingLines.yspExI6o.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.VzrXDJxI.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal.DR3IkG6h.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodSelector._5nKXNAx.js","/cdn/shopifycloud/checkout-web/assets/c1/TextArea.BTlfyvLk.js","/cdn/shopifycloud/checkout-web/assets/c1/SubscriptionPriceBreakdown.D9CwAFT7.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayNewSignupLoginExperiment.CUhHk-__.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary.RdxzLtft.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useStableHostMethodsReferences.RUMnlfE9.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressSelector.BEDl-xZE.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.CFejhNBC.js","/cdn/shopifycloud/checkout-web/assets/c1/extensibility-browser-engine.QlIRbkeK.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-extension-execution-errors.D9rAF9wj.js","/cdn/shopifycloud/checkout-web/assets/c1/performance-index.CxkDiBTL.js","/cdn/shopifycloud/checkout-web/assets/c1/extensions-rpc.BptqkRbv.js","/cdn/shopifycloud/checkout-web/assets/c1/component-RuntimeExtension.7HHhgx3w.js","/cdn/shopifycloud/checkout-web/assets/c1/AnnouncementRuntimeExtensions.BD063PO0.js","/cdn/shopifycloud/checkout-web/assets/c1/QRCode.B_4gVKSY.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-dates.ChO2GdxN.js","/cdn/shopifycloud/checkout-web/assets/c1/NumberField.cfAhjxQf.js","/cdn/shopifycloud/checkout-web/assets/c1/extensions-remote-dom.DEwroOTf.js","/cdn/shopifycloud/checkout-web/assets/c1/EmailField.Es8y3fuZ.js","/cdn/shopifycloud/checkout-web/assets/c1/Sheet.BqYenzhL.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-rendering-extension-targets.DT2Aq5wx.js","/cdn/shopifycloud/checkout-web/assets/c1/dist-v4.EwEgHOG0.js","/cdn/shopifycloud/checkout-web/assets/c1/ExtensionsInner.DhIqpFbn.js","/cdn/shopifycloud/checkout-web/assets/c1/adapter-host.CjiNrDQD.js","/cdn/shopifycloud/checkout-web/assets/c1/sandbox.CPHgddd6.worker.js","/cdn/shopifycloud/checkout-web/assets/c1/sandbox-2025-07.Dj7kyiOY.worker.js","/_ext/extensions.shopifycdn.com/shopifycloud/checkout-web/assets/c1/polyfills-entry-modern.DzNfZ5Oj.worker.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.CM6PQxCl.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/checkout-policy.Dy6nOzcc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/stopwatch.CA9UAEYG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.DkWpx8b4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DeliveryTransition.CxmS455s.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RememberMeSection.DQeXjG1A.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Section.CU18S7Ap.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentLine.D3bcP-mr.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useOnePageFormSubmit.tSP6pJcp.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentIcon.gzvCNwz_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/cvvBridge.CIy8uDiZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Choice.DNWz77j7.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/sizing.ZgfJ23-d.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm.BdwN7V1K.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Switch.Dq_6Ius6.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EmptyState.BEvzDDvy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.CpHF4L7Q.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField.uZEuHncj.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Middot.D7Ujmshx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingLines.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MerchandiseModal.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RedirectionNotice.B8v_QGNW.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent.B_THySFF.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.2B5x30PG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentButtons.BbF1yV61.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RuntimeExtension.DWkDBM73.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AnnouncementRuntimeExtensions.DWE5rRxz.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/QRCode.BZ_m5G5a.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Checkbox.CfwUdlpL.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Popover.Bi1nHaU-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NumberField.CRpcZnVJ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Sheet.BXWsWJJp.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPaySessionTokenStorage.DfWUBaTh.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["/_ext/cdn.shopify.com/s/files/1/0152/5763/2822/files/selkirk_logo_tertiary_dark_x320.png?v=1752689729"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  