import Post from "@/app/(app)/components/Post";

export default function PostModal() {
  return (
    <div className="flex items-center justify-center fixed inset-0 z-20 bg-blue-overlay">
      <Post modal={true} />
    </div>
  );
}
