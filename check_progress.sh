#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          📊 PROGRESS CHECK                                  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found"
    exit 1
fi

echo "✅ Phase 1: Preparation - COMPLETE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 API Keys Status:"
echo ""

# Check Mapbox
if grep -q "NEXT_PUBLIC_MAPBOX_TOKEN" .env.production && ! grep "NEXT_PUBLIC_MAPBOX_TOKEN" .env.production | grep -q "<"; then
    echo "   ✅ Mapbox Token - Filled"
else
    echo "   ⏳ Mapbox Token - Not filled"
fi

# Check Pusher
pusher_filled=true
for key in PUSHER_APP_ID NEXT_PUBLIC_PUSHER_KEY PUSHER_SECRET NEXT_PUBLIC_PUSHER_CLUSTER; do
    if grep -q "$key" .env.production && grep "$key" .env.production | grep -q "<"; then
        pusher_filled=false
        break
    fi
done
if [ "$pusher_filled" = true ]; then
    echo "   ✅ Pusher Credentials - Filled"
else
    echo "   ⏳ Pusher Credentials - Not filled"
fi

# Check AWS
aws_filled=true
for key in AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY; do
    if grep -q "$key" .env.production && grep "$key" .env.production | grep -q "<"; then
        aws_filled=false
        break
    fi
done
if [ "$aws_filled" = true ]; then
    echo "   ✅ AWS Credentials - Filled"
else
    echo "   ⏳ AWS Credentials - Not filled"
fi

# Check Email
if grep -q "SENDGRID_API_KEY" .env.production && ! grep "SENDGRID_API_KEY" .env.production | grep -q "<"; then
    echo "   ✅ Email Service (SendGrid) - Filled"
elif grep -q "AWS_SES_REGION" .env.production && ! grep "AWS_SES_REGION" .env.production | grep -q "<"; then
    echo "   ✅ Email Service (AWS SES) - Filled"
else
    echo "   ⏳ Email Service - Not filled"
fi

# Check SMS
if grep -q "AFRICASTALKING_API_KEY" .env.production && ! grep "AFRICASTALKING_API_KEY" .env.production | grep -q "<"; then
    echo "   ✅ SMS Service (Africa's Talking) - Filled"
elif grep -q "TWILIO_ACCOUNT_SID" .env.production && ! grep "TWILIO_ACCOUNT_SID" .env.production | grep -q "<"; then
    echo "   ✅ SMS Service (Twilio) - Filled"
else
    echo "   ⏳ SMS Service - Not filled"
fi

# Check Sentry
if grep -q "SENTRY_DSN" .env.production && ! grep "SENTRY_DSN" .env.production | grep -q "<"; then
    echo "   ✅ Sentry DSN - Filled (Optional)"
else
    echo "   ⏭️  Sentry DSN - Not filled (Optional)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count filled vs placeholders
filled=$(grep -E "^[A-Z_]+=" .env.production 2>/dev/null | grep -v "<" | grep -v "^#" | wc -l | xargs)
placeholders=$(grep -E "^[A-Z_]+=" .env.production 2>/dev/null | grep "<" | wc -l | xargs)

echo "📊 Statistics:"
echo "   ✅ Filled variables: $filled"
echo "   ⏳ Placeholder variables: $placeholders"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 What's Left:"
echo ""
echo "   1. Complete API keys setup"
echo "   2. Verify all keys are filled"
echo "   3. Proceed to Phase 2: Infrastructure Setup"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
