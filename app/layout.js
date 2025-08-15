export const metadata = {
  title: 'SAFEGUARD SOLUTIONS — Calidad, seguridad y auditoría',
  description: 'Soluciones ambientales para tu empresa. Gestión de calidad, seguridad industrial y cumplimiento regulatorio.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background: 'linear-gradient(to bottom, var(--bgFrom), var(--bgTo))' }}>
        {children}
      </body>
    </html>
  );
}