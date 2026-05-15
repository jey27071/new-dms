type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export function Icon({ name, className = "", filled = false }: IconProps) {
  const style = filled
    ? { fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }
    : undefined;
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
