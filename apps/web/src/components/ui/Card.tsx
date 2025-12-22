import type { HTMLAttributes, PropsWithChildren } from "react";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    as?: keyof HTMLElementTagNameMap;
  }
>;

export function Card({ children, className = "", as: Component = "div", ...rest }: CardProps) {
  const classes = [
    "rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
