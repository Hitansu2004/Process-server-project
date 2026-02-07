# GitHub Actions CI/CD Workflows

This directory contains automated deployment workflows for the Process Server project.

## 🚀 Workflows Overview

### 1. **Build Validation** (`build-check.yml`)
- **Triggers:** Pull requests and pushes to `main` or `dev` branches
- **Purpose:** Validates that all Java and Next.js services build successfully
- **Use Case:** Catch build errors before merging code

### 2. **Staging Deployment** (`deploy-staging.yml`)
- **Triggers:** Push to `dev` branch or manual trigger
- **Purpose:** Automatically deploy to staging environment for testing
- **Use Case:** Test changes before production

### 3. **Production Deployment** (`deploy-production.yml`)
- **Triggers:** Manual trigger only
- **Purpose:** Deploy to production with manual approval
- **Protection:** Requires environment approval before deployment
- **Use Case:** Controlled production releases

---

## 🔐 Required GitHub Secrets

Configure these secrets in your repository: **Settings → Secrets and variables → Actions**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_SSH_KEY` | Private SSH key for VPS access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `VPS_HOST` | VPS server IP address | `51.222.26.163` |
| `VPS_USER` | SSH username | `ubuntu` |
| `VPS_PORT` | SSH port | `22` |

### How to Generate SSH Key

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions@processserver" -f ~/.ssh/github_actions_key

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github_actions_key.pub ubuntu@51.222.26.163

# Copy private key content for GitHub secret
cat ~/.ssh/github_actions_key
# Copy the entire output including BEGIN and END lines
```

### Adding Secrets to GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `VPS_SSH_KEY`, Value: (paste private key)
   - Name: `VPS_HOST`, Value: `51.222.26.163`
   - Name: `VPS_USER`, Value: `ubuntu`
   - Name: `VPS_PORT`, Value: `22`

---

## 🛡️ Setting Up Production Environment Protection

To enable manual approval for production deployments:

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it: `production`
4. Enable **Required reviewers**
5. Add yourself as a reviewer
6. Click **Save protection rules**

Now all production deployments will wait for your approval!

---

## 📋 How to Use

### Automatic Build Validation
- Happens automatically on every PR and push
- View logs: **Actions** tab → **Build Validation**

### Deploy to Staging
**Option 1: Automatic (push to dev)**
```bash
git checkout dev
git add .
git commit -m "Your changes"
git push origin dev
```

**Option 2: Manual Trigger**
1. Go to **Actions** tab
2. Click **Deploy to Staging**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Deploy to Production

1. Go to **Actions** tab
2. Click **Deploy to Production**
3. Click **Run workflow**
4. Select services to deploy (or `all`)
5. Click **Run workflow**
6. **WAIT for approval notification**
7. Review the deployment plan
8. Click **Review deployments** → **Approve** (or Reject)

---

## 📊 Viewing Logs

### Live Build Logs
1. Go to **Actions** tab
2. Click on any running workflow
3. Click on the job name (e.g., "deploy-production")
4. Watch logs update in real-time

### Finding Deployment Logs
- All workflow runs are listed in the **Actions** tab
- Green checkmark = Success ✅
- Red X = Failed ❌
- Yellow circle = In progress 🟡
- Grey clock = Waiting for approval ⏸️

---

## 🔧 Customizing Deployments

### Deploy Specific Services

When triggering production deployment, you can specify services:

- **All services:** `all`
- **Single service:** `order-service`
- **Multiple services:** `order-service,customer-portal,admin-panel`

### Available Services

**Backend (Java):**
- `discovery-server`
- `api-gateway`
- `auth-service`
- `user-service`
- `tenant-service`
- `order-service`
- `notification-service`

**Frontend (Next.js):**
- `home-page`
- `customer-portal`
- `process-server-portal`
- `admin-panel`
- `super-admin`

---

## 🚨 Troubleshooting

### Build Failures
- Check **Build Validation** logs for specific error messages
- Common issues: Maven dependency errors, npm install failures
- Fix locally and push again

### Deployment Failures
- Check workflow logs for SSH connection issues
- Verify GitHub Secrets are set correctly
- Ensure VPS is accessible via SSH
- Check VPS disk space and memory

### SSH Connection Issues
```bash
# Test SSH connection locally
ssh -i ~/.ssh/github_actions_key ubuntu@51.222.26.163

# If it works locally, check GitHub secrets
```

### Approval Not Showing
- Ensure you've created the `production` environment
- Verify you're added as a required reviewer
- Check the **Environments** section in Settings

---

## 🎯 Best Practices

1. **Always test on staging first**
   - Push to `dev` branch
   - Verify changes work
   - Then deploy to production

2. **Use descriptive commit messages**
   - Helps track what was deployed when
   - Shows in deployment logs

3. **Deploy during low-traffic periods**
   - Minimize user impact
   - Easier to monitor and rollback if needed

4. **Review deployment logs**
   - Even for successful deployments
   - Catch warnings early

5. **Keep secrets secure**
   - Never commit private keys to repository
   - Rotate SSH keys periodically

---

## 📞 Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Review this README for troubleshooting steps
3. Test SSH access manually from your machine
4. Verify all secrets are configured correctly

---

## 🎉 Success!

Your CI/CD pipeline is now configured! Every push to GitHub can now automatically update your live server with proper safety controls in place.

**Happy deploying! 🚀**
