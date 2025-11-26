'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';

type ReCaptchaHandle = {
  getValue: () => string | null | undefined;
  reset: () => void;
  execute: () => void;
};

type ReCaptchaProps = {
  siteKey?: string;
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
};

type ReCAPTCHAInstance = {
  execute?: () => void;
  reset?: () => void;
  getValue?: () => string | null;
};

const ReCaptcha = forwardRef<ReCaptchaHandle | null, ReCaptchaProps>(
  ({ siteKey, onChange, onExpired, onError }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHAInstance | null>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return recaptchaRef.current?.getValue?.();
      },
      reset: () => {
        recaptchaRef.current?.reset?.();
      },
      execute: () => {
        recaptchaRef.current?.execute?.();
      },
    }));

    const [ReCAPTCHA, setReCAPTCHA] = React.useState<React.ComponentType<Record<string, unknown>> | null>(null);

    React.useEffect(() => {
      import('react-google-recaptcha')
        .then((module) => {
          // convert default export to a generic React component type
          const comp = module.default as unknown as React.ComponentType<Record<string, unknown>>;
          setReCAPTCHA(() => comp);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load react-google-recaptcha', err);
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

    const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    const RecaptchaComponent = ReCAPTCHA as React.ComponentType<any>;

    return (
      // dynamic component
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <RecaptchaComponent
        ref={recaptchaRef as any}
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
