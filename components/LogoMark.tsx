import Image from "next/image";

export default function LogoMark({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="Chromatus Consulting"
      width={597}
      height={624}
      priority
      className={className}
    />
  );
}
