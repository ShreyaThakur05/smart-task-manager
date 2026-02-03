import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './components/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProductionErrorBoundary } from './components/ProductionErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Smart Task Management',
  description: 'AI-powered task management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`} suppressHydrationWarning={true}>
        <ProductionErrorBoundary>
          <ErrorBoundary>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ErrorBoundary>
        </ProductionErrorBoundary>
      </body>
    </html>
  )
}