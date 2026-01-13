# 🔐 Test Credentials - Ghana Emergency Response Platform

**All test accounts are created by running:** `npm run db:seed`

---

## 🎯 Quick Test Accounts (Simple)

These accounts use the password: **`Test1234`**

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Citizen** | `citizen@test.com` | `Test1234` | `/dashboard/citizen` |
| **Dispatcher** | `dispatcher@test.com` | `Test1234` | `/dashboard/dispatch` |
| **Responder** | `responder@test.com` | `Test1234` | `/dashboard/responder` |
| **Agency Admin** | `agency@test.com` | `Test1234` | `/dashboard/agency` |
| **System Admin** | `admin@test.com` | `Test1234` | `/dashboard/admin` |

**Note:** These are created by `scripts/create-test-users.ts` and require agencies to exist first.

---

## 🏛️ Full Production Test Accounts

These accounts are created by the main seed script with realistic data.

### System Administrator

**Full Access - Can manage everything**

| Field | Value |
|-------|-------|
| **Email** | `admin@emergency.gov.gh` |
| **Phone** | `+233244000001` |
| **Password** | `Admin@123` |
| **Name** | System Administrator |
| **Role** | SYSTEM_ADMIN |
| **Dashboard** | `/dashboard/admin` |

**Capabilities:**
- ✅ Manage all users
- ✅ Create/edit agencies
- ✅ View all incidents
- ✅ System-wide analytics
- ✅ Audit logs
- ✅ Export all data

---

### Agency Administrators

**Manage their agency's operations**

#### NADMO Administrator
| Field | Value |
|-------|-------|
| **Email** | `nadmo.admin@emergency.gov.gh` |
| **Phone** | `+233244000002` |
| **Password** | `Admin@123` |
| **Agency** | NADMO Headquarters |
| **Role** | AGENCY_ADMIN |
| **Dashboard** | `/dashboard/agency` |

#### Fire Service Administrator
| Field | Value |
|-------|-------|
| **Email** | `fire.admin@emergency.gov.gh` |
| **Phone** | `+233244000003` |
| **Password** | `Admin@123` |
| **Agency** | Ghana National Fire Service - Tema |
| **Role** | AGENCY_ADMIN |
| **Dashboard** | `/dashboard/agency` |

#### Police Administrator
| Field | Value |
|-------|-------|
| **Email** | `police.admin@emergency.gov.gh` |
| **Phone** | `+233244000004` |
| **Password** | `Admin@123` |
| **Agency** | Ghana Police Service - Kumasi |
| **Role** | AGENCY_ADMIN |
| **Dashboard** | `/dashboard/agency` |

---

### Dispatchers

**Coordinate emergency response and assign resources**

#### Dispatcher 1
| Field | Value |
|-------|-------|
| **Email** | `dispatcher1@emergency.gov.gh` |
| **Phone** | `+233244000010` |
| **Password** | `Dispatcher@123` |
| **Name** | John Dispatcher |
| **Role** | DISPATCHER |
| **Agency** | NADMO Headquarters |
| **Dashboard** | `/dashboard/dispatch` |

#### Dispatcher 2
| Field | Value |
|-------|-------|
| **Email** | `dispatcher2@emergency.gov.gh` |
| **Phone** | `+233244000011` |
| **Password** | `Dispatcher@123` |
| **Name** | Mary Dispatcher |
| **Role** | DISPATCHER |
| **Agency** | Ghana National Fire Service - Tema |
| **Dashboard** | `/dashboard/dispatch` |

**Capabilities:**
- ✅ View all incidents
- ✅ Assign incidents to agencies
- ✅ Assign specific responders
- ✅ Update incident status
- ✅ View live map

---

### Responders

**First responders who handle emergency assignments**

#### NADMO Responders

**Responder 1 (NADMO)**
| Field | Value |
|-------|-------|
| **Email** | `responder1@nadmo.gov.gh` |
| **Phone** | `+233244000101` |
| **Password** | `Responder@123` |
| **Name** | Kwame Asante |
| **Role** | RESPONDER |
| **Agency** | NADMO Headquarters |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

**Responder 2 (NADMO)**
| Field | Value |
|-------|-------|
| **Email** | `responder2@nadmo.gov.gh` |
| **Phone** | `+233244000102` |
| **Password** | `Responder@123` |
| **Name** | Ama Mensah |
| **Role** | RESPONDER |
| **Agency** | NADMO Headquarters |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

#### Fire Service Responders

**Responder 3 (Fire Service)**
| Field | Value |
|-------|-------|
| **Email** | `responder3@fire.gov.gh` |
| **Phone** | `+233244000201` |
| **Password** | `Responder@123` |
| **Name** | Kofi Firefighter |
| **Role** | RESPONDER |
| **Agency** | Ghana National Fire Service - Tema |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

**Responder 4 (Fire Service)**
| Field | Value |
|-------|-------|
| **Email** | `responder4@fire.gov.gh` |
| **Phone** | `+233244000202` |
| **Password** | `Responder@123` |
| **Name** | Akosua Firefighter |
| **Role** | RESPONDER |
| **Agency** | Ghana National Fire Service - Tema |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

#### Police Responders

**Responder 5 (Police)**
| Field | Value |
|-------|-------|
| **Email** | `responder5@police.gov.gh` |
| **Phone** | `+233244000301` |
| **Password** | `Responder@123` |
| **Name** | Yaw Policeman |
| **Role** | RESPONDER |
| **Agency** | Ghana Police Service - Kumasi |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

**Responder 6 (Police)**
| Field | Value |
|-------|-------|
| **Email** | `responder6@police.gov.gh` |
| **Phone** | `+233244000302` |
| **Password** | `Responder@123` |
| **Name** | Efua Policewoman |
| **Role** | RESPONDER |
| **Agency** | Ghana Police Service - Kumasi |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

#### Ambulance Responders

**Responder 7 (Ambulance)**
| Field | Value |
|-------|-------|
| **Email** | `responder7@ambulance.gov.gh` |
| **Phone** | `+233244000401` |
| **Password** | `Responder@123` |
| **Name** | Kojo Paramedic |
| **Role** | RESPONDER |
| **Agency** | National Ambulance Service - Takoradi |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

**Responder 8 (Ambulance)**
| Field | Value |
|-------|-------|
| **Email** | `responder8@ambulance.gov.gh` |
| **Phone** | `+233244000402` |
| **Password** | `Responder@123` |
| **Name** | Adwoa Paramedic |
| **Role** | RESPONDER |
| **Agency** | National Ambulance Service - Takoradi |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

#### Private Responders

**Responder 9 (Private)**
| Field | Value |
|-------|-------|
| **Email** | `responder9@secureguard.gh` |
| **Phone** | `+233244000501` |
| **Password** | `Responder@123` |
| **Name** | Nana Security |
| **Role** | RESPONDER |
| **Agency** | SecureGuard Emergency Services |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

**Responder 10 (Private)**
| Field | Value |
|-------|-------|
| **Email** | `responder10@secureguard.gh` |
| **Phone** | `+233244000502` |
| **Password** | `Responder@123` |
| **Name** | Maame Security |
| **Role** | RESPONDER |
| **Agency** | SecureGuard Emergency Services |
| **Status** | AVAILABLE |
| **Dashboard** | `/dashboard/responder` |

---

### Citizens

**Regular users who can report emergencies**

#### Citizen 1
| Field | Value |
|-------|-------|
| **Email** | `citizen1@example.com` |
| **Phone** | `+233245000001` |
| **Password** | `Citizen@123` |
| **Name** | Kwabena Osei |
| **Role** | CITIZEN |
| **Dashboard** | `/dashboard/citizen` |

#### Citizen 2
| Field | Value |
|-------|-------|
| **Email** | `citizen2@example.com` |
| **Phone** | `+233245000002` |
| **Password** | `Citizen@123` |
| **Name** | Ama Darko |
| **Role** | CITIZEN |
| **Dashboard** | `/dashboard/citizen` |

#### Citizen 3
| Field | Value |
|-------|-------|
| **Email** | `citizen3@example.com` |
| **Phone** | `+233245000003` |
| **Password** | `Citizen@123` |
| **Name** | Kofi Appiah |
| **Role** | CITIZEN |
| **Dashboard** | `/dashboard/citizen` |

#### Citizen 4
| Field | Value |
|-------|-------|
| **Email** | `citizen4@example.com` |
| **Phone** | `+233245000004` |
| **Password** | `Citizen@123` |
| **Name** | Efua Boateng |
| **Role** | CITIZEN |
| **Dashboard** | `/dashboard/citizen` |

#### Citizen 5
| Field | Value |
|-------|-------|
| **Email** | `citizen5@example.com` |
| **Phone** | `+233245000005` |
| **Password** | `Citizen@123` |
| **Name** | Yaw Mensah |
| **Role** | CITIZEN |
| **Dashboard** | `/dashboard/citizen` |

---

## 🏢 Agencies Created

The seed script creates 5 agencies:

1. **NADMO Headquarters**
   - Type: NADMO
   - Location: Accra (5.6037, -0.187)
   - Region: Greater Accra

2. **Ghana National Fire Service - Tema**
   - Type: FIRE_SERVICE
   - Location: Tema (5.6833, -0.0167)
   - Region: Greater Accra

3. **Ghana Police Service - Kumasi**
   - Type: POLICE
   - Location: Kumasi (6.6885, -1.6244)
   - Region: Ashanti

4. **National Ambulance Service - Takoradi**
   - Type: AMBULANCE
   - Location: Takoradi (4.8845, -1.7554)
   - Region: Western

5. **SecureGuard Emergency Services**
   - Type: PRIVATE_RESPONDER
   - Location: Accra (East Legon)
   - Region: Greater Accra

---

## 📊 Summary

After running `npm run db:seed`, you'll have:

- **5 Agencies** (NADMO, Fire, Police, Ambulance, Private)
- **1 System Admin**
- **3 Agency Admins**
- **2 Dispatchers**
- **10 Responders** (2 per agency)
- **5 Citizens**
- **Total: 21 Users**

---

## 🚀 How to Use

### Step 1: Run Seed Script

```bash
npm run db:seed
```

This will:
- Clear existing data
- Create all agencies
- Create all test users
- Display summary

### Step 2: Test Login

1. Go to: https://ghana-emergency-response.vercel.app/auth/signin
2. Use any of the credentials above
3. Access role-specific dashboard

### Step 3: Test Workflow

1. **As Citizen:** Report an emergency at `/report`
2. **As Dispatcher:** View incident at `/dashboard/dispatch` and assign
3. **As Responder:** Accept assignment at `/dashboard/responder` and update status

---

## 🔒 Security Note

**⚠️ These are TEST credentials only!**

- Change all passwords in production
- Use strong, unique passwords
- Enable 2FA for production accounts
- Rotate credentials regularly

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ SYSTEM ADMIN                                            │
│ Email: admin@emergency.gov.gh                          │
│ Password: Admin@123                                    │
├─────────────────────────────────────────────────────────┤
│ DISPATCHER                                              │
│ Email: dispatcher1@emergency.gov.gh                    │
│ Password: Dispatcher@123                              │
├─────────────────────────────────────────────────────────┤
│ RESPONDER (Fire Service)                                │
│ Email: responder3@fire.gov.gh                          │
│ Password: Responder@123                                 │
├─────────────────────────────────────────────────────────┤
│ CITIZEN                                                 │
│ Email: citizen1@example.com                            │
│ Password: Citizen@123                                   │
└─────────────────────────────────────────────────────────┘
```

---

**Ready to test?** Run `npm run db:seed` and start testing! 🚀
