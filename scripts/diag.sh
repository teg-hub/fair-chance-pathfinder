mkdir -p scripts
cat > scripts/diag.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
OUT=diag.txt
echo "== GIT ==" > "$OUT"
git remote -v >> "$OUT" || true
git branch --show-current >> "$OUT" || true

echo -e "\n== NODE ==" >> "$OUT"
node -v >> "$OUT"; npm -v >> "$OUT"

echo -e "\n== ENV (.env.local keys only, redacted) ==" >> "$OUT"
if [ -f .env.local ]; then
  grep -E '^[A-Z0-9_]+=' .env.local | sed 's/=.*/=<redacted>/' >> "$OUT"
else
  echo "missing .env.local" >> "$OUT"
fi

echo -e "\n== FILES (top) ==" >> "$OUT"
ls -la >> "$OUT"

echo -e "\n== TREE (app, api, lib) ==" >> "$OUT"
( command -v tree >/dev/null && tree -L 3 app lib || find app lib -maxdepth 3 -print ) >> "$OUT" 2>/dev/null || true

echo -e "\n== package.json scripts ==" >> "$OUT"
jq '.scripts' package.json 2>/dev/null >> "$OUT" || cat package.json >> "$OUT"

echo -e "\n== tsconfig.json ==" >> "$OUT"
cat tsconfig.json >> "$OUT" 2>/dev/null || echo "no tsconfig.json" >> "$OUT"

echo -e "\n== next.config.mjs ==" >> "$OUT"
cat next.config.mjs >> "$OUT" 2>/dev/null || echo "no next.config.mjs" >> "$OUT"

echo -e "\n== sanity checks ==" >> "$OUT"
grep -RIn "app/api/catalogs" -n || true
grep -RIn "set_session_from_email" app || true
grep -RIn "x-user-email" app || true
echo -e "\n== build ==" >> "$OUT"
npm ci >/dev/null 2>&1 || true
npm run build >> "$OUT" 2>&1 || true

echo -e "\n== ROUTE FILE DUPLICATES ==" >> "$OUT"
git ls-files | grep -E '^app/api/catalogs/(route|index)\.tsx?$' >> "$OUT" || true
echo -e "\n== DONE ==" >> "$OUT"
echo "Wrote $OUT"
SH
chmod +x scripts/diag.sh
./scripts/diag.sh

