// CORE
import type { SVGProps } from 'react'
// TYPES
import type { IconName } from '@/components/ui/icons/types'
// UTILS
import { cn } from '@/utils/misc'

// ASSETS - Sprite SVG reference
// The sprite is generated at /icons/sprite.svg during build.
// El query ?rev= sirve de cache-busting: la URL del sprite es fija, así que al
// agregar iconos hay que subir este valor para invalidar el caché del CDN y del
// navegador (de lo contrario sirven el sprite viejo y faltan iconos).
// NOTA: usamos ?rev= y NO ?v=, porque ?v= es un parámetro reservado por Vite
// (versiona dependencias) y rompe la carga del sprite en el dev server.
const SPRITE_VERSION = '2'
const spriteHref = `/icons/sprite.svg?rev=${SPRITE_VERSION}`

const sizeClassName = {
	font: 'size-[1em]',
	xs: 'size-3',
	sm: 'size-6',
	md: 'size-8',
	lg: 'size-16',
	xl: 'size-17',
} as const

type Size = keyof typeof sizeClassName

const childrenSizeClassName = {
	font: 'gap-1.5',
	xs: 'gap-1.5',
	sm: 'gap-1.5',
	md: 'gap-2',
	lg: 'gap-2',
	xl: 'gap-3',
} satisfies Record<Size, string>

export type IconSizes = keyof typeof sizeClassName

export interface IconProps extends SVGProps<SVGSVGElement> {
	name: IconName
	testId?: string
	className?: string
	size?: IconSizes
}

/**
 * Icon component wrapper for SVG icons.
 * @returns SVG icon as a react component
 */
export function Icon({ name, size = 'font', testId, className, children, ...props }: IconProps) {
	if (children) {
		return (
			<span className={`inline-flex items-center ${childrenSizeClassName[size]}`}>
				<Icon name={name} size={size} className={className} {...props} />
				{children}
			</span>
		)
	}
	return (
		<svg
			viewBox="0 0 24 24"
			className={cn(
				sizeClassName[size],
				'inline-block flex-shrink-0 self-center fill-current stroke-current [&_*]:fill-current [&_*]:stroke-current',
				className
			)}
			data-testid={testId}
			data-name={name}
			{...props}
		>
			<title>{name}</title>
			<use href={`${spriteHref}#${name}`} />
		</svg>
	)
}

export { spriteHref as href }
export type { IconName }
