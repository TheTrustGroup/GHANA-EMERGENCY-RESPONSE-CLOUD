# ✅ Sign-Up Fix - Terms & Conditions Issue

## 🐛 Problem
The "Create Account" button wasn't working. Users saw the error "You must accept the terms of service" even when the checkbox was checked.

## 🔍 Root Cause
1. The form validation required `termsAccepted: true`
2. The checkbox wasn't properly connected to react-hook-form state
3. The API wasn't receiving `termsAccepted` in the request

## ✅ Fixes Applied

### 1. Added `termsAccepted` to API Request
**File**: `src/app/auth/register/page.tsx`
- Added `termsAccepted: data.termsAccepted` to the API request body
- Now the form sends the terms acceptance status to the backend

### 2. Updated API Validation Schema
**File**: `src/app/api/auth/register/route.ts`
- Added `termsAccepted` field to the validation schema
- Made it optional for backward compatibility
- Validates that terms are accepted if provided

### 3. Fixed Checkbox with Controller
**File**: `src/app/auth/register/page.tsx`
- Changed from `{...register('termsAccepted')}` to `Controller` component
- Properly handles checkbox state changes
- Triggers validation immediately when checkbox is clicked
- Added click handler to Label for better UX

## 🧪 Testing

### Test Steps:
1. Go to `/auth/register`
2. Fill in Step 1 (Name, Phone, Email)
3. Fill in Step 2 (Password, Role)
4. On Step 3, check the "Terms of Service" checkbox
5. Click "Create Account"

### Expected Result:
- ✅ Checkbox properly updates form state
- ✅ No validation error when checkbox is checked
- ✅ Form submits successfully
- ✅ User is created in database

## 📝 Code Changes

### Frontend (`src/app/auth/register/page.tsx`):
```typescript
// Added Controller import
import { useForm, Controller } from 'react-hook-form';

// Added control to useForm
const { control, ... } = useForm<RegisterInput>({...});

// Updated checkbox to use Controller
<Controller
  name="termsAccepted"
  control={control}
  render={({ field }) => (
    <Checkbox
      checked={field.value}
      onCheckedChange={(checked) => {
        field.onChange(checked === true);
        trigger('termsAccepted');
      }}
    />
  )}
/>

// Added termsAccepted to API request
body: JSON.stringify({
  ...otherFields,
  termsAccepted: data.termsAccepted,
}),
```

### Backend (`src/app/api/auth/register/route.ts`):
```typescript
// Added termsAccepted to validation schema
const registerSchema = z.object({
  ...otherFields,
  termsAccepted: z.boolean()
    .refine((val) => val === true, {
      message: 'You must accept the terms of service',
    })
    .optional(),
});
```

## ✅ Status
- ✅ Build: Successful
- ✅ Linter: No errors
- ✅ Ready for testing

## 🚀 Next Steps
1. Test the sign-up flow end-to-end
2. Verify user creation in database
3. Test with different roles (Citizen, Responder)
