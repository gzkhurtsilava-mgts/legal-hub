# Corp Inventory — Nexus & Harbor

Source of truth for packages and images available in the corporate infrastructure.
**Before installing anything new — grep the relevant CSV first.**

---

## How to use

### Adding a new npm package
```bash
grep -i "package-name" docs/corp-inventory/nexus-npm.csv
```
If found → use `https://nexus.mgts.ru/repository/npm-all/` (corp machine) or confirm it's available.
If **not found** → this is a blocker. Discuss with the user before searching for alternatives.

### Adding a new Docker image (`FROM ...`)
```bash
grep -i "image-name" docs/corp-inventory/harbor-images.csv
```
Pull path is in the `pull_path` column: `harbor.mgts.ru/<project>/<repo>`.
If **not found** → check if it can be added to Harbor. Do not use plain Docker Hub in corp environment.

### Python packages
No PyPI Nexus mirror found. Python packages are installed from pypi.org **via corp proxy**
(`http://proxywg.mgts.corp.net:3128`). Backend `uv sync` works transparently through the proxy.
No pre-check needed, but note that air-gapped builds are not possible for Python deps.

---

## Files

| File | Contents |
|---|---|
| `harbor-images.csv` | All images in Harbor registry (`harbor.mgts.ru`). Columns: project, repository, pull_path |
| `nexus-npm.csv` | All npm packages/scopes mirrored in Nexus (repos: npmjs, npm-mts-design, gitlab-npm). Columns: repo, url, name |
| `nexus-alpine.csv` | Alpine Linux versions available via Nexus alpine-proxy |
| `nexus-other.csv` | Other repos: go-proxy, maven-central, conda, nuget, etc. |
| `source/nexus-harbor.xlsx` | Original Excel — source of truth. Update this when Nexus/Harbor changes. |

---

## Key findings for legal-hub

| Need | Available | Pull path / registry |
|---|---|---|
| Node.js image | ✅ `library/node` | `harbor.mgts.ru/dockerhub/library/node` |
| Python image | ✅ `library/python` | `harbor.mgts.ru/library/python` |
| PostgreSQL image | ✅ `library/postgres` | `harbor.mgts.ru/dockerhub/library/postgres` |
| Alpine image | ✅ `library/alpine` | `harbor.mgts.ru/dockerhub/library/alpine` |
| Redis image | ✅ check `valkey/valkey` or `library/redis` via dockerhub | `harbor.mgts.ru/dockerhub/valkey/valkey` |
| Nginx image | ✅ `library/nginx` | `harbor.mgts.ru/dockerhub/library/nginx` |
| MinIO (future) | ✅ `minio/minio` | `harbor.mgts.ru/dockerhub/minio/minio` |
| **JodConverter** (M4 doc convert) | ✅ `eugenmayer/jodconverter` | `harbor.mgts.ru/dockerhub/eugenmayer/jodconverter` |
| OnlyOffice (alternative preview) | ✅ `onlyoffice/documentserver` | `harbor.mgts.ru/dockerhub/onlyoffice/documentserver` |
| TipTap npm packages | ✅ `@tiptap` scope in npmjs | `https://nexus.mgts.ru/repository/npm-all/` |
| TanStack Query | ✅ `@tanstack` scope in npmjs | same |
| xlsx (SheetJS) | ✅ `xlsx` in npmjs | same |
| react-pdf / pdfjs-dist | ❓ not in scope list | Use browser native `<iframe>` for PDF instead |
| @mts-ds packages | ✅ `npm-mts-design` repo | Already in `vendor/` — no Nexus call needed |

---

## Updating this inventory

When Nexus/Harbor changes, re-export the Excel and run:
```bash
python scripts/convert_inventory.py
```
Then commit the updated CSVs.
