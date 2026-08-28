#!/usr/bin/env python3
from __future__ import annotations

import argparse
import concurrent.futures
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "index.html",
    "framework.html",
    "acknowledgements.html",
    "404.html",
    "styles.css",
    "app.js",
    "matrix-domains.js",
    "matrix-actors.js",
    "matrix-briefs.js",
    "matrix-references.js",
    "README.md",
    "FRAMEWORK.md",
    "SOURCE-LIBRARY.md",
    "FACT-CHECK.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "CHANGELOG.md",
    "ROADMAP.md",
    "DEVELOPMENT.md",
    "CITATION.cff",
    "LICENSE",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    "assets/favicon.svg",
    "assets/apple-touch-icon.png",
    "assets/social-preview.png",
    "assets/github-preview.svg",
    "assets/matrix-anatomy.svg",
    "scripts/validate_data.mjs",
    ".github/workflows/validate.yml",
    ".github/workflows/links.yml",
    ".github/workflows/pages.yml",
]

HTML_FILES = ["index.html", "framework.html", "acknowledgements.html", "404.html"]
SOURCE_SCAN_FILES = [*HTML_FILES, "app.js", "matrix-domains.js", "matrix-actors.js", "matrix-briefs.js", "matrix-references.js"]
URL_SCAN_FILES = [*HTML_FILES, "matrix-references.js", "README.md", "FRAMEWORK.md", "SOURCE-LIBRARY.md", "FACT-CHECK.md"]

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
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
SKIP_URL_PREFIXES = (
    "http://127.0.0.1",
    "http://localhost",
    "https://samran2.github.io/corporate-security-matrix",
)
RESTRICTED_STATUSES = {401, 403, 429}
PUBLIC_HTML_FILES = {"index.html", "framework.html", "acknowledgements.html"}


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.external_blank_links: list[dict[str, str]] = []
        self.aria_controls: list[str] = []
        self.generic_aria_labels: list[str] = []
        self.inline_style_tags: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key: value or "" for key, value in attrs}
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        for attribute in ("href", "src"):
            if attributes.get(attribute):
                self.links.append((tag, attributes[attribute]))
        if attributes.get("aria-controls"):
            self.aria_controls.extend(attributes["aria-controls"].split())
        if tag in {"div", "span"} and attributes.get("aria-label") and not attributes.get("role"):
            self.generic_aria_labels.append(tag)
        if attributes.get("style"):
            self.inline_style_tags.append(tag)
        if tag == "a" and attributes.get("target") == "_blank":
            self.external_blank_links.append(attributes)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate the Corporate Security Matrix release surface.")
    parser.add_argument("--check-links", action="store_true", help="Also verify external URLs over the network.")
    return parser.parse_args()


def collect_external_urls(existing_files: set[str]) -> list[str]:
    urls: list[str] = []
    for relative_path in URL_SCAN_FILES:
        if relative_path not in existing_files:
            continue
        text = (ROOT / relative_path).read_text(encoding="utf-8")
        for match in URL_RE.findall(text):
            url = match.rstrip(".,;:")
            if url.startswith(SKIP_URL_PREFIXES):
                continue
            if url not in urls:
                urls.append(url)
    return urls


def fetch_url(url: str) -> tuple[str, int | None, str | None]:
    headers = {"User-Agent": "CorporateSecurityMatrixValidator/1.0 (+https://github.com/samran2/corporate-security-matrix)"}
    last_status: int | None = None
    last_final: str | None = None

    for attempt in range(3):
        for method in ("HEAD", "GET"):
            request = urllib.request.Request(url, headers=headers, method=method)
            try:
                with urllib.request.urlopen(request, timeout=25) as response:
                    return url, response.status, response.geturl()
            except urllib.error.HTTPError as exc:
                last_status = exc.code
                last_final = exc.geturl() or url
                if method == "HEAD" and exc.code in {403, 405, 429, 501}:
                    continue
                if exc.code not in {404, 408, 429, 500, 502, 503, 504}:
                    return url, exc.code, last_final
            except (urllib.error.URLError, TimeoutError, OSError):
                last_status = None
                last_final = None
        if attempt < 2:
            time.sleep(1.5 * (attempt + 1))

    return url, last_status, last_final


def resolve_internal_path(source: Path, raw_target: str) -> Path | None:
    target = raw_target.strip()
    if not target or target.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return None
    parsed = urllib.parse.urlparse(target)
    if parsed.scheme or parsed.netloc:
        return None
    clean_path = urllib.parse.unquote(parsed.path)
    if not clean_path:
        return None
    if clean_path.startswith("/"):
        return ROOT / clean_path.lstrip("/")
    return source.parent / clean_path


def validate_html(relative_path: str, errors: list[str]) -> None:
    path = ROOT / relative_path
    if not path.exists():
        return

    text = path.read_text(encoding="utf-8")
    parser = DocumentParser()
    try:
        parser.feed(text)
        parser.close()
    except Exception as exc:
        errors.append(f"{relative_path} could not be parsed as HTML: {exc}")
        return

    if len(parser.ids) != len(set(parser.ids)):
        duplicate_ids = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
        errors.append(f"{relative_path} contains duplicate IDs: {', '.join(duplicate_ids)}")

    for controlled_id in parser.aria_controls:
        if controlled_id not in parser.ids:
            errors.append(f"{relative_path} aria-controls references missing ID: {controlled_id}")

    if parser.generic_aria_labels:
        errors.append(f"{relative_path} uses aria-label on generic elements without a role: {', '.join(parser.generic_aria_labels)}")

    if parser.inline_style_tags and "style-src 'self'" in text:
        errors.append(f"{relative_path} contains inline style attributes blocked by its Content Security Policy: {', '.join(parser.inline_style_tags)}")

    for attributes in parser.external_blank_links:
        rel_values = set(attributes.get("rel", "").split())
        if not {"noopener", "noreferrer"}.issubset(rel_values):
            errors.append(f"{relative_path} target=_blank link is missing rel=\"noopener noreferrer\": {attributes.get('href', '')}")

    for _, raw_target in parser.links:
        target_path = resolve_internal_path(path, raw_target)
        if target_path is not None and not target_path.resolve().exists():
            errors.append(f"{relative_path} references missing internal file: {raw_target}")

    if 'http-equiv="Content-Security-Policy"' not in text:
        errors.append(f"{relative_path} is missing the Content Security Policy meta tag.")
    if 'name="referrer"' not in text:
        errors.append(f"{relative_path} is missing the referrer policy meta tag.")
    if relative_path in PUBLIC_HTML_FILES:
        for required_fragment in ('rel="canonical"', 'property="og:image"', 'name="twitter:image"', 'rel="icon"', 'rel="apple-touch-icon"'):
            if required_fragment not in text:
                errors.append(f"{relative_path} is missing required metadata: {required_fragment}")


def validate_markdown_links(relative_path: str, errors: list[str]) -> None:
    path = ROOT / relative_path
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    for match in MARKDOWN_LINK_RE.finditer(text):
        target = match.group(1).split(maxsplit=1)[0].strip("<>")
        target_path = resolve_internal_path(path, target)
        if target_path is not None and not target_path.resolve().exists():
            errors.append(f"{relative_path} references missing internal file: {target}")


def run_data_validation(errors: list[str]) -> None:
    validator = ROOT / "scripts" / "validate_data.mjs"
    if not validator.exists():
        return
    result = subprocess.run(
        ["node", str(validator)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        details = (result.stdout + result.stderr).strip()
        errors.append(f"Data validation failed: {details}")


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    existing_files = {item for item in REQUIRED_FILES if (ROOT / item).exists()}

    for relative_path in REQUIRED_FILES:
        if relative_path not in existing_files:
            errors.append(f"Missing required file: {relative_path}")

    for relative_path in HTML_FILES:
        validate_html(relative_path, errors)

    for relative_path in (
        "README.md",
        "FRAMEWORK.md",
        "ROADMAP.md",
        "DEVELOPMENT.md",
        "CONTRIBUTING.md",
        "SECURITY.md",
    ):
        validate_markdown_links(relative_path, errors)

    for relative_path in SOURCE_SCAN_FILES:
        path = ROOT / relative_path
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for label, pattern in DANGEROUS_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"{relative_path} contains disallowed pattern: {label}")

    for legacy_name in ("Attack Total Defence", "AttackTotalDefence"):
        for relative_path in existing_files:
            path = ROOT / relative_path
            if path.is_file() and path.suffix.lower() in {".md", ".html", ".js", ".py", ".yml", ".yaml", ""}:
                try:
                    if legacy_name in path.read_text(encoding="utf-8"):
                        errors.append(f"{relative_path} contains stale project name: {legacy_name}")
                except UnicodeDecodeError:
                    pass

    run_data_validation(errors)

    urls = collect_external_urls(existing_files)
    restricted_urls: list[tuple[str, int | None, str | None]] = []
    if args.check_links:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            results = list(executor.map(fetch_url, urls))
        for url, status, final_url in results:
            if status in RESTRICTED_STATUSES:
                restricted_urls.append((url, status, final_url))
            elif status is None or status >= 400:
                errors.append(f"External URL failed: {url} (status={status}, final={final_url})")

    if errors:
        print("VALIDATION FAILED")
        for item in errors:
            print(f"- {item}")
        return 1

    print("VALIDATION PASSED")
    print(f"- Required release files: {len(REQUIRED_FILES)}")
    print(f"- HTML documents: {len(HTML_FILES)}")
    print(f"- Source-safety scans: {len(SOURCE_SCAN_FILES)}")
    print(f"- External URLs discovered: {len(urls)}")
    print(f"- External URLs checked: {len(urls) if args.check_links else 0} (use --check-links to enable)")
    if args.check_links:
        print(f"- URLs reachable but automated access restricted: {len(restricted_urls)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
