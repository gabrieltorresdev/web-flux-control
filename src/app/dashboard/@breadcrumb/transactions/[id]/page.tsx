import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default async function BreadcrumbSlot() {
  const transaction = await Promise.resolve({
    id: "transaction1",
    category: "Saúde",
    amount: "2328.33",
    type: "expense",
    date: "2024-11-23",
    description: "Here's a cool description",
  });
  return (
    <BreadcrumbList>
      {" "}
      <BreadcrumbItem>
        <BreadcrumbPage className="capitalize">{transaction.id}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}
