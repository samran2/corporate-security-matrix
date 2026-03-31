#!/usr/bin/env python3
from __future__ import annotations

import concurrent.futures
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    ROOT / "index.html",
    ROOT / "styles.css",
    ROOT / "assets" / "github-preview.svg",
    ROOT / "assets" / "matrix-anatomy.svg",
    ROOT / "matrix-domains.js",
    ROOT / "matrix-actors.js",
    ROOT / "matrix-briefs.js",
    ROOT / "matrix-references.js",
    ROOT / "app.js",
    ROOT / "README.md",
    ROOT / "SOURCE-LIBRARY.md",
    ROOT / "SECURITY.md",
    ROOT / ".nojekyll",
]

SOURCE_SCAN_FILES = [
    ROOT / "index.html",
    ROOT / "matrix-domains.js",
    ROOT / "matrix-actors.js",
    ROOT / "matrix-briefs.js",
    ROOT / "matrix-references.js",
    ROOT / "app.js",
]

URL_SCAN_FILES = [
    ROOT / "index.html",
    ROOT / "matrix-references.js",
    ROOT / "README.md",
    ROOT / "SOURCE-LIBRARY.md",
]

DANGEROUS_PATTERNS = {
    "innerHTML": re.compile(r"\binnerHTML\b"),
    "outerHTML": re.compile(r"\bouterHTML\b"),
    "insertAdjacentHTML": re.compile(r"\binsertAdjacentHTML\b"),
    "document.write": re.compile(r"\bdocument\.write(?:ln)?\b"),
    "eval(": re.compile(r"\beval\s*\("),
    "new Function": re.compile(r"\bnew\s+Function\b"),
    "string setTimeout": re.compile(r"setTimeout\s*\(\s*[\"']"),
    "string setInterval": re.compile(r"setInterval\s*\(\s*[\"']"),
    "localStorage": re.compile(r"\blocalStorage\b"),
    "sessionStorage": re.compile(r"\bsessionStorage\b"),
}

URL_RE = re.compile(r"https?://[^\s<>\")`]+")
SKIP_URL_PREFIXES = ("http://127.0.0.1", "http://localhost")


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def collect_urls() -> list[str]:
    urls: list[str] = []
    for path in URL_SCAN_FILES:
        text = path.read_text(encoding="utf-8")
        for match in URL_RE.findall(text):
            url = match.rstrip(".,")
            if url.startswith(SKIP_URL_PREFIXES):
                continue
            if url not in urls:
                urls.append(url)
    return urls


def fetch_url(url: str) -> tuple[str, int | None, str | None]:
    headers = {"User-Agent": "Mozilla/5.0 AttackTotalDefenceValidator/1.0"}

    for method in ("HEAD", "GET"):
        request = urllib.request.Request(url, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                return url, response.status, response.geturl()
        except urllib.error.HTTPError as exc:
            if method == "HEAD" and exc.code in {403, 404, 405, 501}:
                continue
            return url, exc.code, exc.geturl() or url
        except Exception:
            if method == "HEAD":
                continue
            return url, None, None

    return url, None, None


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_FILES:
        if not path.exists():
            fail(errors, f"Missing required file: {path.relative_to(ROOT)}")

    index_html = (ROOT / "index.html").read_text(encoding="utf-8")
    if 'http-equiv="Content-Security-Policy"' not in index_html:
        fail(errors, "index.html is missing the CSP meta tag.")
    if 'name="referrer"' not in index_html:
        fail(errors, "index.html is missing the Referrer-Policy meta tag.")

    for match in re.finditer(r"<a\b[^>]*target=\"_blank\"[^>]*>", index_html):
        tag = match.group(0)
        if 'rel="noopener noreferrer"' not in tag:
            fail(errors, f"External link missing rel=\"noopener noreferrer\": {tag}")

    for path in SOURCE_SCAN_FILES:
        text = path.read_text(encoding="utf-8")
        for label, pattern in DANGEROUS_PATTERNS.items():
            if pattern.search(text):
                fail(errors, f"{path.relative_to(ROOT)} contains disallowed pattern: {label}")

    urls = collect_urls()
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(fetch_url, urls))

    for url, status, final_url in results:
        if status is None or status >= 400:
            fail(errors, f"URL validation failed for {url} (status={status}, final={final_url})")

    if errors:
        print("VALIDATION FAILED")
        for item in errors:
            print(f"- {item}")
        return 1

    print("VALIDATION PASSED")
    print(f"- Required files checked: {len(REQUIRED_FILES)}")
    print(f"- Dangerous source patterns checked in: {len(SOURCE_SCAN_FILES)} files")
    print(f"- External URLs checked: {len(urls)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
