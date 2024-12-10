import { Transaction, TransactionInput } from "../types/transaction";
import { v4 as uuidv4 } from "uuid";

export class TransactionService {
  private storageKey = "@finances:transactions";

  /**
   * Integration with external API:
   * Replace localStorage with API calls using fetch or axios:
   *
   * GET /api/transactions
   * Parameters:
   * - page: number
   * - limit: number
   * - search: string
   * - category: string
   * - type: "income" | "expense"
   * - fromDate: string (YYYY-MM-DD)
   * - toDate: string (YYYY-MM-DD)
   */
  async getAll(): Promise<Transaction[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  /**
   * Integration with external API:
   * POST /api/transactions
   * Body: TransactionInput
   * Returns: Transaction
   */
  async create(transaction: TransactionInput): Promise<Transaction> {
    const transactions = await this.getAll();
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      lastModified: new Date(),
    };

    await this.setStorageData([newTransaction, ...transactions]);
    return newTransaction;
  }

  /**
   * Integration with external API:
   * PUT /api/transactions/:id
   * Body: TransactionInput
   * Returns: Transaction
   */
  async update(id: string, data: TransactionInput): Promise<Transaction> {
    const transactions = await this.getAll();
    const transaction = transactions.find((t) => t.id === id);

    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    const updatedTransaction: Transaction = {
      ...data,
      id,
      lastModified: new Date(),
    };

    const updatedTransactions = transactions.map((t) =>
      t.id === id ? updatedTransaction : t
    );

    await this.setStorageData(updatedTransactions);
    return updatedTransaction;
  }

  /**
   * Integration with external API:
   * DELETE /api/transactions/:id
   */
  async delete(id: string): Promise<void> {
    const transactions = await this.getAll();
    const transaction = transactions.find((t) => t.id === id);

    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    const filteredTransactions = transactions.filter((t) => t.id !== id);
    await this.setStorageData(filteredTransactions);
  }

  private async setStorageData(data: Transaction[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      throw new Error("Failed to save transaction");
    }
  }
}
