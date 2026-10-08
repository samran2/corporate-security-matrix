#!/usr/bin/env python3
from __future__ import annotations

import argparse
import concurrent.futures
import http.client
import ipaddress
import re
import socket
import ssl
import subprocess
import sys
import time
import urllib.parse
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "index.html",
    "framework.html",
    "acknowledgements.html",
    "assessment.html",
    "coverage.html",
    "404.html",
    "styles.css",
    "assessment.css",
    "coverage.css",
    "coverage.js",
    "coverage-model.js",
    "matrix-coverage.js",
    "matrix-coverage-governance.js",
    "matrix-coverage-safety.js",
    "matrix-coverage-digital.js",
    "app.js",
    "matrix-domains.js",
    "matrix-actors.js",
    "matrix-briefs.js",
    "matrix-references.js",
    "matrix-overlays.js",
    "matrix-tools-d01-d03.js",
    "matrix-tools-d04-d06.js",
    "matrix-tools-d07-d09.js",
    "matrix-tools.js",
    "assessment-model.js",
    "assessment-crypto.js",
    "assessment-compare.js",
    "assessment.js",
    "assessment-comparison.js",
    "source-lifecycle-register.json",
    "source-change-register.json",
    "source-change-register.checkpoint.json",
    "README.md",
    "FRAMEWORK.md",
    "SOURCE-LIBRARY.md",
    "FACT-CHECK.md",
    "CONTENT-REVIEW.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "CHANGELOG.md",
    "ROADMAP.md",
    "RELEASE-CONTROLS.md",
    "OVERLAY-EU-FI.md",
    "SOURCE-CHANGE-REGISTER.md",
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
    "scripts/validate_data_contract.mjs",
    "scripts/validate_assessment.mjs",
    "scripts/validate_assessment_compare.mjs",
    "scripts/validate_source_register.mjs",
    "scripts/validate_overlays.mjs",
    "scripts/test_validate_overlays.mjs",
    "scripts/test_runtime_bootstrap.mjs",
    "scripts/test_action_brief.mjs",
    "scripts/test_coverage_catalogue.mjs",
    "scripts/test_coverage_model.mjs",
    "scripts/test_coverage_ui.mjs",
    "scripts/validate_overlay_ui.mjs",
    "scripts/validate_mitigation_tools.mjs",
    "scripts/validate_mitigation_tools_ui.mjs",
    "scripts/validate_ui.mjs",
    "scripts/site-manifest.json",
    "scripts/site.mjs",
    "scripts/test_site.mjs",
    "scripts/validate_html.mjs",
    "scripts/test_validate_html.mjs",
    "scripts/test_validate_project_links.py",
    "scripts/validate_workflows.mjs",
    "scripts/verify_workflow_runs.mjs",
    "tasks/plan.md",
    "tasks/todo.md",
    "docs/ASSESSMENT-THREAT-MODEL.md",
    "docs/decisions/0001-local-assessment-and-encrypted-export.md",
    "docs/decisions/0002-separate-jurisdiction-overlays.md",
    "docs/ADR-0003-coverage-workspace.md",
    "docs/COVERAGE-WORKSPACE.md",
    "docs/COVERAGE-REVIEW.md",
    ".github/workflows/validate.yml",
    ".github/workflows/links.yml",
    ".github/workflows/pages.yml",
]

HTML_FILES = ["index.html", "framework.html", "acknowledgements.html", "assessment.html", "coverage.html", "404.html"]
SOURCE_SCAN_FILES = [
    *HTML_FILES,
    "app.js",
    "matrix-domains.js",
    "matrix-actors.js",
    "matrix-briefs.js",
    "matrix-references.js",
    "matrix-overlays.js",
    "matrix-tools-d01-d03.js",
    "matrix-tools-d04-d06.js",
    "matrix-tools-d07-d09.js",
    "matrix-tools.js",
    "assessment-model.js",
    "assessment-crypto.js",
    "assessment-compare.js",
    "assessment.js",
    "assessment-comparison.js",
    "coverage.js",
    "coverage-model.js",
    "matrix-coverage.js",
    "matrix-coverage-governance.js",
    "matrix-coverage-safety.js",
    "matrix-coverage-digital.js",
]
URL_SCAN_FILES = [
    *HTML_FILES,
    "matrix-references.js",
    "matrix-coverage-governance.js",
    "matrix-coverage-safety.js",
    "matrix-coverage-digital.js",
    "README.md",
    "FRAMEWORK.md",
    "SOURCE-LIBRARY.md",
    "FACT-CHECK.md",
    "CONTENT-REVIEW.md",
    "OVERLAY-EU-FI.md",
    "SOURCE-CHANGE-REGISTER.md",
    "source-lifecycle-register.json",
    "source-change-register.json",
    "docs/ASSESSMENT-THREAT-MODEL.md",
    "docs/decisions/0001-local-assessment-and-encrypted-export.md",
    "docs/decisions/0002-separate-jurisdiction-overlays.md",
    "docs/ADR-0003-coverage-workspace.md",
    "docs/COVERAGE-WORKSPACE.md",
    "docs/COVERAGE-REVIEW.md",
]

PUBLIC_RELEASE_VERSION = "1.0.0"
CANDIDATE_VERSION = "1.1.0"
RELEASE_DATE = "2026-08-29"
RELEASE_MARKERS = {
    "index.html": [
        (
            f"candidate v{CANDIDATE_VERSION} hero edition",
            re.compile(rf"\bEdition\s+{re.escape(CANDIDATE_VERSION)}\b"),
        ),
        (
            "root canonical URL",
            re.compile(r'<link rel="canonical" href="https://samran2\.github\.io/corporate-security-matrix/">'),
        ),
        (
            "root Open Graph URL",
            re.compile(r'<meta property="og:url" content="https://samran2\.github\.io/corporate-security-matrix/">'),
        ),
    ],
    "README.md": [
        (
            "explicit index.html live-entry link",
            re.compile(r'\[Open the live matrix\]\(https://samran2\.github\.io/corporate-security-matrix/index\.html\)'),
        ),
    ],
    "404.html": [
        (
            "explicit index.html recovery CTA",
            re.compile(r'href="https://samran2\.github\.io/corporate-security-matrix/index\.html"'),
        ),
    ],
    "framework.html": [
        (
            f"candidate v{CANDIDATE_VERSION} footer version",
            re.compile(rf"\bVersion\s+{re.escape(CANDIDATE_VERSION)}\b"),
        ),
    ],
    "CITATION.cff": [
        (
            f"current public v{PUBLIC_RELEASE_VERSION} citation version",
            re.compile(
                rf"^version:\s*['\"]?{re.escape(PUBLIC_RELEASE_VERSION)}['\"]?\s*$",
                re.MULTILINE,
            ),
        ),
        (
            "current public citation release date",
            re.compile(rf"^date-released:\s*['\"]?{re.escape(RELEASE_DATE)}['\"]?\s*$", re.MULTILINE),
        ),
    ],
    "CHANGELOG.md": [
        (
            f"unreleased v{CANDIDATE_VERSION} candidate heading",
            re.compile(
                rf"^##\s+\[Unreleased\]\s+[—-]\s+v{re.escape(CANDIDATE_VERSION)}\s+candidate,\s+{re.escape(RELEASE_DATE)}\s*$",
                re.MULTILINE,
            ),
        ),
    ],
    "CONTENT-REVIEW.md": [
        (
            f"reviewed candidate v{CANDIDATE_VERSION} edition",
            re.compile(rf"^Edition:\s*{re.escape(CANDIDATE_VERSION)}[ \t]*$", re.MULTILINE),
        ),
        (
            "review date",
            re.compile(rf"^Review date:\s*{re.escape(RELEASE_DATE)}[ \t]*$", re.MULTILINE),
        ),
    ],
}

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
MAX_EXTERNAL_REDIRECTS = 5
EXTERNAL_REDIRECT_STATUSES = {301, 302, 303, 307, 308}
PUBLIC_HTML_FILES = {"index.html", "framework.html", "acknowledgements.html", "assessment.html"}


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


class UnsafeExternalURL(ValueError):
    """A link or redirect crosses the external checker's public network boundary."""


@dataclass(frozen=True)
class _ExternalDestination:
    url: str
    scheme: str
    host: str
    port: int
    target: str
    addresses: tuple[tuple[int, tuple], ...]


def _public_ip(value: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address:
    if "%" in value:
        raise UnsafeExternalURL("Scoped IP addresses are not allowed.")
    try:
        address = ipaddress.ip_address(value)
    except ValueError as exc:
        raise UnsafeExternalURL("Destination is not a valid IP address.") from exc
    if (
        not address.is_global
        or address.is_multicast
        or address.is_reserved
        or address.is_unspecified
        or address.is_loopback
        or address.is_link_local
        or (
            isinstance(address, ipaddress.IPv6Address)
            and (
                address.ipv4_mapped is not None
                or address.sixtofour is not None
                or address.teredo is not None
                or address in ipaddress.ip_network("64:ff9b::/96")
            )
        )
    ):
        raise UnsafeExternalURL("External links may only connect to public global IP addresses.")
    return address


def _validate_url_characters(url: str) -> None:
    if not url or len(url) > 8192 or "\\" in url or any(ord(char) <= 32 or ord(char) == 127 for char in url):
        raise UnsafeExternalURL("External URL contains invalid characters or exceeds the length limit.")


def _resolve_public_destination(url: str) -> _ExternalDestination:
    _validate_url_characters(url)
    try:
        parsed = urllib.parse.urlsplit(url)
        host = parsed.hostname
        port = parsed.port
    except ValueError as exc:
        raise UnsafeExternalURL("External URL is malformed.") from exc
    if parsed.scheme not in {"http", "https"} or not host or parsed.username is not None or parsed.password is not None:
        raise UnsafeExternalURL("External URLs require HTTP(S), a hostname, and no credentials.")
    expected_port = 443 if parsed.scheme == "https" else 80
    if parsed.netloc.endswith(":") or port not in {None, expected_port} or "%" in host:
        raise UnsafeExternalURL("External URLs require the scheme's standard port and no scoped address.")
    port = expected_port
    try:
        literal = ipaddress.ip_address(host)
    except ValueError:
        try:
            host = (host[:-1] if host.endswith(".") else host).encode("idna").decode("ascii").lower()
        except UnicodeError as exc:
            raise UnsafeExternalURL("External hostname is invalid.") from exc
        labels = host.split(".")
        if len(host) > 253 or len(labels) < 2 or any(
            not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label)
            for label in labels
        ):
            raise UnsafeExternalURL("External hostname must be a valid fully qualified name.")
    else:
        _public_ip(str(literal))
        host = str(literal)

    # Reject the entire DNS result if any answer is unsafe, then use these exact
    # addresses for the connection. The transport never resolves the host again.
    resolved = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM, proto=socket.IPPROTO_TCP)
    addresses: list[tuple[int, tuple]] = []
    for family, kind, protocol, _, sockaddr in resolved:
        if family not in {socket.AF_INET, socket.AF_INET6} or kind != socket.SOCK_STREAM or protocol != socket.IPPROTO_TCP:
            raise UnsafeExternalURL("DNS returned an unsupported address type.")
        address = _public_ip(sockaddr[0])
        if (family == socket.AF_INET) != isinstance(address, ipaddress.IPv4Address):
            raise UnsafeExternalURL("DNS address does not match its address family.")
        if family == socket.AF_INET6:
            if len(sockaddr) != 4 or sockaddr[3] != 0:
                raise UnsafeExternalURL("Scoped IPv6 destinations are not allowed.")
            pinned_address = (str(address), port, 0, 0)
        else:
            pinned_address = (str(address), port)
        entry = (family, pinned_address)
        if entry not in addresses:
            addresses.append(entry)
    if not addresses:
        raise UnsafeExternalURL("External hostname has no public addresses.")
    target = urllib.parse.quote(parsed.path or "/", safe="/%:@!$&'()*+,;=-._~")
    if parsed.query:
        target += "?" + urllib.parse.quote(parsed.query, safe="/%?:@!$&'()*+,;=-._~")
    return _ExternalDestination(url, parsed.scheme, host, port, target, tuple(addresses))


def _connect_pinned(destination: _ExternalDestination, timeout: float) -> socket.socket:
    deadline = time.monotonic() + timeout
    last_error: OSError | None = None
    for family, sockaddr in destination.addresses:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise TimeoutError("External connection timed out.")
        connection = socket.socket(family, socket.SOCK_STREAM, socket.IPPROTO_TCP)
        try:
            connection.settimeout(remaining)
            connection.connect(sockaddr)
            peer = connection.getpeername()
            if _public_ip(peer[0]) != ipaddress.ip_address(sockaddr[0]) or peer[1] != destination.port:
                raise UnsafeExternalURL("Connected peer does not match the validated destination.")
            return connection
        except UnsafeExternalURL:
            connection.close()
            raise
        except OSError as exc:
            connection.close()
            last_error = exc
    raise last_error or OSError("Unable to connect to the external destination.")


class _PinnedHTTPConnection(http.client.HTTPConnection):
    def __init__(self, destination: _ExternalDestination, timeout: float) -> None:
        super().__init__(destination.host, destination.port, timeout=timeout)
        self.destination = destination

    def connect(self) -> None:
        self.sock = _connect_pinned(self.destination, self.timeout)


class _PinnedHTTPSConnection(_PinnedHTTPConnection):
    default_port = 443

    def __init__(self, destination: _ExternalDestination, timeout: float) -> None:
        super().__init__(destination, timeout)
        self.tls_context = ssl.create_default_context()

    def connect(self) -> None:
        connection = _connect_pinned(self.destination, self.timeout)
        try:
            # Keep the original hostname for both SNI and certificate checking;
            # only the underlying TCP connection uses the pinned public address.
            self.sock = self.tls_context.wrap_socket(connection, server_hostname=self.destination.host)
        except BaseException:
            connection.close()
            raise


def _request_with_redirects(url: str, method: str, headers: dict[str, str]) -> tuple[int, str]:
    current = url
    for redirect_count in range(MAX_EXTERNAL_REDIRECTS + 1):
        destination = _resolve_public_destination(current)
        connection_type = _PinnedHTTPSConnection if destination.scheme == "https" else _PinnedHTTPConnection
        connection = connection_type(destination, timeout=25)
        try:
            connection.request(method, destination.target, headers=headers)
            response = connection.getresponse()
            status = response.status
            if status not in EXTERNAL_REDIRECT_STATUSES:
                return status, current
            location = response.getheader("Location")
        finally:
            # A link check needs response headers only, even when HEAD falls
            # back to GET. Never buffer or consume an unbounded response body.
            connection.close()
        if redirect_count == MAX_EXTERNAL_REDIRECTS or not location:
            raise UnsafeExternalURL("External redirect chain is missing a location or exceeds the hop limit.")
        _validate_url_characters(location)
        try:
            current = urllib.parse.urljoin(current, location)
        except ValueError as exc:
            raise UnsafeExternalURL("External redirect location is malformed.") from exc
    raise UnsafeExternalURL("External redirect chain exceeds the hop limit.")


def fetch_url(url: str) -> tuple[str, int | None, str | None]:
    headers = {"User-Agent": "CorporateSecurityMatrixValidator/1.0 (+https://github.com/samran2/corporate-security-matrix)"}
    last_status: int | None = None
    last_final: str | None = None

    for attempt in range(3):
        for method in ("HEAD", "GET"):
            try:
                status, final = _request_with_redirects(url, method, headers)
                if status < 400:
                    return url, status, final
                last_status = status
                last_final = final
                if method == "HEAD" and status in {403, 405, 429, 501}:
                    continue
                if status not in {404, 408, 429, 500, 502, 503, 504}:
                    return url, status, last_final
            except UnsafeExternalURL:
                # An unsafe target is a permanent failure. Do not retry it or
                # switch methods, which could reopen a changing DNS boundary.
                return url, None, None
            except (http.client.HTTPException, TimeoutError, OSError):
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


def validate_release_markers(existing_files: set[str], errors: list[str]) -> None:
    for relative_path, markers in RELEASE_MARKERS.items():
        if relative_path not in existing_files:
            continue
        text = (ROOT / relative_path).read_text(encoding="utf-8")
        for label, pattern in markers:
            if not pattern.search(text):
                errors.append(f"{relative_path} is missing the expected {label} for {RELEASE_DATE}.")


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


def run_ui_validation(errors: list[str]) -> None:
    validator = ROOT / "scripts" / "validate_ui.mjs"
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
        errors.append(f"UI validation failed: {details}")


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
        "CONTENT-REVIEW.md",
        "OVERLAY-EU-FI.md",
        "SOURCE-CHANGE-REGISTER.md",
        "ROADMAP.md",
        "RELEASE-CONTROLS.md",
        "DEVELOPMENT.md",
        "CONTRIBUTING.md",
        "SECURITY.md",
        "tasks/plan.md",
        "tasks/todo.md",
        "docs/ASSESSMENT-THREAT-MODEL.md",
        "docs/decisions/0001-local-assessment-and-encrypted-export.md",
        "docs/decisions/0002-separate-jurisdiction-overlays.md",
        "docs/ADR-0003-coverage-workspace.md",
        "docs/COVERAGE-WORKSPACE.md",
        "docs/COVERAGE-REVIEW.md",
    ):
        validate_markdown_links(relative_path, errors)

    validate_release_markers(existing_files, errors)

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
    run_ui_validation(errors)

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

        print("RESTRICTED URL REPORT")
        if restricted_urls:
            for url, status, final_url in sorted(restricted_urls):
                print(f"- status={status} url={url} final={final_url}")
        else:
            print("- None")

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
