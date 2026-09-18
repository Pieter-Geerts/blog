export type AnalyticsProperties = Record<string, string | number | boolean>;

type Umami = {
  track?: (eventName: string, properties?: AnalyticsProperties) => void;
};

declare global {
  interface Window {
    umami?: Umami;
  }
}

export function trackEvent(eventName: string, properties?: AnalyticsProperties) {
  if (typeof window !== 'undefined' && typeof window.umami?.track === 'function') {
    window.umami.track(eventName, properties);
  }
}
