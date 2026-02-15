import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-main' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'OSCE Master V3 | Clinical Simulation',
  description: 'High-Fidelity AI Patient Simulation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} h-full dark`}>
      <body className="font-sans antialiased text-slate-100 h-full bg-slate-950">
        <div className="flex h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
