export default function Overlay({ children }: { children: React.ReactNode }) {
  return <section className="flex relative inset-0 z-20">{children}</section>;
}
