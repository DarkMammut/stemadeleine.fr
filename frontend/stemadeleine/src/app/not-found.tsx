import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="pt-16 md:pt-20 lg:pt-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Page non trouvée</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Button as={Link} href="/" variant="primary">
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}
