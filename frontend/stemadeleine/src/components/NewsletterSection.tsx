'use client';

import React, {useState} from 'react';
import {axiosClient} from '@/utils/axiosClient';

export default function NewsletterSection() {
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
            const response = await axiosClient.post('/api/public/newsletter', {email});
            if (response.status === 201 || response.status === 200) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (err: unknown) {
            console.error('Newsletter subscribe error', err);
            setStatus('error');
        }
    };

    return (
        <section
            className="py-[4.5rem] px-10 text-center bg-secondary"
        >
            <div className="mx-auto w-full max-w-[600px]">
                <p
                    className="mb-[0.7rem] text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-light"
                >
                    Restez informé
                </p>

                <h2
                    className="mb-[0.7rem] font-serif text-[1.9rem] font-normal leading-[1.25] text-primary"
                >
                    La lettre de l&apos;association
                </h2>

                <p
                    className="mb-8 text-sm leading-[1.85] text-secondary-light"
                >
                    Actualités des chantiers, agenda des événements, vie de l&apos;association — une fois par
                    trimestre, directement dans votre boîte mail.
                </p>

                <form className="mx-auto flex max-w-[460px]" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="nl-email" className="sr-only">
                        Adresse email
                    </label>
                    <input
                        id="nl-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status !== 'idle') setStatus('idle');
                        }}
                        placeholder="votre@email.fr"
                        autoComplete="email"
                        aria-invalid={status === 'error' ? 'true' : 'false'}
                        className="min-w-0 flex-1 px-[1.2rem] py-[0.9rem] text-[13px] outline-none bg-secondary-light placeholder:text-secondary-light/70 border border-secondary-dark"
                    />
                    <button
                        type="submit"
                        disabled={!isValidEmail || status === 'loading'}
                        className="cursor-pointer whitespace-nowrap px-[1.6rem] text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-primary text-secondary-light"
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-light)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)';
                        }}
                    >
                        {status === 'loading' ? 'En cours…' : "S'abonner"}
                    </button>
                </form>

                {status === 'error' && (
                    <p className="mt-3 text-sm" style={{color: 'rgba(44,36,22,0.8)'}}>
                        Veuillez saisir une adresse email valide.
                    </p>
                )}
                {status === 'success' && (
                    <p className="mt-3 text-sm" style={{color: 'rgba(44,36,22,0.8)'}}>
                        Merci&nbsp;! Votre adresse a été ajoutée.
                    </p>
                )}
            </div>
        </section>
    );
}
