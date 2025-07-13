export default function ErrorOverlay({ error }: { error: string }) {
  return (
    error && (
      <div className="fixed bottom-4 mb-4 justify-center bg-blue py-2 px-3 rounded-lg text-center z-50">
        {error}
      </div>
    )
  );
}
