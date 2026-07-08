import { mock } from "bun:test";

// The "server-only" package throws on import outside a React Server
// environment; unit tests exercise pure logic from server modules, so
// neutralize it.
mock.module("server-only", () => ({}));
