import Image from "next/image";
import DuoSplash from "@/public/duo-splash.svg"
const Logo = () => {
  return (
    <div className="flex items-center">
      <div className="relative w-0 sm:w-30 md:w-40 lg:w-50">
        <Image
          src={DuoSplash}
          alt="Duolingo"
          width={172}
          height={42}
          className="w-full h-auto drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Logo;
