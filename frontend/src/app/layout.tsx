import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MoziTranslate - PDF Translation App',
  description: 'Translate PDF pages in real-time as you read them',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {  return (
    <html lang="pt">
      <body className={inter.className}>
        <header className="bg-gradient-to-r from-sky-600 to-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-200">
                MoziTranslate
              </h1>
            </div>
            <div className="hidden md:flex space-x-4 text-sm">
              <a href="#" className="hover:text-sky-200 transition-colors">Sobre</a>
              <a href="#" className="hover:text-sky-200 transition-colors">Traduções</a>
              <a href="#" className="hover:text-sky-200 transition-colors">Ajuda</a>
            </div>
          </div>
        </header>
        <main className="min-h-screen-minus-header">{children}</main>
        <footer className="bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 p-4 text-center text-sm border-t border-sky-200 dark:border-sky-800">
          <div className="container mx-auto">
            <p>© {new Date().getFullYear()} MoziTranslate - Tradutor de PDF em Tempo Real</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
