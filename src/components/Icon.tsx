import { iconPaths } from './iconPaths';

type IconProps = {
  name: string;
  className?: string;
  size?: number | string;
  title?: string;
};

const VIEWBOX_OVERRIDES: Record<string, string> = {
  auto_awesome: '0 0 48 48',
};

export default function Icon({ name, className, size, title }: IconProps) {
  const d = iconPaths[name];
  if (!d) return null;
  const viewBox = VIEWBOX_OVERRIDES[name] || '0 -960 960 960';
  return (
    <svg
      viewBox={viewBox}
      width={size || '1em'}
      height={size || '1em'}
      className={className}
      fill="currentColor"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}