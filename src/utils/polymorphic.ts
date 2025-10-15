import * as React from "react";

export type PolymorphicComponentProps<E extends React.ElementType, P = {}> = P & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof P | "as">;
