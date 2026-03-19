export const metadata = {
  title: 'Hackaton Contabilidad',
  description: 'Visor de datos contables',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
