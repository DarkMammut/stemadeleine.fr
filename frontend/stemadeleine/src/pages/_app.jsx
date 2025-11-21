// src/pages/_app.jsx
import React from 'react';
import ThemeProvider from '../components/ThemeProvider';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
