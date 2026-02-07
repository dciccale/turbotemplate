#!/usr/bin/env bash
set -euo pipefail

# ─── Resolve template directory (sibling of this script's parent) ────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ─── Colors ──────────────────────────────────────────────────────────────────
bold="\033[1m"
green="\033[0;32m"
cyan="\033[0;36m"
red="\033[0;31m"
reset="\033[0m"

# ─── Usage ───────────────────────────────────────────────────────────────────
usage() {
  echo -e "${bold}Usage:${reset} turbotemplate <project-name | .>"
  echo ""
  echo "  turbotemplate my-app    Create a new project in ./my-app"
  echo "  turbotemplate .         Scaffold into the current directory (uses dir name)"
  echo ""
  exit 1
}

# ─── Validate args ───────────────────────────────────────────────────────────
if [ $# -eq 0 ]; then
  usage
fi

PROJECT_ARG="$1"

# ─── Determine target directory and project name ─────────────────────────────
if [ "$PROJECT_ARG" = "." ]; then
  TARGET_DIR="$(pwd)"
  PROJECT_NAME="$(basename "$TARGET_DIR")"
else
  PROJECT_NAME="$PROJECT_ARG"
  TARGET_DIR="$(pwd)/$PROJECT_NAME"
fi

# Guard: don't scaffold into the template repo itself
REAL_TARGET="$(cd "$TARGET_DIR" 2>/dev/null && pwd -P || echo "$TARGET_DIR")"
REAL_TEMPLATE="$(cd "$TEMPLATE_DIR" && pwd -P)"
if [ "$REAL_TARGET" = "$REAL_TEMPLATE" ]; then
  echo -e "${red}Error:${reset} You are inside the turbotemplate repo itself. Run this from a different directory."
  exit 1
fi

# Guard: target directory already exists (only when not using ".")
if [ "$PROJECT_ARG" != "." ] && [ -d "$TARGET_DIR" ]; then
  echo -e "${red}Error:${reset} Directory '${TARGET_DIR}' already exists."
  exit 1
fi

# Validate project name (basic check for valid npm package name characters)
if ! [[ "$PROJECT_NAME" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo -e "${red}Error:${reset} Invalid project name '${PROJECT_NAME}'. Use only alphanumeric characters, hyphens, dots, or underscores."
  exit 1
fi

echo -e "${cyan}Creating project ${bold}${PROJECT_NAME}${reset}${cyan} in ${TARGET_DIR}...${reset}"
echo ""

# ─── Create target directory ─────────────────────────────────────────────────
mkdir -p "$TARGET_DIR"

# ─── Copy template files ────────────────────────────────────────────────────
echo -e "  ${bold}Copying${reset} template files..."

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.turbo' \
  --exclude='.vercel' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='bun.lock' \
  --exclude='bin/' \
  "$TEMPLATE_DIR/" "$TARGET_DIR/"

# ─── Replace "turbotemplate" → project name in all text files ────────────────
echo -e "  ${bold}Renaming${reset} turbotemplate → ${PROJECT_NAME} in all files..."

# Build the find command with binary file exclusions
find "$TARGET_DIR" -type f \
  ! -path '*/.git/*' \
  ! -path '*/node_modules/*' \
  ! -name '*.ico' \
  ! -name '*.png' \
  ! -name '*.jpg' \
  ! -name '*.jpeg' \
  ! -name '*.gif' \
  ! -name '*.webp' \
  ! -name '*.woff' \
  ! -name '*.woff2' \
  ! -name '*.ttf' \
  ! -name '*.eot' \
  -print0 | while IFS= read -r -d '' file; do
    # Only run sed on files that actually contain the string (faster)
    if grep -q 'turbotemplate' "$file" 2>/dev/null; then
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/turbotemplate/${PROJECT_NAME}/g" "$file"
      else
        sed -i "s/turbotemplate/${PROJECT_NAME}/g" "$file"
      fi
    fi
  done

# ─── Rename files/directories containing "turbotemplate" ────────────────────
echo -e "  ${bold}Renaming${reset} files with turbotemplate in their name..."

find "$TARGET_DIR" -depth -name '*turbotemplate*' | while IFS= read -r filepath; do
  dir="$(dirname "$filepath")"
  base="$(basename "$filepath")"
  new_base="${base//turbotemplate/$PROJECT_NAME}"
  mv "$filepath" "$dir/$new_base"
done

# ─── Initialize git repo (only if not already one) ──────────────────────────
if [ -d "$TARGET_DIR/.git" ]; then
  echo -e "  ${bold}Git${reset} repo already exists, skipping init."
else
  echo -e "  ${bold}Initializing${reset} git repository..."
  git -C "$TARGET_DIR" init --quiet
fi

# ─── Install dependencies ───────────────────────────────────────────────────
echo -e "  ${bold}Installing${reset} dependencies with bun..."
(cd "$TARGET_DIR" && bun install)

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${green}${bold}✔ Project '${PROJECT_NAME}' is ready!${reset}"
echo ""
echo -e "  ${cyan}cd ${TARGET_DIR}${reset}"
echo -e "  ${cyan}bun run dev${reset}"
echo ""
