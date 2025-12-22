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
  return (
    <Component className={`mx-auto max-w-6xl px-6 ${className}`} {...rest}>
      {children}
    </Component>
  );
}
