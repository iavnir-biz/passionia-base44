// Google Analytics via GTM dataLayer — no external package needed
// GTM script is loaded in index.html with container GTM-MHJ8M3ST

const getDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

export const initGA = () => {
  // GTM is initialized via the script tag in index.html
  // Nothing to do here, kept for compatibility
};

export const trackPageView = (path, title) => {
  getDataLayer().push({
    event: 'pageview',
    page: path,
    title: title || document.title,
  });
};

export const trackEvent = (category, action, label, value) => {
  getDataLayer().push({
    event: 'custom_event',
    event_category: category,
    event_action: action,
    event_label: label,
    event_value: value,
  });
};

export const trackClick = (elementName, category = 'UI') => {
  trackEvent(category, 'click', elementName);
};
