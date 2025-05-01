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
      className="rounded-full w-10 h-10 object-cover"
    />
  );
}
