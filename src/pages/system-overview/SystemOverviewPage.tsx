import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Label,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Storefront,
  Users,
  Coins,
  Scroll,
  CheckCircle,
  Hourglass,
  XCircle,
  TrendUp,
  CircleNotch,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { systemService } from "@/services/system.service";

// Format currency
function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Shorten currency for chart axis labels
function formatShortVND(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return `${value}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: any) => string;
}

function CustomTooltip({ active, payload, label, valueFormatter }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border border-border shadow-lg px-3 py-2 rounded-lg backdrop-blur-md text-xs">
        {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
        {payload.map((item: any, index: number) => (
          <p key={index} className="font-medium" style={{ color: item.color || item.fill }}>
            {item.name}: <span className="font-bold">{valueFormatter ? valueFormatter(item.value) : item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function SystemOverviewPage() {
  const { data: res, isLoading, error } = useQuery({
    queryKey: ["system-overview"],
    queryFn: () => systemService.getOverview(),
  });

  const data = res?.data.data;

  // Status badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <CheckCircle weight="fill" className="w-3.5 h-3.5" />
            Đã thanh toán
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 w-fit">
            <Hourglass weight="fill" className="w-3.5 h-3.5" />
            Chờ xử lý
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 flex items-center gap-1 w-fit">
            <XCircle weight="fill" className="w-3.5 h-3.5" />
            Hết hạn
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-fit">
            <XCircle weight="fill" className="w-3.5 h-3.5" />
            Thất bại
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <CircleNotch className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        Không thể tải dữ liệu tổng quan hệ thống. Vui lòng thử lại sau.
      </div>
    );
  }

  // --- Chart configuration ---
  const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const totalPlanCount = data.planDistribution.reduce((a, c) => a + c.count, 0) || 0;

  return (
    <div className="space-y-8 w-full">

      {/* 4 Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-5 -mt-5 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tổng doanh thu thực tế
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Coins className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              {formatVND(data.summary.totalRevenue)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendUp className="w-3.5 h-3.5 text-emerald-500" />
              Tổng doanh thu từ các hóa đơn đã trả
            </p>
          </CardContent>
        </Card>

        {/* Cửa hàng */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-5 -mt-5 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Cửa hàng đăng ký
            </CardTitle>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Storefront className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-blue-600">
              {data.summary.totalStores}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Đang hoạt động/Thử nghiệm: <span className="font-semibold text-blue-600">{data.summary.activeStores}</span>
            </p>
          </CardContent>
        </Card>

        {/* Người dùng */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-5 -mt-5 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Người dùng hệ thống
            </CardTitle>
            <div className="p-2 bg-violet-500/10 text-violet-500 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-violet-600">
              {data.summary.totalUsers}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Bao gồm chủ cửa hàng và nhân viên
            </p>
          </CardContent>
        </Card>

        {/* Gói dịch vụ */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-5 -mt-5 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Số gói dịch vụ (Plans)
            </CardTitle>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Scroll className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {data.summary.totalPlans}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Gói đăng ký cấu hình trên hệ thống
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section with Recharts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Doanh thu 6 tháng qua — BAR CHART */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Coins className="text-primary w-4.5 h-4.5" />
              Doanh thu 6 tháng qua (VND)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.growth.length > 0 ? (
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.growth}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(228, 228, 231, 0.15)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatShortVND}
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(16, 185, 129, 0.05)", radius: 4 }}
                      content={<CustomTooltip valueFormatter={formatVND} />}
                    />
                    <Bar
                      name="Doanh thu"
                      dataKey="revenue"
                      fill="url(#colorRevenue)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cửa hàng mới 6 tháng qua — AREA CHART */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Storefront className="text-primary w-4.5 h-4.5" />
              Cửa hàng mới 6 tháng qua
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.growth.length > 0 ? (
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.growth}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorStores" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(228, 228, 231, 0.15)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={<CustomTooltip valueFormatter={(val) => `${val} cửa hàng`} />}
                    />
                    <Area
                      name="Cửa hàng mới"
                      type="monotone"
                      dataKey="newStores"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorStores)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan distribution & Info grids */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Plan Distribution — DONUT CHART */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Scroll className="text-primary w-4.5 h-4.5" />
              Tỷ lệ sử dụng gói cước
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.planDistribution.length > 0 ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.planDistribution}
                      dataKey="count"
                      nameKey="planName"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {data.planDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          const { cx, cy } = (viewBox as any) || {};
                          return (
                            <g>
                              <text
                                x={cx}
                                y={cy - 6}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="fill-foreground font-bold text-2xl"
                              >
                                {totalPlanCount}
                              </text>
                              <text
                                x={cx}
                                y={cy + 16}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="fill-muted-foreground text-xs font-normal"
                              >
                                lượt dùng
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip
                      content={
                        <CustomTooltip
                          valueFormatter={(val) =>
                            `${val} lượt (${Math.round((val / (totalPlanCount || 1)) * 100)}%)`
                          }
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-xs text-muted-foreground">
                Chưa phát sinh giao dịch
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Registered Stores list */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Storefront className="text-primary w-4.5 h-4.5" />
              Cửa hàng mới đăng ký gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] pl-6 text-xs">Tên cửa hàng</TableHead>
                  <TableHead className="text-xs">Chủ sở hữu</TableHead>
                  <TableHead className="text-xs">Số điện thoại</TableHead>
                  <TableHead className="text-right pr-6 text-xs">Ngày đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentStores.length > 0 ? (
                  data.recentStores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold pl-6 text-xs text-foreground">
                        {store.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{store.ownerName}</TableCell>
                      <TableCell className="text-xs font-mono">{store.ownerPhone}</TableCell>
                      <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                        {format(new Date(store.createdAt), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                      Không có dữ liệu cửa hàng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Scroll className="text-primary w-4.5 h-4.5" />
            Lịch sử giao dịch thanh toán gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[130px] text-xs">Mã hóa đơn</TableHead>
                <TableHead className="text-xs">Cửa hàng</TableHead>
                <TableHead className="text-xs">Người thanh toán</TableHead>
                <TableHead className="text-xs">Gói đăng ký</TableHead>
                <TableHead className="text-right text-xs">Số tiền</TableHead>
                <TableHead className="text-xs pl-8">Trạng thái</TableHead>
                <TableHead className="text-right pr-6 text-xs">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentPayments.length > 0 ? (
                data.recentPayments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs pl-6 text-foreground font-semibold">
                      {p.paymentCode}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.storeName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.userName}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {p.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-emerald-600">
                      {formatVND(p.amount)}
                    </TableCell>
                    <TableCell className="pl-8 text-xs">{renderStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-right pr-6 text-xs text-muted-foreground font-medium">
                      {format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                    Chưa phát sinh giao dịch nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
