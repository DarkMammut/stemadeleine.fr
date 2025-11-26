declare module 'react-google-recaptcha' {
  import * as React from 'react';

  export interface ReCAPTCHAProps {
    sitekey?: string;
    onChange?: (token: string | null) => void;
    onExpired?: () => void;
    onError?: () => void;
    size?: 'normal' | 'compact' | 'invisible';
    tabindex?: number;
    hl?: string;
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    execute: () => void;
    reset: () => void;
    getValue: () => string | null;
  }
}

