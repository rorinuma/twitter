"use client";

import Input from "@/components/shared/input/Input";
import BlueOverlay from "@/components/shared/overlays/BlueOverlay";
import { useAuth } from "@/context/authContext";
import { useClickOutside } from "@/hooks/clickOutside";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import defaultAvatar from "@/public/placeholder.jpg";
import Image from "next/image";
import { MdAddAPhoto } from "react-icons/md";
import GeneralTooltip from "@/components/ui/decorations/GeneralTooltip";
import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import ImageCropper from "@/components/utility/ImageCropper";

export default function ProfileSettings() {
  const modalRef = useRef<HTMLFormElement>(null);
  const addAvatarInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [nameValue, setNameValue] = useState<string>(user ? user.username : "");
  const [bioValue, setBioValue] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");
  const [previewURL, setPreviewURL] = useState<string>("");
  const { username } = useParams<{ username: string }>();

  if (user?.username !== username) {
    router.back();
  }

  useClickOutside([modalRef], () => {
    if (!imageSrc) {
      router.back();
    }
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
    if (e.target.value.trim() === "") {
      setNameError("Name can't be blank");
    } else {
      setNameError("");
    }
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value.trim() === "") {
      setNameError("Name can't be blank");
    } else {
      setNameError("");
    }
  };

  const handleAvatarAddClick = () => {
    addAvatarInputRef.current?.click();
  };

  const handleAvatarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target?.files?.[0];

    if (!image) return;

    const url = URL.createObjectURL(image);
    setImageSrc(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const onCropComplete = (file: Blob) => {
    setPreviewURL(URL.createObjectURL(file));
    setMessage("Crop complete");
  };

  let avatar = user?.avatarURL ?? defaultAvatar;
  if (previewURL) {
    avatar = previewURL;
  }

  return (
    user && (
      <>
        <BlueOverlay centered={true}>
          <form
            className="flex flex-col bg-background max-xs:w-full xs:min-w-[500px] min-h-[600px] rounded-2xl relative overflow-y-auto"
            ref={modalRef}
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between px-2 py-1 sticky top-0 h-[53px]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center"
                  onClick={() => router.back()}
                >
                  <IoMdClose className="p-2 size-10 hover:bg-nav-hover duration-(--hover-duration) rounded-full" />
                </button>
                <div className="font-bold text-xl">Edit Profile</div>
              </div>
              <button className="flex items-center justify-center h-[30px] bg-foreground px-3 py-2 rounded-full text-foreground-alt hover:opacity-90 duration-(--hover-duration)">
                Save
              </button>
            </div>
            <div className="h-[250px] relative">
              {user.bannerURL && (
                <Image
                  src={user.bannerURL}
                  height={200}
                  width={500}
                  alt="banner-image"
                  className="object-contain opacity-75"
                />
              )}
              <div className="flex items-center justify-center absolute inset-0 h-full w-full rounded-full">
                <GeneralTooltip content="Add photo">
                  <button
                    type="button"
                    className="flex items-center justify-center p-3 rounded-full bg-transparent-blurred hover:bg-transparent-blurred-hover duration-(--hover-duration)"
                  >
                    <MdAddAPhoto className="size-5" />
                  </button>
                </GeneralTooltip>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-2">
              <div className="relative h-[50px] ml-2 mb-2">
                <Image
                  src={avatar}
                  height={145}
                  width={145}
                  alt="avatar-image"
                  className="absolute bottom-0 object-contain rounded-full opacity-75 w-[145px] h-[145px]"
                />
                <div className="flex items-center justify-center absolute bottom-0 h-[145px] w-[145px] rounded-full">
                  <GeneralTooltip content="Add photo">
                    <button
                      className="flex items-center justify-center p-3 rounded-full bg-transparent-blurred hover:bg-transparent-blurred-hover duration-(--hover-duration)"
                      onClick={handleAvatarAddClick}
                      type="button"
                    >
                      <MdAddAPhoto className="size-5" />
                    </button>
                  </GeneralTooltip>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={addAvatarInputRef}
                className="hidden"
                onChange={handleAvatarImageUpload}
              />
              <Input
                label="Name"
                value={nameValue}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                defaultValue={user.username}
                error={nameError}
                maxLength={50}
              />
              <Input
                label="Bio"
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value)}
                maxLength={160}
                extended
              />
            </div>
          </form>
        </BlueOverlay>
        <ErrorOverlay error={message} />
        {imageSrc && (
          <ImageCropper
            imageSrc={imageSrc}
            setImageSrc={setImageSrc}
            onCropComplete={onCropComplete}
          />
        )}
      </>
    )
  );
}
