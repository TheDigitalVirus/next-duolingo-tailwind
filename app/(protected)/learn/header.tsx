import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header className="sticky top-0 bg-background border-b py-4 flex items-center justify-between">
      <Link href="/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-10" />
    </header>
  );
};