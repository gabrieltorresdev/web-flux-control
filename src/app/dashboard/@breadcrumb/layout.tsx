export default function BreadcrumbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex items-center">{children}</div>;
}
