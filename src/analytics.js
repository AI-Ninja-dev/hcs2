(() => {
  const MEASUREMENT_ID = (window.HCS_GA_ID || '').trim();
  const isConfigured = /^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID) && MEASUREMENT_ID !== 'G-XXXXXXXXXX';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  function loadGA4() {
    if (!isConfigured || document.querySelector('script[data-hcs-ga4]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.dataset.hcsGa4 = 'true';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
  }

  function send(eventName, params = {}) {
    if (!isConfigured) return;
    window.gtag('event', eventName, {
      ...params,
      page_location: window.location.href,
      page_title: document.title
    });
  }

  function labelFor(el) {
    return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function classifyClick(link) {
    const href = (link.getAttribute('href') || '').trim();
    const label = labelFor(link);
    const lower = (href + ' ' + label).toLowerCase();

    if (/wa\.me|whatsapp/.test(lower)) return ['whatsapp_enquiry', { link_text: label, link_url: href }];
    if (/caregrid/.test(lower)) return ['caregrid_interest', { link_text: label, link_url: href }];
    if (/service|biomedical|calibration|repair|booking/.test(lower)) return ['biomedical_service_interest', { link_text: label, link_url: href }];
    if (/request|enquir|availability|price/.test(lower)) return ['product_enquiry', { link_text: label, link_url: href }];
    if (/shop\.html|#products|#cgm-shop/.test(href)) return ['shop_interest', { link_text: label, link_url: href }];
    if (/mailto:/.test(href)) return ['email_enquiry', { link_text: label, link_url: href }];
    if (/tel:/.test(href)) return ['phone_enquiry', { link_text: label, link_url: href }];
    return null;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const classified = classifyClick(link);
    if (classified) send(classified[0], classified[1]);
  }, { passive: true });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const text = ((form.id || '') + ' ' + (form.className || '') + ' ' + (form.getAttribute('aria-label') || '')).toLowerCase();
    let eventName = 'form_submit';
    if (/service|biomedical|calibration|repair/.test(text)) eventName = 'biomedical_service_booking';
    else if (/product|request|enquir|quote|availability/.test(text)) eventName = 'product_enquiry_submit';
    else if (/caregrid/.test(text)) eventName = 'caregrid_enquiry_submit';
    send(eventName, { form_id: form.id || undefined });
  });

  window.HCSAnalytics = {
    event: send,
    purchase: ({ transaction_id, value, currency = 'ZAR', items = [] } = {}) =>
      send('purchase', { transaction_id, value, currency, items })
  };

  loadGA4();
})();