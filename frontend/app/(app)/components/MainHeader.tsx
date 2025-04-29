import MainHeaderItem from "./MainHeaderItem";
import { FaXTwitter } from "react-icons/fa6";
import MobileAvatar from "./MobileAvatar";

interface HeaderItem {
  item: string;
  path: string
}

interface Props {
  items: HeaderItem[];

}

export default function MainHeader({ items }: Props) {
  const displayedItems = items.map(({ item, path }, index) => (
    <MainHeaderItem item={item} path={path} key={index} />
  ))

  return (
    <header className="sticky top-0 flex flex-col backface-visible h-28 xs:h-14 backdrop-blur-md">
      <div className="relative flex flex-1/2 xs:hidden items-center m-2">
        <MobileAvatar />
        <FaXTwitter className="size-7 absolute left-5/12 transform translate-x-1/2" />
      </div>
      <div className="flex flex-1/2 xs:grow-1 xs:shrink-1 overflow-x-auto border-border border-b">
        {displayedItems}
      </div>
      { /* <div></div>  idk whether ill implement live or not*/}
    </header>
  )
}
