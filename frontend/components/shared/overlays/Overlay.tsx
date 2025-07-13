import clsx from "clsx";

export default function Overlay({
  children,
  position = "relative",
}: {
  children: React.ReactNode;
  position?: "relative" | "fixed";
}) {
  return (
    <section
      className={clsx("flex inset-0 z-20", {
        relative: position === "relative",
        "fixed h-dvh w-dvw bg-overlay-bg": position === "fixed",
      })}
    >
      {children}
    </section>
  );
}
