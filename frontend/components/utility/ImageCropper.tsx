"use client";

import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";
import { getCroppedImg } from "./cropUtils"; // util to extract the cropped image
import type { Area } from "react-easy-crop";
import BlueOverlay from "../shared/overlays/BlueOverlay";
import ArrowButton from "../ui/buttons/ArrowButton";

interface Props {
  imageSrc: string;
  setImageSrc: React.Dispatch<React.SetStateAction<string>>;
  onCropComplete: (file: Blob) => void;
  croppingImageType: "avatar" | "banner" | null;
}
export default function ImageCropper({
  imageSrc,
  onCropComplete,
  setImageSrc,
  croppingImageType,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
    setImageSrc("");
  };

  const aspectRatio = croppingImageType === "avatar" ? 1 : 16 / 9;

  return (
    <BlueOverlay centered>
      <div className="relative h-[650px] w-[600px] bg-background rounded-2xl">
        <div className="flex justify-between h-[53px] p-2 absolute top-0 w-full z-50">
          <div className="flex items-center gap-5">
            <ArrowButton setImageSrc={setImageSrc} />
            <div className="font-bold text-xl">Edit media</div>
          </div>
          <button
            className="flex items-center justify-center bg-foreground rounded-full text-foreground-alt py-2 px-3 hover:opacity-90 duration-(--hover-duration)"
            onClick={handleDone}
          >
            Apply
          </button>
        </div>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          cropShape="rect"
          showGrid={false}
          classes={{ containerClassName: "rounded-2xl" }}
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </BlueOverlay>
  );
}
