# 🔄 How to Restart the Development Server

## Quick Restart

### Method 1: Stop and Start (Recommended)

1. **Stop the server:**
   - Press `Ctrl + C` in the terminal where the server is running
   - Or close the terminal window

2. **Start the server:**
   ```bash
   npm run dev
   ```

### Method 2: Kill Process and Restart

If the server is running in the background:

1. **Find the process:**
   ```bash
   lsof -ti:3000
   ```
   Or:
   ```bash
   ps aux | grep "next dev"
   ```

2. **Kill the process:**
   ```bash
   kill -9 $(lsof -ti:3000)
   ```
   Or find the PID and kill it:
   ```bash
   kill -9 <PID>
   ```

3. **Start fresh:**
   ```bash
   npm run dev
   ```

---

## Full Restart (After Schema Changes)

If you made Prisma schema changes:

1. **Stop the server** (Ctrl + C)

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Push schema changes (if needed):**
   ```bash
   npx prisma db push
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

---

## Commands Reference

### Development Server
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Prisma Commands
```bash
npx prisma generate  # Regenerate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio (database GUI)
```

### Port Management
```bash
# Check what's using port 3000
lsof -ti:3000

# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Use different port
PORT=3001 npm run dev
```

---

## Troubleshooting

### Server Won't Start

1. **Check if port is in use:**
   ```bash
   lsof -ti:3000
   ```

2. **Kill process on port:**
   ```bash
   kill -9 $(lsof -ti:3000)
   ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Prisma Client Out of Sync

1. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

### Database Connection Issues

1. **Check database is running:**
   ```bash
   # For PostgreSQL
   pg_isready
   ```

2. **Test connection:**
   ```bash
   npx prisma db pull
   ```

---

## Quick Commands

### Restart Everything
```bash
# Stop server (Ctrl + C), then:
npx prisma generate && npm run dev
```

### Clean Restart
```bash
# Stop server, then:
rm -rf .next node_modules/.cache
npx prisma generate
npm run dev
```

---

## Current Status

After making Prisma schema changes (email optional), you need to:

1. ✅ **Stop server** (if running)
2. ✅ **Regenerate Prisma Client:** `npx prisma generate`
3. ✅ **Start server:** `npm run dev`

The server should now pick up the schema changes and allow optional email registration!
