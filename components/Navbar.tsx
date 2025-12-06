import Image from "next/image";
import { Button } from "./ui/button";
import AuthButton from "./AuthButton";

const Navbar = () => {
  return (
    <>
      <div className="sticky md:top-3 top-0 z-50 w-full">
        <div className="max-w-6xl backdrop-blur border border-border md:rounded-2xl px-4 mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/flag-rdc.png"
              alt="Drapeau de la RDC"
              width={32}
              height={20}
            />
            {/* <h1 className="text-xl font-bold text-foreground">
              <span className="text-[#EFDA5B]">243</span>
              <span className="text-[#007FFF]">RDC</span>
            </h1> */}
          </div>

          <div className="flex items-center font-sans space-x-3">
            <Button variant="outline">
              <span className="hidden sm:inline">Contribuer</span>
            </Button>

            <AuthButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
