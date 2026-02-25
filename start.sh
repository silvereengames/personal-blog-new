#!/bin/bash

# 1. Install Bun
curl -fsSL https://bun.sh/install | bash

# 2. Add Bun to the system PATH for this script
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# 3. Pull updates
git pull

# 4. Run your Bun commands
bun install
bun index.js