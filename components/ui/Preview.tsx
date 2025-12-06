import Image from "next/image";

const Preview = () => {
  return (
    <div>
      {/* Image responsive */}
      <div className="relative aspect-video w-full">
        <Image src="/Preview-img.png" alt="Preview" fill className="object-cover" />
      </div>
    </div>
  );
};

export default Preview;
