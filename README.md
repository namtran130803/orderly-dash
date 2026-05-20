# Orderly POS — Dashboard

Admin dashboard for coffee shop POS. React 19 + TypeScript 6 + Vite 8 + shadcn/ui.

## Yêu cầu

- **Docker**
- Backend API (`orderly-be`) đang chạy

## Development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up
# Mở http://localhost:5174 — sửa code tự reload
```

## Production

```bash
docker compose up -d --build
# Mở http://localhost:3001

# Hoặc build image riêng
docker build -t orderly-dash .
docker run -d -p 3001:80 orderly-dash
```

## Cấu hình

| Biến | Mặc định | Mô tả |
|---|---|---|
| `PORT` (dev) | `5174` | Cổng host dev (tránh冲突 với FE port 5173) |
| `PORT` (prod) | `3001` | Cổng host production |
| `VITE_API_URL` | `/api` | API base path (qua proxy) |

Nginx proxy sẵn `/api` → `http://backend:3000` (dùng chung BE với FE).

## Deploy FE + Dash + BE trên cùng VPS

Cả 3 project dùng chung network `orderly-network`.

```bash
# 1. BE
cd orderly-be && docker compose up -d --build

# 2. FE (cổng 80)
cd orderly-fe && docker compose up -d --build

# 3. Dash (cổng 3001)
cd orderly-dash && docker compose up -d --build
```
