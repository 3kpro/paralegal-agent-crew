# Self-Hosted Deployment Guide for VendorScope

This guide provides step-by-step instructions for deploying VendorScope (Vendor Risk Assessment Platform) into your own environment, such as a localized Virtual Private Cloud (VPC) or on-premise server.

## Prerequisites

Before starting, ensure the following are installed on your target server:

*   **Docker**: v20.10+
*   **Docker Compose**: v2.0+
*   **Git**: For cloning the repository

## 1. Clone the Repository

Clone the project to your deployment server:

```bash
git clone https://github.com/your-org/vendorscope.git
cd vendorscope
```

## 2. Configuration

VendorScope uses environment variables for configuration. You can configure these directly in `docker-compose.yml` or (recommended) create a `.env` file in the root directory.

### Create .env File

```bash
touch .env
```

Add the following configuration to `.env`:

```ini
# Application Secrets
DASHBOARD_PASSWORD=change_this_password_for_admin_access
ANTHROPIC_API_KEY=sk-ant-api03-... # Required for Auto-Fill and Risk Analysis
PINECONE_API_KEY=pc-sk-... # Required if using Vector Store/RAG features
SENTRY_DSN=https://... # Optional: For error tracking

# Database Configuration (Internal Docker Network)
DATABASE_URL=postgresql://user:password@db:5432/vendorscope
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=vendorscope
```

> **Security Note**: Never commit your `.env` file to version control.

## 3. Deploy with Docker Compose

We use Docker Compose to orchestrate the Streamlit application and the PostgreSQL database.

### Build and Start Services

```bash
docker-compose up -d --build
```

This command will:
1.  Build the python application container (installing dependencies and Playwright browsers).
2.  Start the PostgreSQL database container.
3.  Launch the Dashboard on port `8501`.

### Verify Deployment

Check the status of your containers:

```bash
docker-compose ps
```

You should see two services `app` and `db` in the `Up` state.

Access the dashboard by navigating to: `http://<YOUR_SERVER_IP>:8501`

## 4. Maintenance & Operations

### Viewing Logs

To see application logs (including Audit Logs):

```bash
docker-compose logs -f app
```

### Accessing the Database

To interact with the database directly:

```bash
docker-compose exec db psql -U user -d vendorscope
```

### Backups

To backup your vendor data:

```bash
docker-compose exec db pg_dump -U user vendorscope > vendorscope_backup_$(date +%F).sql
```

## 5. Production Considerations

For a robust production deployment, consider the following enhancements:

*   **Reverse Proxy**: Set up Nginx or Traefik in front of the application to handle SSL/TLS termination (HTTPS).
*   **Persistent Storage**: Ensure the `postgres_data` volume is backed by durable block storage (e.g., EBS).
*   **Monitoring**: Configure the `SENTRY_DSN` and ensure logs are shipped to your centralized logging platform (e.g., CloudWatch, Datadog).
*   **Network Security**: Restrict access to port `8501` to your internal VPN or specific IP allowlist.

## Troubleshooting

**Issue: "Playwright Browser Not Found"**
If you see errors related to Playwright binaries, ensure the build step completed successfully. You can force a rebuild:
```bash
docker-compose build --no-cache app
```

**Issue: Database Connection Failed**
Ensure the `DATABASE_URL` matches the credentials defined in the `db` service configuration. The hostname `db` resolves within the docker network.
