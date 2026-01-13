
# 3kpro.services Integration Guide

## 1. DNS Configuration
To deploy SolForge to `solforge.3kpro.services`:

1.  Log in to your DNS provider (e.g., Namecheap, Cloudflare).
2.  Create an **A Record**:
    *   **Host**: `solforge`
    *   **Value**: `<YOUR_VPS_IP_ADDRESS>`
    *   **TTL**: Automatic/3600

## 2. Server Setup (VPS)
Assuming an Ubuntu 22.04 LTS server:

1.  **Install Docker & Docker Compose**:
    ```bash
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo systemctl enable --now docker
    ```

2.  **Clone Repository**:
    ```bash
    git clone https://github.com/3kpro/solforge.git /opt/solforge
    cd /opt/solforge
    ```

3.  **Run Production Build**:
    ```bash
    cd deployment
    docker-compose -f production-compose.yml up -d --build
    ```

## 3. Reverse Proxy (Nginx)
To serve on port 80/443 instead of 3000:

1.  **Install Nginx**:
    ```bash
    sudo apt install nginx -y
    ```
2.  **Configure**:
    Copy `deployment/nginx-host.conf` to `/etc/nginx/sites-available/solforge` and link it.
    ```bash
    sudo ln -s /etc/nginx/sites-available/solforge /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## 4. SSL (Certbot)
Secure the subdomain:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d solforge.3kpro.services
```

## 5. CI/CD (GitHub Actions)
The repository includes `.github/workflows/ci.yml` which runs tests on every push.
To enable auto-deployment, add a `deploy` job that SSHs into your VPS and runs the update commands.
