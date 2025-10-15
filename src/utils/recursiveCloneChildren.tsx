import * as React from "react";

export function recursiveCloneChildren(
  children: React.ReactNode,
  fn: (child: React.ReactElement) => React.ReactElement
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const clonedChild = fn(child as React.ReactElement);

    if ((child as React.ReactElement).props.children) {
      return React.cloneElement(clonedChild, {
        children: recursiveCloneChildren(
          (child as React.ReactElement).props.children,
          fn
        ),
      });
    }

    return clonedChild;
  });
}
