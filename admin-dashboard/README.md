# StreamFlix — alohida admin panel

Next.js asosiy saytdan ajratilgan **Vite + React** ilovasi: tez yuklanadi, faqat administratorlar uchun.

## Ishga tushirish

1. Backend ishlayotgan bo‘lsin: `server` da `npm run dev` (port **5000**).
2. `admin-dashboard` papkasida:
   ```bash
   copy .env.example .env
   npm install
   npm run dev
   ```
3. Brauzer: **http://localhost:5173** — login (admin / parol server `.env` dagi kabi).

## Muhit o‘zgaruvchilari

| O‘zgaruvchi | Tavsif |
|-------------|--------|
| `VITE_API_URL` | API manzili, masalan `http://localhost:5000/api` |
| `VITE_PUBLIC_SITE_URL` | Asosiy sayt (kinolar havolalari uchun) |

## Server (Express)

`server/.env` ga qo‘shing (CORS uchun):

```
ADMIN_CLIENT_URL=http://localhost:5173
```

Asosiy sayt: `CLIENT_URL=http://localhost:3000` saqlanadi.

## Asosiy Next.js sayt

`/admin` ni to‘g‘ridan-to‘g‘ri Vite panelga yo‘naltirish uchun `client/.env.local`:

```
NEXT_PUBLIC_ADMIN_URL=http://localhost:5173
```

## Reklama statistikasi

Frontendda banner yoki slot uchun:

```http
POST /api/analytics/ad
Content-Type: application/json

{ "type": "impression" }
```

```http
{ "type": "click" }
```

Hisobotlar **Analitika** sahifasida va **Statistika** kartalarida ko‘rinadi.
