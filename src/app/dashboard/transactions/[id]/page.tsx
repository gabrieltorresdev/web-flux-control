export default async function Transactions() {
  const transaction = await Promise.resolve({
    id: "transaction1",
    category: "Saúde",
    amount: "2328.33",
    type: "expense",
    date: "2024-11-23",
    description: "Here's a cool description",
  });
  return <div>{transaction.id}</div>;
}
