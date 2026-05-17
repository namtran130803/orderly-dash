import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Order } from "@/schemas/order.schema";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return "---";
    }
  };

  const getTotal = () => {
    return order.items.reduce((sum, item) => sum + item.priceSnapshot * item.qty, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
          <DialogDescription>
            {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Bàn:</span>
              <p className="font-medium">{order.tableSnapshot || "Mang đi"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Trạng thái:</span>
              <p><Badge variant="outline">{order.statusSnapshot || "Chưa có"}</Badge></p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Danh sách món</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên món</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nameSnapshot}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatPrice(item.priceSnapshot)}</TableCell>
                    <TableCell>
                      {item.statusSnapshot ? (
                        <Badge variant="outline">{item.statusSnapshot}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatPrice(item.priceSnapshot * item.qty)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Tổng cộng</span>
            <span className="font-mono font-bold text-lg">{formatPrice(getTotal())}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
