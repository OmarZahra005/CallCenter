# Environment Configuration Guide

## Overview

The Call Center application uses environment-specific configuration files to manage different deployment environments (development, production, etc.).

---

## Environment Files

### 📄 File Structure

```
CallCenterFrontEnd/
├── .env.development       # Development environment (committed to git)
├── .env.production        # Production environment (committed to git)
├── .env.example           # Example template (committed to git)
├── .env.local             # Local overrides (gitignored)
└── .gitignore             # Excludes .env.local and .env.*.local
```

### 🔒 Git Tracking

| File | Tracked in Git | Purpose |
|------|----------------|---------|
| `.env.development` | ✅ Yes | Shared dev configuration |
| `.env.production` | ✅ Yes | Shared prod configuration |
| `.env.example` | ✅ Yes | Documentation template |
| `.env.local` | ❌ No | Personal overrides (gitignored) |
| `.env.*.local` | ❌ No | Environment-specific overrides (gitignored) |

---

## Environment Variables

### VITE_API_BASE_URL

**Description**: The base URL of the backend API server.

**Required**: Yes - Application will throw an error if not defined.

**Format**: Full URL including protocol (http:// or https://)

**Examples**:
```bash
# Development (HTTPS)
VITE_API_BASE_URL=https://localhost:7190

# Development (HTTP fallback)
VITE_API_BASE_URL=http://localhost:5045

# Production
VITE_API_BASE_URL=https://api.callcenter.com
```

---

## Backend URL Configuration

### Development Environment

The ASP.NET Core backend is configured to run on two URLs simultaneously:

| Protocol | URL | Port | Configured In |
|----------|-----|------|---------------|
| HTTPS | `https://localhost:7190` | 7190 | launchSettings.json |
| HTTP | `http://localhost:5045` | 5045 | launchSettings.json |

**Recommended**: Use HTTPS URL (`https://localhost:7190`) in development.

**Backend Configuration**: `CallCenter.API/Properties/launchSettings.json`

```json
{
  "profiles": {
    "https": {
      "applicationUrl": "https://localhost:7190;http://localhost:5045"
    }
  }
}
```

---

## Environment File Contents

### .env.development
```bash
# Development Environment Configuration
# ASP.NET Core development server typically runs on HTTPS port 7190

VITE_API_BASE_URL=https://localhost:7190
```

### .env.production
```bash
# Production Environment Configuration
# Replace with your production backend URL

VITE_API_BASE_URL=https://api.your-production-domain.com
```

### .env.local (Optional - Create if needed)
```bash
# Local Development Overrides
# This file is gitignored and used for personal configuration

# Example: Use HTTP instead of HTTPS for local dev
VITE_API_BASE_URL=http://localhost:5045

# Example: Use a different backend instance
VITE_API_BASE_URL=https://localhost:8080
```

---

## How Vite Loads Environment Files

Vite loads environment files in this order (later files override earlier):

1. `.env` - Always loaded (if exists)
2. `.env.local` - Local overrides (gitignored)
3. `.env.[mode]` - Environment-specific (e.g., `.env.development`)
4. `.env.[mode].local` - Environment-specific local overrides

**Mode is determined by**:
- `npm run dev` → mode = `development`
- `npm run build` → mode = `production`
- `npm run preview` → mode = `production`

---

## CORS Configuration

### Backend CORS Setup

The backend (Program.cs) is configured to allow requests from the frontend:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",   // Vite dev (HTTP)
                  "http://localhost:5175",   // Vite dev alternate
                  "https://localhost:5173",  // Vite dev (HTTPS)
                  "https://localhost:5175")  // Vite dev alternate (HTTPS)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### Frontend Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 5173 | HTTP/HTTPS | Vite default dev server |
| 5175 | HTTP/HTTPS | Vite alternate port |

**Note**: Vite typically runs on HTTP by default. HTTPS origins are included for flexibility.

---

## SSL Certificate Handling (Development)

### Browser Security Warnings

When using `https://localhost:7190` in development, you may encounter:
- ⚠️ "Your connection is not private"
- ⚠️ "NET::ERR_CERT_AUTHORITY_INVALID"

**This is normal for local HTTPS development.**

### Solutions

#### Option 1: Trust the Development Certificate (Recommended)

```bash
# Run in PowerShell as Administrator
dotnet dev-certs https --trust
```

This installs the ASP.NET Core development certificate to your trusted root store.

#### Option 2: Accept Browser Warning

1. Click "Advanced" on the warning page
2. Click "Proceed to localhost (unsafe)"

**Note**: This is safe for `localhost` in development.

#### Option 3: Use HTTP Instead

Update `.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:5045
```

---

## Configuration Validation

### API Config with Validation

The application validates the environment variable on startup:

```typescript
// src/config/apiConfig.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not defined. Please create a .env file with VITE_API_BASE_URL=your-backend-url'
  );
}
```

**Error Message**: If `VITE_API_BASE_URL` is not set, the app will display a clear error message.

---

## Testing Different Environments

### Test Development Environment
```bash
# Uses .env.development (https://localhost:7190)
npm run dev
```

### Test Production Build Locally
```bash
# Build with production config
npm run build

# Preview production build
npm run preview
```

### Test with Custom Backend
```bash
# Create .env.local with custom URL
echo "VITE_API_BASE_URL=https://staging-api.example.com" > .env.local

# Run dev server
npm run dev
```

---

## Troubleshooting

### Issue: "VITE_API_BASE_URL is not defined"

**Cause**: No environment file with `VITE_API_BASE_URL` exists.

**Solution**:
```bash
# Copy the example file
cp .env.example .env.local

# Or create .env.local manually
echo "VITE_API_BASE_URL=https://localhost:7190" > .env.local
```

### Issue: "Failed to fetch" or CORS errors

**Cause**: Backend URL is incorrect or backend is not running.

**Check**:
1. Backend is running: `dotnet run` in `CallCenter.API`
2. Backend URL matches `.env` file
3. CORS is configured in backend `Program.cs`

**Verify Backend URL**:
```bash
# Check if backend is accessible
curl https://localhost:7190/api/calls/active
# or in PowerShell:
Invoke-WebRequest https://localhost:7190/api/calls/active
```

### Issue: SSL certificate errors

**Solution**: Trust the dev certificate (see "SSL Certificate Handling" above)

### Issue: Environment variable changes not reflected

**Cause**: Vite server needs restart after .env changes.

**Solution**:
```bash
# Stop dev server (Ctrl+C)
# Start again
npm run dev
```

---

## Production Deployment

### Steps for Production

1. **Update `.env.production`**:
   ```bash
   VITE_API_BASE_URL=https://api.your-production-domain.com
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Deploy `dist/` folder** to your web server

4. **Update Backend CORS**:
   Add production origin to `Program.cs`:
   ```csharp
   policy.WithOrigins(
       "http://localhost:5173",
       "https://your-production-domain.com")
   ```

### Environment-Specific Builds

```bash
# Build for development
npm run build -- --mode development

# Build for production
npm run build -- --mode production

# Build for staging (requires .env.staging)
npm run build -- --mode staging
```

---

## Security Best Practices

### ✅ DO
- ✅ Commit `.env.development` and `.env.production` (non-sensitive defaults)
- ✅ Use `.env.local` for sensitive or personal configuration
- ✅ Document all required environment variables
- ✅ Validate environment variables at runtime
- ✅ Use HTTPS in production

### ❌ DON'T
- ❌ Commit secrets or API keys to `.env` files
- ❌ Hardcode URLs in source code
- ❌ Use HTTP in production
- ❌ Commit `.env.local` to version control

---

## Quick Reference

### Commands

```bash
# Development (uses .env.development)
npm run dev

# Production build (uses .env.production)
npm run build

# Preview production build
npm run preview

# Check environment variables (in code)
console.log(import.meta.env.VITE_API_BASE_URL)
```

### File Priority

```
Highest priority:  .env.[mode].local
                   .env.[mode]
                   .env.local
Lowest priority:   .env
```

### Default URLs

| Environment | Backend URL | Frontend URL |
|-------------|-------------|--------------|
| Development | https://localhost:7190 | http://localhost:5173 |
| Production | (configured) | (configured) |

---

**Last Updated**: 2025-12-04
**Vite Version**: 5.x
**ASP.NET Core Version**: .NET 10
