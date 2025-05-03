import Image from "next/image";

interface Props {
  image: File;
}

export default function PostImage({ image }: Props) {
  const imageUrl = URL.createObjectURL(image);

  return (
    <Image
      src={imageUrl}
      width={250}
      height={250}
      alt="post-image"
      className="flex-1 rounded-2xl object-cover"
    />
  );
}
