#!/bin/bash
set -e

AXION_DIR="$HOME/.axion"
AGENT_REPO="https://raw.githubusercontent.com/Official-Krish/Axion/main/web-services/apps/host-agent"

echo ""
echo "  ☁️  Axion Host Agent Installer"
echo ""

# --- Check Bun ---
if command -v bun &>/dev/null; then
  echo "  ✓ Bun $(bun --version) installed"
else
  echo "  Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo "  ✓ Bun installed"
fi

# --- Check Docker ---
if command -v docker &>/dev/null; then
  if docker info &>/dev/null; then
    echo "  ✓ Docker running"
  else
    echo "  ⚠ Docker installed but not running"
  fi
else
  echo "  ⚠ Docker not found"
fi

# --- Install cloudflared ---
if command -v cloudflared &>/dev/null; then
  echo "  ✓ cloudflared $(cloudflared version | head -1) installed"
else
  echo "  Installing cloudflared..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &>/dev/null; then
      brew install cloudflared
    else
      echo "  ⚠ Please install Homebrew first, then run: brew install cloudflared"
      echo "  Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    fi
  else
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
      -o /tmp/cloudflared.deb
    sudo dpkg -i /tmp/cloudflared.deb
    rm /tmp/cloudflared.deb
    echo "  ✓ cloudflared installed"
  fi
fi

# --- Create Docker network for deployments ---
docker network create axion-net 2>/dev/null && \
  echo "  ✓ Created Docker network: axion-net" || \
  echo "  ✓ Docker network axion-net already exists"

# --- Start Caddy container (reverse proxy for deployments) ---
CADDY_CONTAINER="axion-caddy"
if docker ps -q --filter "name=$CADDY_CONTAINER" | grep -q .; then
  echo "  ✓ Caddy container already running"
else
  if docker ps -aq --filter "name=$CADDY_CONTAINER" | grep -q .; then
    docker rm "$CADDY_CONTAINER" >/dev/null 2>&1
  fi
  docker run -d \
    --name "$CADDY_CONTAINER" \
    --network axion-net \
    --restart always \
    -p 127.0.0.1:80:80 \
    -p 127.0.0.1:2019:2019 \
    caddy sh -c 'echo "{\"admin\":{\"listen\":\"0.0.0.0:2019\"},\"apps\":{\"http\":{\"servers\":{\"srv0\":{\"listen\":[\":80\"],\"routes\":[]}}}}}" > /etc/caddy/config.json && caddy run --config /etc/caddy/config.json' >/dev/null 2>&1 && \
    echo "  ✓ Caddy proxy container started" || \
    echo "  ⚠ Failed to start Caddy (is Docker running?)"
fi

# --- Create directories ---
mkdir -p "$AXION_DIR/agent"

# --- Build agent (bundles to single JS file) ---
echo ""
echo "  Building agent..."
cd "$AGENT_REPO" && bun install && bun build ./index.ts --outdir ./dist --target bun --minify

# --- Copy built agent ---
cp "$AGENT_REPO/dist/index.js" "$AXION_DIR/agent/index.js"

echo "  ✓ Agent installed (built)"

# --- Create launcher ---
cat > "$AXION_DIR/axion" << 'EOF'
#!/bin/bash
exec bun "$HOME/.axion/agent/index.js" "$@"
EOF
chmod +x "$AXION_DIR/axion"

# --- Add to PATH ---
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_RC="$HOME/.bashrc"
fi

PATH_LINE='export PATH="$HOME/.axion:$PATH"'
if [ -n "$SHELL_RC" ]; then
  if ! grep -q '.axion' "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Axion Host Agent" >> "$SHELL_RC"
    echo "$PATH_LINE" >> "$SHELL_RC"
    echo "  ✓ Added to PATH in $SHELL_RC"
  else
    echo "  ✓ PATH already configured"
  fi
fi

export PATH="$HOME/.axion:$PATH"

echo ""
echo "  ✓ Axion Host Agent installed!"
echo ""
echo "  Next steps:"
echo "    1. source ~/.zshrc        (or open a new terminal)"
echo "    2. axion register          Register this machine"
echo "    3. axion start             Start earning SOL"
echo ""
echo "  WS: ws://localhost:8080"
echo "  API: http://localhost:3000/api/v2"
echo ""
