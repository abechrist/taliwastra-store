import { getExpenses, getFinancialSummary, getProductHpps } from '@/lib/db/repositories/finances';
import FinanceManager from './FinanceManager';

export const revalidate = 0;

export default async function AdminFinancesPage() {
  let summary = {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMarginPercent: 0,
    breakdown: {
      rawMaterials: 0,
      operational: 0,
      labor: 0,
      marketing: 0,
      others: 0,
    },
  };
  let expenses: any[] = [];
  let hpps: any[] = [];

  try {
    const [summaryRes, expensesRes, hppsRes] = await Promise.all([
      getFinancialSummary(),
      getExpenses(),
      getProductHpps(),
    ]);
    summary = summaryRes;
    expenses = expensesRes;
    hpps = hppsRes;
  } catch (error) {
    console.error('AdminFinancesPage error:', error);
  }

  return <FinanceManager summary={summary} expenses={expenses} hpps={hpps} />;
}
