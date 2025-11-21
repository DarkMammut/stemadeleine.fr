'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * ReCAPTCHA component wrapper for Google reCAPTCHA v2
 * Requires react-google-recaptcha package
 * For Next.js expose the site key via NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 */
const ReCaptcha = forwardRef(
  ({ siteKey, onChange, onExpired, onError }, ref) => {
    const recaptchaRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return recaptchaRef.current?.getValue();
      },
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      },
    }));

    // Dynamically import ReCAPTCHA to avoid SSR issues
    const [ReCAPTCHA, setReCAPTCHA] = React.useState(null);

    React.useEffect(() => {
      import('react-google-recaptcha').then((module) => {
        setReCAPTCHA(() => module.default);
      });
    }, []);

    if (!ReCAPTCHA) {
      return (
        <div
          className="flex items-center justify-center h-20 bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">Loading reCAPTCHA...</p>
        </div>
      );
    }

    // Use NEXT_PUBLIC_RECAPTCHA_SITE_KEY as a fallback for Next.js
    const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    return (
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={effectiveSiteKey}
        onChange={onChange}
        onExpired={onExpired}
        onError={onError}
      />
    );
  },
);

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
