import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/utils/auth/AuthContext";
import {I18nProvider} from "@/i18n/I18nContext";
import {ContactsProvider} from "@/contexts/ContactsContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Dashboard | LASMLJ",
    description: "Gestion du site des Amis de Sainte-Madeleine de la Jarrie",
    icons: {
        icon: [
            {url: '/favicon.png', type: 'image/png'},
            {url: '/favicon.svg', type: 'image/svg+xml'},
            {url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon'},
            {url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon'}
        ],
        shortcut: '/favicon.png',
        apple: '/favicon.png',
    },
};

export default function RootLayout({children}) {
    return (
        <html lang="fr" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <I18nProvider>
            <AuthProvider>
                <ContactsProvider>{children}</ContactsProvider>
            </AuthProvider>
        </I18nProvider>
        </body>
        </html>
    );
}
