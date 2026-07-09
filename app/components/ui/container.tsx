import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/misc'

const containerVariants = cva(
	'mx-auto w-full',
	{
		variants: {
			size: {
				none: '',
				prose: 'max-w-3xl',
				narrow: 'max-w-4xl',
				medium: 'max-w-5xl',
				large: 'max-w-6xl',
				default: 'max-w-7xl',
				wide: 'max-w-[1400px]',
				ultra: 'max-w-[1440px]',
				full: 'max-w-full',
			},
			padding: {
				none: 'p-0',
				sm: 'px-4 py-6 sm:px-6',
				default: 'px-4 py-10 sm:px-6 lg:px-8',
				lg: 'px-6 py-16 md:py-20 lg:px-8',
				xl: 'px-6 py-24 md:py-32 lg:px-8',
			},
			border: {
				none: '',
				top: 'border-t border-border',
				bottom: 'border-b border-border',
				x: 'border-x border-border',
				y: 'border-y border-border',
				all: 'border border-border',
			},
			background: {
				transparent: 'bg-transparent',
				muted: 'bg-muted/30',
				card: 'bg-card text-card-foreground',
				accent: 'bg-accent/10',
			},
		},
		defaultVariants: {
			size: 'default',
			padding: 'none', // Default is none to let parent layouts handle vertical padding if desired, but we can configure it as needed
			border: 'none',
			background: 'transparent',
		},
	}
)

export interface ContainerProps
	extends React.HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof containerVariants> {
	as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'aside'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
	({ className, size, padding, border, background, as: Component = 'div', ...props }, ref) => {
		return (
			<Component
				ref={ref}
				className={cn(containerVariants({ size, padding, border, background, className }))}
				{...props}
			/>
		)
	}
)

Container.displayName = 'Container'

export { Container, containerVariants }

