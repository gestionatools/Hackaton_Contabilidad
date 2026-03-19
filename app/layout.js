export const metadata = {
  title: 'Hackaton URBA',
  description: 'Visor de datos urbanísticos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
