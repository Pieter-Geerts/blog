'use client';

import { trackEvent } from '@/lib/analytics';

type AffiliateLinkProps = {
  href: string;
  label: string;
  trackingId?: string;
  calloutStyle?: 'neutral' | 'featured';
};

export function AffiliateLink({ href, label, trackingId, calloutStyle = 'neutral' }: AffiliateLinkProps) {
  function handleClick() {
    trackEvent('affiliate_click', {
      link_id: trackingId ?? label,
      url: href,
    });
  }

  const style =
    calloutStyle === 'featured'
      ? 'border border-zinc-300 bg-zinc-50 text-zinc-900'
      : 'border border-zinc-200 bg-white text-zinc-700';

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener sponsored"
      onClick={handleClick}
      className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:border-zinc-400 hover:bg-zinc-100 ${style}`}
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </a>
  );
}
