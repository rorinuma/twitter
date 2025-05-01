import Image, { StaticImageData } from "next/image";

interface Props {
  image: StaticImageData;
}

export default function Avatar({ image }: Props) {
  return (
    <Image
      src={image}
      width={40}
      height={40}
      alt="avatar-image"
      className="rounded-full min-w-10 min-h-10 object-cover"
    />
  );
}
