'use client';

import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { trackEvent, type AnalyticsProperties } from '@/lib/analytics';

type TrackedLinkProps = PropsWithChildren<LinkProps<string> & AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventProperties?: AnalyticsProperties;
}>;

export function TrackedLink({ eventName, eventProperties, onClick, children, ...props }: TrackedLinkProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, eventProperties);
    onClick?.(event);
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
