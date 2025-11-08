// app/showcase/layout.tsx;

import { Navbar } from "../(browse)/_components/navbar";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}