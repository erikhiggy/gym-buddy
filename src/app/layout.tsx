import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import './globals.css';

const inter = Inter({
	variable: '--font-sans',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Gym Buddy - Your Personal Workout Manager',
	description: 'Track workouts, build strength, and achieve your fitness goals',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${inter.variable} antialiased min-h-screen bg-background font-sans`}
			>
				<ThemeProvider attribute='class' enableSystem disableTransitionOnChange>
					<div className='relative flex min-h-screen flex-col'>
						<div className='flex justify-end p-4'>
							<ThemeToggle />
						</div>
						<main className='flex-1'>{children}</main>
					</div>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
