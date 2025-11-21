import React from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import Navigation from '@/components/Navigation';
import IconButton from '@/components/IconButton';
import useGetOrganization from '@/hooks/useGetOrganization';
import useGetMedia from '@/hooks/useGetMedia';
import Link from 'next/link';
import Image from 'next/image';

function Header() {
  const { settings } = useGetOrganization();
  const { mediaUrl: logoUrl } = useGetMedia(settings?.logoMedia);
  const finalLogoUrl = logoUrl ?? '/logo.png';

  return (
    <header>
      {/* Header principal */}
      <div
        className="fixed top-0 left-0 w-full h-24 flex justify-center items-center bg-gradient-primary z-40 shadow-xl">
        {/* Logo */}
        <Link href="/">
          <div className="fixed top-0 left-0 h-14 md:h-24 w-auto rounded-tr-lg rounded-br-lg bg-transparent z-20"
               style={{ width: 'auto' }}>
            <div className="relative h-full w-[5.5rem] md:w-[6rem]">{
            }
              <Image
                src={finalLogoUrl}
                alt="Logo"
                fill
                sizes="auto"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <Navigation />

        {/* Bouton Don - visible uniquement sur desktop */}
        <IconButton
          as={Link}
          href="/association/don"
          icon={HeartIcon}
          label="Don"
          variant="secondary"
          className="hidden lg:flex absolute right-5 xl:right-5 uppercase"
        />
      </div>
    </header>
  );
}

export default Header;
