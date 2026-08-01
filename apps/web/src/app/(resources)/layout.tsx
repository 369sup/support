export default function ResourcesLayout({
  children,
  header,
  navigation,
  sidebar,
  modal,
}: Readonly<{
  children: React.ReactNode;
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <>
      {header}
      {navigation}
      {sidebar}
      {children}
      {modal}
    </>
  );
}
