'use client';

import React, { useState } from 'react';
import type { FooterParent, NavigationShape, NavLink, SocialItem } from './Layout';
import Button from '@/components/Button';
import { axiosClient } from '@/utils/axiosClient';

type FooterProps = {
  navigation?: NavigationShape | null;
  pagesNav?: FooterParent[];
};

const defaultNav = {
  solutions: [] as NavLink[],
  support: [] as NavLink[],
  company: [] as NavLink[],
  legal: [] as NavLink[],
  social: [] as SocialItem[],
};

export default function Footer({ navigation, pagesNav }: FooterProps) {
  const nav = navigation || defaultNav;
  const parents = Array.isArray(pagesNav) ? pagesNav : [];

  // Nouvel état pour le formulaire de newsletter
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const isValidEmail = /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      const response = await axiosClient.post('/api/public/newsletter', { email });
      if (response.status === 201 || response.status === 200) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err: any) {
      console.error('Newsletter subscribe error', err);
      setStatus('error');
    }
  };

  return (
    <footer className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {parents.slice(0, 2).map((parent) => (
                <div key={parent.name}>
                  <h3 className="text-sm/6 font-semibold text-gray-100">
                    <a href={parent.href} className="hover:underline">{parent.name}</a>
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {parent.children.map((child) => (
                      <li key={child.name}>
                        <a href={child.href} className="text-sm/6 text-gray-300 hover:text-gray-100">
                          {child.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {parents.slice(2, 4).map((parent) => (
                <div key={parent.name} className={parent ? '' : 'hidden'}>
                  <h3 className="text-sm/6 font-semibold text-gray-100">
                    <a href={parent.href} className="hover:underline">{parent.name}</a>
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {parent.children.map((child) => (
                      <li key={child.name}>
                        <a href={child.href} className="text-sm/6 text-gray-600 hover:text-gray-900">
                          {child.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 xl:mt-0">
            <h3 className="text-sm/6 font-semibold text-gray-300">Souscrire à la newsletter</h3>
            <form className="mt-6 sm:flex sm:max-w-md" onSubmit={handleSubmit} noValidate>
              <label htmlFor="email-address" className="sr-only">
                Adresse email
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                placeholder="Saisir votre adresse email"
                autoComplete="email"
                className="w-full min-w-0 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:w-64 sm:text-sm/6 xl:w-full"
                aria-invalid={status === 'error' ? 'true' : 'false'}
              />
              <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={!isValidEmail || status === 'loading'}
                >
                  {status === 'loading' ? 'En cours...' : 'S\'abonner'}
                </Button>
              </div>
            </form>

            {status === 'error' && (
              <p className="mt-2 text-sm text-red-600">Veuillez saisir une adresse email valide.</p>
            )}
            {status === 'success' && (
              <p className="mt-2 text-sm text-green-600">Merci ! Votre adresse a été ajoutée.</p>
            )}
          </div>
        </div>
        <div
          className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
          <div className="flex gap-x-6 md:order-2">
            {nav.social!.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-600 hover:text-gray-800">
                <span className="sr-only">{item.name}</span>
                {item.icon ? React.createElement(item.icon, { 'aria-hidden': true, className: 'size-6' }) : null}
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm/6 text-gray-400 md:order-1 md:mt-0">
            &copy; 2025 Les Amis de Sainte Madeleine de la Jarrie, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}