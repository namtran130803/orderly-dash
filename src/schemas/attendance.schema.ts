import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const attendanceRecordSchema = z.object({
  employeeId: z.number({ message: "Chọn nhân viên" }).int().positive("Chọn nhân viên"),
  date: z.string().min(1, "Chọn ngày"),
  status: z.enum(["WORK", "PAID_LEAVE", "UNPAID_LEAVE"], { message: "Chọn trạng thái" }),
  checkIn: z.string().optional().or(z.literal("")),
  checkOut: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.status === "WORK" && !data.checkIn?.trim()) {
    ctx.addIssue({ code: "custom", message: "Giờ vào là bắt buộc khi trạng thái là Làm việc", path: ["checkIn"] });
  }
});

export const attendanceRecordResolver = zodResolver(attendanceRecordSchema);

export type AttendanceRecordDto = z.infer<typeof attendanceRecordSchema>;
