import Image from "next/image";
import DuoSplash from "@/public/duo-splash.svg";

interface LogoProps {
  variant?: 'desktop' | 'mobile' | 'cover';
}

const Logo = ({ variant = 'desktop' }: LogoProps) => {
  if (variant === 'cover') {
    return (
      <div className="flex items-center">
        <div className="relative w-10 h-9 overflow-hidden rounded-full">
          <Image
            src={DuoSplash}
            alt="Duolingo"
            fill
            objectPosition="left"
            className="object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="flex items-center">
        <Image
          src={DuoSplash}
          alt="Duolingo"
          width={40}
          height={38}
          className="w-auto h-auto"
          priority
        />
      </div>
    );
  }
  return (
    <div className="flex items-center">
      <Image
        src={DuoSplash}
        alt="Duolingo"
        width={172}
        height={42}
        className="w-auto h-auto"
        priority
      />
    </div>
  );
};

export default Logo;