import Image from "next/image";

const Footer = () => {
  return (
    <>
      <footer className="border-t">
        <div className="">
          <div className="bg-[#007FFF]" />
          <div className="bg-[#EFDA5B]" />
          <div className="bg-[#CA3E4B]" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 py-4 px-4 max-w-6xl mx-auto text-sm">
          <div className="">
            <span>
              <a href="http://julesmukadi.me" className="hover:underline">
                2MJ-DEV
              </a>
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 items-center border-r pr-4 mr-4">
              <a href="https://243-drc-vercel.stpg.dev/">
                <img
                  src="https://243-drc-vercel.openstatus.dev/badge/v2"
                  alt="All Systems Operational"
                />
              </a>
            </div>
            <div className="flex gap-1 items-center">
              <span>Alimenté par</span>
              <div className="flex">
                <span className="text-[#EFDA5B]">243</span>
                <span className="text-[#007FFF]">RDC</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
