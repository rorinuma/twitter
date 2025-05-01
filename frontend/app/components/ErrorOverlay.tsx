import { useEffect } from "react";

export default function ErrorOverlay({ error }: { error: string }) {
  useEffect(() => {
    console.log("error component mounted");
  }, []);
  return (
    error && (
      <div className="fixed bottom-4 mb-4 justify-center bg-blue py-2 px-3 rounded-lg text-center">
        {error}
      </div>
    )
  );
}
