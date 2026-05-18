export function trackEvent(event, data = {}) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event, ...data });
  }
}

/**
 * Capture GCLID, wbraid, gbraid from URL immediately on page load.
 * Next.js SPA navigation strips query params from the URL, so GTM's
 * Conversion Linker may never see them. This stores them in cookies
 * (same format Google uses) so conversions can be attributed to search terms.
 */
export function captureGclid() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
  const timestamp = Math.round(Date.now() / 1000);

  const gclid = params.get('gclid');
  if (gclid) {
    document.cookie = `_gcl_aw=GCL.${timestamp}.${gclid}; expires=${expires}; path=/; SameSite=Lax`;
  }

  const wbraid = params.get('wbraid');
  if (wbraid) {
    document.cookie = `_gcl_gw=GCL.${timestamp}.${wbraid}; expires=${expires}; path=/; SameSite=Lax`;
  }

  const gbraid = params.get('gbraid');
  if (gbraid) {
    document.cookie = `_gcl_gb=GCL.${timestamp}.${gbraid}; expires=${expires}; path=/; SameSite=Lax`;
  }
}

export function trackBookAppointment(locationName) {
  trackEvent('book_appointment', {
    event_category: 'engagement',
    event_label: locationName || 'unknown',
  });
}

export function trackPhoneCall(phoneNumber, locationName) {
  trackEvent('phone_call_lead', {
    event_category: 'contact',
    event_label: locationName || 'unknown',
    phone_number: phoneNumber,
  });
}

export function trackGetDirections(locationName) {
  trackEvent('get_directions', {
    event_category: 'engagement',
    event_label: locationName || 'unknown',
  });
}

export function trackContactFormSubmit() {
  trackEvent('contact_form_submit', {
    event_category: 'contact',
  });
}

export function trackSignUp(type) {
  trackEvent('sign_up', {
    event_category: 'engagement',
    event_label: type || 'general',
  });
}

export function trackPageView(url) {
  trackEvent('page_view', {
    page_path: url,
  });
}
