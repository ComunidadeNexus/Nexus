import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

const toPascalCase = (str: string) => {
  if (!str) return "";
  return str.replace(/(^\w|-\w)/g, (clearAndUpper) => clearAndUpper.replace(/-/, "").toUpperCase());
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (!name) return null;

  const iconName = toPascalCase(name);
  const IconComponent = (LucideIcons as any)[iconName];

  if (!IconComponent) {
    // Fallback para emojis
    return (
      <span
        className={props.className}
        style={{
          fontSize: typeof props.size === "number" ? `${props.size}px` : props.size,
          lineHeight: 1,
        }}
      >
        {name}
      </span>
    );
  }

  return <IconComponent {...props} />;
};
