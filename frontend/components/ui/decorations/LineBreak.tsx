export default function LineBreak({
  text,
  width = "300px",
}: {
  text: string;
  width?: string;
}) {
  return (
    <div className={`flex items-center w-[${width}] h-5`}>
      <div className="flex flex-1 bg-border h-[1px]"></div>
      <div className="px-2">{text}</div>
      <div className="flex flex-1 bg-border h-[1px]"></div>
    </div>
  );
}
