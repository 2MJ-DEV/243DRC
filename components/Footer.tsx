const Footer = () => {
  return (
    <>
      <footer className="border-t">
        <div className="">
          <div className="bg-[#007FFF]" />
          <div className="bg-[#EFDA5B]" />
          <div className="bg-[#CA3E4B]" />
        </div>
        <div className="flex justify-between py-4 max-w-6xl mx-auto text-sm">
          <div className="">
            <span>
              <a href="http://julesmukadi.me">2MJ-DEV</a>
            </span>
          </div>
          <div className="flex gap-1">
            <span>Alimenté par</span>
            <div className="">
              <span className="text-[#EFDA5B]">243</span>
            <span className="text-[#007FFF]">RDC</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
