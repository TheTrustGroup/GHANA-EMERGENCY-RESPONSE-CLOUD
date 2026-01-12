# API Keys Checklist

Use this checklist to track your progress in obtaining API keys.

---

## ✅ Required API Keys

### 1. Mapbox Token
- [ ] Account created at https://account.mapbox.com/
- [ ] Access token generated
- [ ] Token added to `.env.production` as `NEXT_PUBLIC_MAPBOX_TOKEN`
- [ ] Token verified (starts with `pk.`)

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**Token:** `_________________________________`

---

### 2. Pusher Credentials
- [ ] Account created at https://dashboard.pusher.com/
- [ ] App created
- [ ] App ID obtained
- [ ] Key obtained
- [ ] Secret obtained
- [ ] Cluster selected
- [ ] All values added to `.env.production`

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**App ID:** `_________________________________`
**Key:** `_________________________________`
**Secret:** `_________________________________`
**Cluster:** `_________________________________`

---

### 3. AWS Credentials (S3)
- [ ] AWS account created at https://aws.amazon.com/
- [ ] IAM user created
- [ ] Access Key ID obtained
- [ ] Secret Access Key obtained
- [ ] S3 bucket created
- [ ] Region selected
- [ ] All values added to `.env.production`

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**Access Key ID:** `_________________________________`
**Secret Access Key:** `_________________________________`
**Region:** `_________________________________`
**Bucket Name:** `_________________________________`

---

### 4. Email Service

#### Option A: AWS SES
- [ ] AWS SES accessed
- [ ] Email/domain verified
- [ ] Production access requested (if needed)
- [ ] Region selected
- [ ] Values added to `.env.production`

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**Region:** `_________________________________`
**From Email:** `_________________________________`

#### Option B: SendGrid
- [ ] Account created at https://sendgrid.com/
- [ ] Sender verified
- [ ] API key created
- [ ] API key added to `.env.production` as `SENDGRID_API_KEY`
- [ ] From email set

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**API Key:** `_________________________________`
**From Email:** `_________________________________`

**Chosen Option:** [ ] AWS SES / [ ] SendGrid

---

### 5. SMS Service

#### Option A: Africa's Talking
- [ ] Account created at https://account.africastalking.com/
- [ ] App created
- [ ] API key obtained
- [ ] Username obtained
- [ ] Values added to `.env.production`

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**API Key:** `_________________________________`
**Username:** `_________________________________`

#### Option B: Twilio
- [ ] Account created at https://www.twilio.com/
- [ ] Account SID obtained
- [ ] Auth token obtained
- [ ] Phone number purchased
- [ ] Values added to `.env.production`

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

**Account SID:** `_________________________________`
**Auth Token:** `_________________________________`
**Phone Number:** `_________________________________`

**Chosen Option:** [ ] Africa's Talking / [ ] Twilio

---

## 🔍 Optional API Keys

### 6. Sentry (Error Tracking)
- [ ] Account created at https://sentry.io/
- [ ] Project created (Next.js)
- [ ] DSN obtained
- [ ] DSN added to `.env.production` as `SENTRY_DSN`

**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete / ⏭️ Skipped

**DSN:** `_________________________________`

---

## 📋 Final Verification

Before proceeding to Phase 2, verify:

- [ ] All required API keys obtained
- [ ] All values added to `.env.production`
- [ ] No placeholder values (`<...>`) remaining in `.env.production`
- [ ] All credentials tested (if possible)
- [ ] `.env.production` saved
- [ ] `.env.production` NOT committed to git

---

## 📝 Notes

Use this section to track any issues or important information:

```
Date: ___________
Notes: ___________
_________________________________
_________________________________
```

---

## 🎯 Progress Summary

**Required Keys:** ___ / 5 complete
**Optional Keys:** ___ / 1 complete

**Overall Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

---

**Last Updated:** ___________

