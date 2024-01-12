import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      day: {
        format?: string;
        children?: string | Date;
      };
    }
  }
}
