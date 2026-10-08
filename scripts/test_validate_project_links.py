#!/usr/bin/env python3
"""Offline regressions for the external link checker's network boundary."""
from __future__ import annotations

import io
import socket
import unittest
import urllib.request
from unittest.mock import Mock, patch

import validate_project as validator


def addresses(*values: str) -> list[tuple]:
    return [
        (
            socket.AF_INET6 if ":" in value else socket.AF_INET,
            socket.SOCK_STREAM,
            socket.IPPROTO_TCP,
            "",
            (value, 443, 0, 0) if ":" in value else (value, 443),
        )
        for value in values
    ]


class FakeResponse:
    def __init__(self, status: int, location: str | None = None) -> None:
        self.status = status
        self.location = location

    def getheader(self, name: str) -> str | None:
        return self.location if name.lower() == "location" else None


class FakeConnection:
    def __init__(self, response: FakeResponse, requests: list, destination) -> None:
        self.response = response
        self.requests = requests
        self.destination = destination

    def request(self, method: str, target: str, headers: dict[str, str]) -> None:
        self.requests.append((method, self.destination.host, target))

    def getresponse(self) -> FakeResponse:
        return self.response

    def close(self) -> None:
        pass


class HeaderOnlyStream(io.BytesIO):
    def read(self, *args):
        raise AssertionError("A link check must not consume the response body")


class RecordingSocket:
    def __init__(self, address: str, port: int, status: int = 200) -> None:
        self.address = address
        self.port = port
        self.sent = b""
        self.connected_to = None
        self.closed = False
        self.response = HeaderOnlyStream(f"HTTP/1.1 {status} Response\r\nContent-Length: 999999999\r\n\r\n".encode())

    def settimeout(self, value) -> None:
        pass

    def connect(self, address) -> None:
        self.connected_to = address

    def getpeername(self):
        return self.address, self.port

    def sendall(self, data: bytes) -> None:
        self.sent += data

    def makefile(self, mode: str):
        return self.response

    def close(self) -> None:
        self.closed = True


class OriginalBoundaryRegressionTests(unittest.TestCase):
    def test_private_literal_is_rejected_before_a_request_can_be_sent(self) -> None:
        response = Mock(status=200)
        response.geturl.return_value = "http://127.0.0.1/internal"
        response.__enter__ = Mock(return_value=response)
        response.__exit__ = Mock(return_value=None)
        with patch.object(urllib.request, "urlopen", return_value=response) as unsafe_request, patch("socket.getaddrinfo", return_value=addresses("127.0.0.1")):
            self.assertEqual(validator.fetch_url("http://127.0.0.1/internal"), ("http://127.0.0.1/internal", None, None))
            unsafe_request.assert_not_called()


class ExternalLinkSecurityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.resolver = patch.object(validator.socket, "getaddrinfo", return_value=addresses("93.184.216.34"))
        self.resolver_mock = self.resolver.start()
        self.addCleanup(self.resolver.stop)
        self.sleep = patch.object(validator.time, "sleep")
        self.sleep_mock = self.sleep.start()
        self.addCleanup(self.sleep.stop)

    def transport(self, *responses: FakeResponse):
        pending = iter(responses)
        requests: list = []

        def create(destination, timeout):
            return FakeConnection(next(pending), requests, destination)

        for name in ("_PinnedHTTPConnection", "_PinnedHTTPSConnection"):
            transport_patch = patch.object(validator, name, side_effect=create)
            transport_patch.start()
            self.addCleanup(transport_patch.stop)
        return requests

    def test_rejects_non_public_ipv4_ipv6_and_transition_addresses(self) -> None:
        for address in (
            "127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.0.1",
            "169.254.169.254", "0.0.0.0", "100.64.0.1", "224.0.0.1",
            "192.0.2.1", "198.51.100.1", "203.0.113.1",
            "::1", "::", "fe80::1", "fc00::1", "ff02::1", "2001:db8::1",
            "::ffff:127.0.0.1", "::ffff:8.8.8.8", "2002:7f00:1::", "2001::1", "64:ff9b::7f00:1",
        ):
            with self.subTest(address=address):
                self.resolver_mock.return_value = addresses(address)
                with self.assertRaises(validator.UnsafeExternalURL):
                    validator._resolve_public_destination("https://example.org/source")

    def test_rejects_one_private_answer_in_otherwise_public_dns(self) -> None:
        self.resolver_mock.return_value = addresses("93.184.216.34", "fd00::1")
        with patch.object(validator.socket, "socket") as connect:
            self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", None, None))
            connect.assert_not_called()
        self.sleep_mock.assert_not_called()

    def test_rejects_unsafe_schemes_credentials_hosts_and_ports_before_dns(self) -> None:
        for url in (
            "file:///etc/passwd", "ftp://example.org/file", "http://example.org:22/",
            "https://example.org:8443/", "https://user:password@example.org/",
            "https://user@example.org/", "https://example.org\t/", "https://example.org\\@127.0.0.1/",
            "https://[fe80::1%25en0]/", "https://example.org:/", "https://a..example.org/",
            "https://-bad.example.org/", "https://localhost/", "https:///missing-host", "https://example.org../",
        ):
            with self.subTest(url=url):
                with self.assertRaises(validator.UnsafeExternalURL):
                    validator._resolve_public_destination(url)
        self.resolver_mock.assert_not_called()

    def test_accepts_global_ipv4_ipv6_and_normalizes_idna(self) -> None:
        self.resolver_mock.return_value = addresses("93.184.216.34", "2606:4700:4700::1111")
        destination = validator._resolve_public_destination("https://bücher.example/source#part")
        self.assertEqual(destination.host, "xn--bcher-kva.example")
        self.assertEqual(destination.port, 443)
        self.assertEqual(destination.target, "/source")
        self.assertEqual(len(destination.addresses), 2)

    def test_empty_dns_and_scoped_ipv6_answers_fail_closed(self) -> None:
        for result in ([], [(socket.AF_INET6, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("2606:4700:4700::1111", 443, 0, 2))]):
            with self.subTest(result=result):
                self.resolver_mock.return_value = result
                with self.assertRaises(validator.UnsafeExternalURL):
                    validator._resolve_public_destination("https://example.org/source")

    def test_connection_uses_validated_address_without_second_dns_lookup(self) -> None:
        destination = validator._resolve_public_destination("https://example.org/source")
        self.resolver_mock.side_effect = AssertionError("DNS must not be resolved again at connection time")
        pinned_socket = Mock()
        pinned_socket.getpeername.return_value = ("93.184.216.34", 443)
        with patch.object(validator.socket, "socket", return_value=pinned_socket):
            connection = validator._PinnedHTTPConnection(destination, timeout=25)
            connection.connect()
        self.assertIs(connection.sock, pinned_socket)
        pinned_socket.connect.assert_called_once_with(("93.184.216.34", 443))

    def test_rejects_connection_peer_different_from_pinned_destination(self) -> None:
        destination = validator._resolve_public_destination("https://example.org/source")
        pinned_socket = Mock()
        pinned_socket.getpeername.return_value = ("127.0.0.1", 443)
        with patch.object(validator.socket, "socket", return_value=pinned_socket):
            with self.assertRaises(validator.UnsafeExternalURL):
                validator._PinnedHTTPConnection(destination, timeout=25).connect()
        pinned_socket.close.assert_called_once()

    def test_https_retains_hostname_for_certificate_verification_and_sni(self) -> None:
        destination = validator._resolve_public_destination("https://example.org/source")
        pinned_socket = Mock()
        pinned_socket.getpeername.return_value = ("93.184.216.34", 443)
        context = Mock()
        with patch.object(validator.socket, "socket", return_value=pinned_socket), patch.object(validator.ssl, "create_default_context", return_value=context):
            connection = validator._PinnedHTTPSConnection(destination, timeout=25)
            connection.connect()
        context.wrap_socket.assert_called_once_with(pinned_socket, server_hostname="example.org")
        self.assertIs(connection.sock, context.wrap_socket.return_value)

    def test_actual_http_headers_use_original_host_and_never_read_get_body(self) -> None:
        head_socket = RecordingSocket("93.184.216.34", 80, status=405)
        get_socket = RecordingSocket("93.184.216.34", 80)
        with patch.object(validator.socket, "socket", side_effect=[head_socket, get_socket]):
            self.assertEqual(validator.fetch_url("http://example.org/source?q=1"), ("http://example.org/source?q=1", 200, "http://example.org/source?q=1"))
        self.assertIn(b"HEAD /source?q=1 HTTP/1.1\r\nHost: example.org\r\n", head_socket.sent)
        self.assertIn(b"GET /source?q=1 HTTP/1.1\r\nHost: example.org\r\n", get_socket.sent)
        self.assertEqual(get_socket.connected_to, ("93.184.216.34", 80))
        self.assertTrue(head_socket.closed and get_socket.closed)

    def test_actual_https_headers_keep_host_and_use_tls_on_pinned_socket(self) -> None:
        pinned_socket = RecordingSocket("93.184.216.34", 443)
        context = Mock()
        context.wrap_socket.return_value = pinned_socket
        with patch.object(validator.socket, "socket", return_value=pinned_socket), patch.object(validator.ssl, "create_default_context", return_value=context):
            self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", 200, "https://example.org/source"))
        self.assertIn(b"Host: example.org\r\n", pinned_socket.sent)
        self.assertEqual(pinned_socket.connected_to, ("93.184.216.34", 443))
        context.wrap_socket.assert_called_once_with(pinned_socket, server_hostname="example.org")

    def test_failed_public_address_falls_back_only_to_another_validated_address(self) -> None:
        self.resolver_mock.return_value = addresses("93.184.216.34", "2606:4700:4700::1111")
        destination = validator._resolve_public_destination("https://example.org/source")
        failed = Mock()
        failed.connect.side_effect = OSError("unreachable")
        connected = Mock()
        connected.getpeername.return_value = ("2606:4700:4700::1111", 443, 0, 0)
        with patch.object(validator.socket, "socket", side_effect=[failed, connected]):
            connection = validator._PinnedHTTPConnection(destination, timeout=25)
            connection.connect()
        self.assertIs(connection.sock, connected)
        failed.close.assert_called_once()
        self.assertEqual(self.resolver_mock.call_count, 1)

    def test_blocks_private_redirect_before_opening_next_connection(self) -> None:
        requests = self.transport(FakeResponse(302, "http://127.0.0.1/internal"))
        self.resolver_mock.side_effect = lambda host, *args, **kwargs: addresses("127.0.0.1" if host == "127.0.0.1" else "93.184.216.34")
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", None, None))
        self.assertEqual(requests, [("HEAD", "example.org", "/source")])
        self.sleep_mock.assert_not_called()

    def test_revalidates_relative_and_cross_host_redirects_and_reports_final_url(self) -> None:
        requests = self.transport(FakeResponse(301, "/new"), FakeResponse(307, "https://sources.example.org/final?q=1"), FakeResponse(200))
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", 200, "https://sources.example.org/final?q=1"))
        self.assertEqual(requests, [("HEAD", "example.org", "/source"), ("HEAD", "example.org", "/new"), ("HEAD", "sources.example.org", "/final?q=1")])
        self.assertEqual(self.resolver_mock.call_count, 3)

    def test_redirect_limit_fails_closed_without_retrying(self) -> None:
        requests = self.transport(*(FakeResponse(302, f"/step-{index}") for index in range(validator.MAX_EXTERNAL_REDIRECTS + 1)))
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", None, None))
        self.assertEqual(len(requests), validator.MAX_EXTERNAL_REDIRECTS + 1)
        self.sleep_mock.assert_not_called()

    def test_redirect_without_location_fails_closed(self) -> None:
        self.transport(FakeResponse(302))
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", None, None))

    def test_rejects_redirect_credentials_bad_port_and_control_characters(self) -> None:
        for location in ("https://user@example.org/private", "https://example.org:22/private", "\thttps://example.org/private", "file:///etc/passwd"):
            with self.subTest(location=location):
                requests = self.transport(FakeResponse(302, location))
                self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", None, None))
                self.assertEqual(len(requests), 1)
        self.sleep_mock.assert_not_called()

    def test_malformed_redirect_is_a_failed_link_and_does_not_abort_validator(self) -> None:
        for location in ("http://[", "//[", "https://[not-an-address]/"):
            with self.subTest(location=location):
                requests = self.transport(FakeResponse(302, location))
                self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", None, None))
                self.assertEqual(len(requests), 1)
        self.sleep_mock.assert_not_called()

    def test_get_fallback_preserves_restricted_status_and_final_url(self) -> None:
        requests = self.transport(FakeResponse(302, "/blocked"), FakeResponse(403), FakeResponse(302, "/blocked"), FakeResponse(403))
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", 403, "https://example.org/blocked"))
        self.assertEqual([request[0] for request in requests], ["HEAD", "HEAD", "GET", "GET"])

    def test_get_fallback_for_head_not_supported(self) -> None:
        requests = self.transport(FakeResponse(405), FakeResponse(200))
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", 200, "https://example.org/source"))
        self.assertEqual([request[0] for request in requests], ["HEAD", "GET"])

    def test_retries_transient_statuses_and_reports_restricted_429(self) -> None:
        requests = self.transport(*(FakeResponse(429) for _ in range(6)))
        self.assertEqual(validator.fetch_url("https://example.org/source"), ("https://example.org/source", 429, "https://example.org/source"))
        self.assertEqual(len(requests), 6)
        self.assertEqual(self.sleep_mock.call_count, 2)


if __name__ == "__main__":
    unittest.main()
