import type { Metadata } from 'next';
// #17.1 google fonts에 있는 폰트들을 쉽게 불러올 수 있도록 해줌
import { Roboto, Rubik_Scribble } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

/*
  font 설정하려면 tailwind의 theme에 추가해서 사용
*/
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--roboto-text',
});

const kb = localFont({
  src: './KBFGTextL.otf',
  variable: '--kb',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Karrot Market',
    default: 'Karrot Market',
  },
  description: 'Sell and Buy all the things!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable}  ${kb.variable} bg-neutral-900 text-white max-w-screen-sm m-auto`}
      >
        {children}
      </body>
    </html>
  );
}
