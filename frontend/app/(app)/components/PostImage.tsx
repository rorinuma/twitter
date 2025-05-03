import IconButton from "@/app/components/IconButton";
import SmallButton from "@/app/components/SmallButton";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";

interface Props {
  image: File;
  index: number;
  handleImageDelete: (index: number) => void;
}

export default function PostImage({ image, index, handleImageDelete }: Props) {
  const imageUrl = URL.createObjectURL(image);

  return (
    <div className="flex relative min-w-1/2 grow shrink ">
      <Image
        src={imageUrl}
        width={250}
        height={250}
        alt="post-image"
        className="flex flex-1 rounded-2xl object-cover"
      />
      <div className="absolute top-1 left-1">
        <SmallButton bg="blurred" text="Edit" />
      </div>
      <div className="absolute top-1 right-1">
        <IconButton
          icon={<IoMdClose />}
          bg="blurred"
          onClick={() => handleImageDelete(index)}
        />
      </div>
    </div>
  );
}
