import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('[Analytics] VITE_GA_MEASUREMENT_ID is not set. Google Analytics is disabled.');
    return;
  }
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (path, title) => {
  if (!GA_MEASUREMENT_ID) return;
  ReactGA.send({ hitType: 'pageview', page: path, title });
};

export const trackEvent = (category, action, label, value) => {
  if (!GA_MEASUREMENT_ID) return;
  ReactGA.event({ category, action, label, value });
};

export const trackClick = (elementName, category = 'UI') => {
  trackEvent(category, 'click', elementName);
};
