import './globals.css';

export const metadata = {
  title: 'WIFI MAUPASSANT - Admin Manager',
  description: 'Gestion interne des forfaits Wi-Fi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
