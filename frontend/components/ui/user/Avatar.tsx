import Image, { StaticImageData } from "next/image";

interface Props {
  image: StaticImageData | string;
  width?: number;
  height?: number;
}

export default function Avatar({ image, width = 40, height = 40 }: Props) {
  return (
    <Image
      src={image}
      width={width}
      height={height}
      alt="avatar-image"
      className={`rounded-full object-cover`}
      style={{ width, height }}
      priority={true}
    />
  );
}
