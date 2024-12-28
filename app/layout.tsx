import type { Metadata } from "next";
import { Roboto_Mono } from 'next/font/google'
import "./globals.css";
import { ToastContainer } from "react-toastify";

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "ZS1MM RADIO",
  description: "ZS1MM RADIO APP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto_mono.className} antialiased overflow-hidden`}
      >
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {children}
      </body>
    </html>
  );
}
