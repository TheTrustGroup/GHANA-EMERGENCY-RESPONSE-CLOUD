# Manual Deployment Guide

## Automatic Deployments Disabled ✅

Automatic deployments from Git have been **disabled**. All deployments must now be authorized manually.

## Configuration

The `vercel.json` file has been updated with:
```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

This prevents Vercel from automatically deploying when you push to GitHub.

## Manual Deployment Commands

### Production Deployment
```bash
vercel --prod
```

### Preview Deployment
```bash
vercel
```

### Deploy with Confirmation
```bash
vercel --prod --yes  # Skip confirmation prompts
```

## Additional Protection (Optional)

For extra protection, you can also disable builds in the Vercel Dashboard:

1. Go to: https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response
2. Navigate to: **Settings** → **Git**
3. Find: **Ignored Build Step**
4. Set to: `Don't build anything`

This ensures that even if a commit is pushed, Vercel will not initiate a build process.

## Workflow

1. **Make changes** → Commit and push to GitHub
2. **Review changes** → Test locally if needed
3. **Deploy manually** → Run `vercel --prod` when ready
4. **Monitor deployment** → Check Vercel dashboard for status

## Benefits

- ✅ Full control over when deployments happen
- ✅ No accidental deployments from git pushes
- ✅ Time to review changes before deploying
- ✅ Ability to test locally before production

## Re-enabling Automatic Deployments

If you want to re-enable automatic deployments in the future:

1. Remove or set `"deploymentEnabled": true` in `vercel.json`
2. Or remove the `git` section entirely
3. Commit and push the changes
