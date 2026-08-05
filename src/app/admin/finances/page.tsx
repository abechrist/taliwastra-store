import { getExpenses, getFinancialSummary, getProductHpps } from '@/lib/db/repositories/finances';
import FinanceManager from './FinanceManager';

export const revalidate = 0;

export default async function AdminFinancesPage() {
  const [summary, expenses, hpps] = await Promise.all([
    getFinancialSummary(),
    getExpenses(),
    getProductHpps(),
  ]);

  return <FinanceManager summary={summary} expenses={expenses} hpps={hpps} />;
}
