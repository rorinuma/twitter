export default function AuthLayout({
  children,
  authModals,
}: {
  children: React.ReactNode;
  authModals: React.ReactNode;
}) {
  return (
    <>
      {children}
      {authModals}
    </>
  );
}
