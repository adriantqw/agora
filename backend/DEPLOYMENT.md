# Google Cloud Run Deployment Guide

This guide provides manual steps to deploy the Agora MerchantHub backend to Google Cloud Run.

## Prerequisites

1. Google Cloud Project with billing enabled
2. `gcloud` CLI installed and configured
3. Docker installed locally (for testing)
4. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

## Important: Database Persistence

⚠️ **SQLite on Cloud Run is ephemeral** - the database resets on every deployment or container restart.

For production, migrate to Cloud SQL (PostgreSQL) or Firestore for persistent storage.

## Deployment Steps

### 1. Set Environment Variables

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"  # Choose your preferred region
export SERVICE_NAME="agora-backend"
export IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
```

### 2. Generate JWT Secret Key

```bash
# Generate a secure random key (minimum 32 characters)
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy the output for next step
```

### 3. Store JWT Secret in Secret Manager

```bash
# Create secret
echo -n "your-generated-secret-key-from-step-2" | \
  gcloud secrets create jwt-secret-key \
  --data-file=- \
  --replication-policy="automatic"

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding jwt-secret-key \
  --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Build and Push Docker Image

```bash
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Build the Docker image
docker build -t ${IMAGE_NAME}:latest .

# Push to Google Container Registry
docker push ${IMAGE_NAME}:latest
```

**Alternative: Build directly in Cloud**
```bash
gcloud builds submit --tag ${IMAGE_NAME}:latest
```

### 5. Deploy to Cloud Run

```bash
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars="DATABASE_URL=sqlite:///./agora.db" \
  --set-env-vars="JWT_ALGORITHM=HS256" \
  --set-env-vars="ACCESS_TOKEN_EXPIRE_HOURS=24" \
  --set-env-vars="REFRESH_TOKEN_EXPIRE_DAYS=90" \
  --set-env-vars="HOST=0.0.0.0" \
  --set-env-vars="PORT=8080" \
  --set-secrets="JWT_SECRET_KEY=jwt-secret-key:latest"
```

### 6. Get Service URL

```bash
gcloud run services describe ${SERVICE_NAME} \
  --region ${REGION} \
  --format 'value(status.url)'
```

### 7. Update Frontend Configuration

Update `frontend/.env.production` with your backend URL:

```bash
VITE_API_BASE_URL=https://your-service-url.run.app
```

### 8. Configure CORS

After deployment, update the backend CORS settings to include your frontend URL:

```bash
# Get your frontend URL (after deploying frontend)
FRONTEND_URL="https://your-frontend-url.run.app"

# Redeploy with CORS configuration
gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --set-env-vars="CORS_ORIGINS=https://your-frontend-url.run.app,http://localhost:3000"
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
# Rebuild and push image
docker build -t ${IMAGE_NAME}:v2 .
docker push ${IMAGE_NAME}:v2

# Update service
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:v2 \
  --region ${REGION}
```

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

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./agora.db` |
| `JWT_SECRET_KEY` | JWT signing key (from Secret Manager) | Retrieved from secret |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_HOURS` | Access token expiry | `24` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `90` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://your-frontend.run.app` |
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

### Secret not accessible

Verify IAM permissions:
```bash
gcloud secrets add-iam-policy-binding jwt-secret-key \
  --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Cost Optimization

- Set `--min-instances 0` for development (scales to zero)
- Set `--min-instances 1` for production (reduces cold starts)
- Monitor usage in Cloud Console
- SQLite is free, but Cloud SQL has costs

## Security Best Practices

1. **Never commit `.env` or secrets**
2. **Use Secret Manager** for sensitive data
3. **Enable Cloud Armor** for DDoS protection (optional)
4. **Set up VPC** for internal services (optional)
5. **Regular security audits** via Cloud Security Command Center

## Next Steps

- Deploy frontend to Cloud Run
- Set up custom domain
- Configure Cloud CDN for static assets
- Migrate to Cloud SQL for production
- Set up monitoring and alerting
- Implement CI/CD pipeline
