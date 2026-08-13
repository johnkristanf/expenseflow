import { getAvailableYears } from '@/lib/services/dashboard-service';
import { getMonthlyIncome, getIncomePerSource } from '@/lib/services/income-service';
import { getMonthlyExpenses, getExpensesPerCategory } from '@/lib/services/expenses-service';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { CategoryExpenseChart } from '@/components/dashboard/category-expense-chart';
import { IncomeSourceChart } from '@/components/dashboard/income-source-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowDown, ArrowUp, Tag } from 'lucide-react';

export default async function DashboardPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const month = typeof searchParams?.month === 'string' ? searchParams.month : 'all';
  const year = typeof searchParams?.year === 'string' ? searchParams.year : 'all';

  const [availableYears, incomeData, expenseData, categoryData, incomeSourceData] = await Promise.all([
    getAvailableYears(),
    getMonthlyIncome(month, year),
    getMonthlyExpenses(month, year),
    getExpensesPerCategory(month, year),
    getIncomePerSource(month, year),
  ]);

  const totalIncome = Number(incomeData.total);
  const totalExpense = Number(expenseData.total);
  const netBalance = totalIncome - totalExpense;

  // Find top category
  let topCategory = 'None';
  if (categoryData.length > 0) {
    const sorted = [...categoryData].sort((a, b) => Number(b.amount) - Number(a.amount));
    topCategory = sorted[0].category;
  }

  // Parse amount strings to numbers for charts
  const parsedCategoryData = categoryData.map((d) => ({
    category: d.category,
    amount: Number(d.amount),
  }));

  const parsedIncomeSourceData = incomeSourceData.map((d) => ({
    source: d.source,
    amount: Number(d.amount),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex justify-end">
        <DashboardFilters availableYears={availableYears} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              ${totalExpense.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${netBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {topCategory}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Expenses per Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryExpenseChart data={parsedCategoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeSourceChart data={parsedIncomeSourceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
