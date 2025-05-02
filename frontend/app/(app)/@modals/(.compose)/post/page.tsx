import Post from "@/app/(app)/components/Post";

export default function PostModal() {
  return (
    <div className="flex grow shrink fixed justify-center inset-0 z-20 bg-background xs:bg-blue-overlay">
      <Post modal={true} />
    </div>
  );
}
