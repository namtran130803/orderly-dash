import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartBarIcon, ShoppingCartIcon, CurrencyDollarIcon, TrendDownIcon } from "@phosphor-icons/react";
import { dashboardService } from "@/services/dashboard.service";
import { useStoreContext } from "@/stores/storeContext.store";

export function DashboardStatsPage() {
  const selectedStoreId = useStoreContext((s) => s.selectedStoreId);
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(lastDay);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedStoreId, from, to],
    queryFn: () => dashboardService.getStats(selectedStoreId!, from, to),
    enabled: !!selectedStoreId,
  });

  const stats = statsData?.data?.data;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (!selectedStoreId) {
    return <div className="text-center text-muted-foreground py-8">Vui lòng chọn cửa hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span className="text-muted-foreground">đến</span>
        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Đang tải thống kê...</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                <CurrencyDollarIcon size={20} className="text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.revenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Chi phí</CardTitle>
                <TrendDownIcon size={20} className="text-red-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatPrice(stats.expense)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Số đơn hàng</CardTitle>
                <ShoppingCartIcon size={20} className="text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{stats.orderCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Lợi nhuận</CardTitle>
                <ChartBarIcon size={20} className="text-emerald-600" />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${(stats.revenue - stats.expense) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatPrice(stats.revenue - stats.expense)}
                </p>
              </CardContent>
            </Card>
          </div>

          {stats.topItems && stats.topItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top món bán chạy</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Tên món</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{item.qty}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground py-8">Không có dữ liệu thống kê.</div>
      )}
    </div>
  );
}
