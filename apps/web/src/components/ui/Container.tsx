import type { HTMLAttributes, PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    as?: keyof HTMLElementTagNameMap;
  }
>;

export function Container({
  children,
  className = "",
  as: Component = "div",
  ...rest
}: ContainerProps) {
  const classes = ["mx-auto max-w-6xl px-6", className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
