interface IconProps {
  className?: string
}

function Icon({
  className,
  strokeWidth = 2,
  children,
}: IconProps & { strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const XIcon = ({ className }: IconProps) => (
  <Icon className={className} strokeWidth={2.5}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)
export const SearchIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </Icon>
)
export const FilterIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />
  </Icon>
)
export const PriceIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M12 2v20m5-17H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
)
export const UploadIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7-5-5-5 5m5-5v12" />
  </Icon>
)
export const DownloadIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" />
  </Icon>
)
export const FileIcon = ({ className }: IconProps) => (
  <Icon className={className} strokeWidth={1.5}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </Icon>
)
export const EyeIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)
export const EyeOffIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-5.94M9.9 4.24A11 11 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.17 4.36M1 1l22 22" />
  </Icon>
)
export const HistoryIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5m4-1v5l4 2" />
  </Icon>
)
export const ChartIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M18 20V10m-6 10V4M6 20v-6" />
  </Icon>
)
export const ArrowUpIcon = ({ className }: IconProps) => (
  <Icon className={className} strokeWidth={2.5}>
    <path d="m6 15 6-6 6 6" />
  </Icon>
)
export const ArrowDownIcon = ({ className }: IconProps) => (
  <Icon className={className} strokeWidth={2.5}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)

export function Spinner({ className = 'w-6 h-6' }: IconProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`${className} rounded-full border-2 border-border border-t-violet-500 loader-spin`}
    />
  )
}
