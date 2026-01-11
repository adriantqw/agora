# Google Cloud Run Deployment Guide

This guide provides simplified steps to deploy the Agora MerchantHub backend to Google Cloud Run.

**Note:** This is a demo-focused deployment guide that prioritizes simplicity. For production deployments, consider using Secret Manager for sensitive values.

## Prerequisites

1. Google Cloud Project with billing enabled
2. `gcloud` CLI installed and configured
3. Docker installed locally
4. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

## Important: Database Persistence

⚠️ **SQLite on Cloud Run is ephemeral** - the database resets on every deployment or container restart.

For production, migrate to Cloud SQL (PostgreSQL) or Firestore for persistent storage.

## Quick Start Deployment

### 1. Set Environment Variables

```bash
export PROJECT_ID="agora-483710"
export REGION="us-central1"
export SERVICE_NAME="agora-backend"
export FRONTEND_URL="https://your-frontend.run.app"  # Update with your actual frontend URL
```

### 2. Authenticate Docker with Google Cloud

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 3. Build and Push Docker Image

Use the included deployment script:

```bash
./docker-deploy.sh latest
```

Or manually:
```bash
docker build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/${PROJECT_ID}/agora-backend/agora-backend:latest .
docker push us-central1-docker.pkg.dev/${PROJECT_ID}/agora-backend/agora-backend:latest
```

### 4. Deploy to Cloud Run

```bash
gcloud run deploy ${SERVICE_NAME} \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/agora-backend/agora-backend:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars="JWT_SECRET_KEY=demo-jwt-secret-key-change-for-production-at-least-32-characters-long,JWT_ALGORITHM=HS256,ACCESS_TOKEN_EXPIRE_HOURS=24,REFRESH_TOKEN_EXPIRE_DAYS=90,CORS_ORIGINS=${FRONTEND_URL},http://localhost:3000,DATABASE_URL=sqlite:///./agora.db,HOST=0.0.0.0,PORT=8080"
```

**Note:** The default JWT_SECRET_KEY is sufficient for demo purposes. For production, generate your own:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Get Service URL

```bash
gcloud run services describe ${SERVICE_NAME} \
  --region ${REGION} \
  --format 'value(status.url)'
```

Save this URL - you'll need it for frontend configuration.

### 6. Update Frontend Configuration

Update `frontend/.env.production` with your backend URL:

```bash
VITE_API_BASE_URL=https://your-backend-service-url.run.app
```

## Testing Deployment

### Test Health Endpoint

```bash
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

curl ${SERVICE_URL}/health
# Expected: {"status": "healthy"}
```

### Test Login Endpoint

```bash
curl -X POST ${SERVICE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@merchant.com","password":"password123"}'
# Expected: 200 with user data and tokens
```

### Test API Documentation

Visit in browser:
```
https://your-service-url.run.app/docs
```

## Updating Deployment

To deploy updates:

```bash
# 1. Build and push new version
./docker-deploy.sh v2

# 2. Update Cloud Run service
gcloud run deploy ${SERVICE_NAME} \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/agora-backend/agora-backend:v2 \
  --region ${REGION}
```

**Note:** Environment variables persist across updates unless explicitly changed.

## Monitoring

### View Logs

```bash
gcloud run services logs read ${SERVICE_NAME} \
  --region ${REGION} \
  --limit 50
```

### View Metrics

```bash
# Open Cloud Console
gcloud run services describe ${SERVICE_NAME} --region ${REGION}
```

Visit: https://console.cloud.google.com/run

## Environment Variables Reference

| Variable | Description | Default/Example |
|----------|-------------|-----------------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./agora.db` |
| `JWT_SECRET_KEY` | JWT signing key | `demo-jwt-secret-key-change-for-production-at-least-32-characters-long` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_HOURS` | Access token expiry (hours) | `24` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry (days) | `90` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://your-frontend.run.app,http://localhost:3000` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port (Cloud Run provides this) | `8080` |

## Troubleshooting

### Container fails to start

Check logs:
```bash
gcloud run services logs read ${SERVICE_NAME} --region ${REGION}
```

### CORS errors

Ensure frontend URL is in `CORS_ORIGINS`:
```bash
gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --set-env-vars="CORS_ORIGINS=https://your-frontend.run.app,http://localhost:3000"
```

### Database resets on restart

This is expected with SQLite. For production, migrate to Cloud SQL:
- Cloud SQL PostgreSQL: Persistent, managed database
- Configure `DATABASE_URL` to PostgreSQL connection string

### JWT authentication not working

Verify JWT_SECRET_KEY is set correctly:
```bash
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format=json | grep JWT_SECRET_KEY
```

If needed, update environment variables:
```bash
gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --set-env-vars="JWT_SECRET_KEY=your-new-secret-key"
```

## Cost Optimization

- Set `--min-instances 0` for development (scales to zero)
- Set `--min-instances 1` for production (reduces cold starts)
- Monitor usage in Cloud Console
- SQLite is free, but Cloud SQL has costs

## Security Considerations

**Current Setup (Demo-Focused):**
- Default JWT_SECRET_KEY in codebase (clearly marked as "demo")
- Environment variables for configuration
- Sufficient security for demo/development purposes

**For Production Deployments:**
1. **Generate unique JWT_SECRET_KEY**: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
2. **Use Secret Manager** for sensitive data
3. **Restrict CORS origins** to only your actual frontend domains
4. **Enable Cloud Armor** for DDoS protection
5. **Set up VPC** for internal services
6. **Regular security audits** via Cloud Security Command Center
7. **Migrate to Cloud SQL** for persistent, secure database storage

**What's Still Secure:**
- ✅ Password hashing with bcrypt
- ✅ JWT token validation and expiration
- ✅ CORS protection (when properly configured)
- ✅ HTTPS via Cloud Run
- ✅ Non-root Docker user execution

## Next Steps

- Deploy frontend to Cloud Run
- Set up custom domain
- Configure Cloud CDN for static assets
- Migrate to Cloud SQL for production
- Set up monitoring and alerting
- Implement CI/CD pipeline
