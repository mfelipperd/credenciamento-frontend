import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface CardProps {
  title?: string;
  children?: ReactElement;
  className?: string;
}
export const CardRoot = ({ children, title, className }: CardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">{children}</CardContent>
    </Card>
  );
};
