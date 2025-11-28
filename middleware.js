import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

const encoder = new TextEncoder();

function base64UrlToUint8Array(base64UrlString) {
  const padded = base64UrlString.padEnd(
    base64UrlString.length + ((4 - (base64UrlString.length % 4)) % 4),
    "="
  );
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeJwtPayload(payloadSegment) {
  try {
    const payloadBytes = base64UrlToUint8Array(payloadSegment);
    const json = new TextDecoder().decode(payloadBytes);
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode JWT payload:", err);
    return null;
  }
}

async function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is missing");
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return null;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signedContent = encoder.encode(`${header}.${payload}`);
    const signatureBytes = base64UrlToUint8Array(signature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      signedContent
    );

    if (!isValid) {
      return null;
    }

    const decodedPayload = decodeJwtPayload(payload);
    if (!decodedPayload) {
      return null;
    }

    // Expiration check if `exp` is present
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null;
    }

    return decodedPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Allow login routes
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Read JWT cookie
  const token = req.cookies.get("pos_session")?.value;

  // Not logged in → redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Validate token
  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Protect routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/outlets/:path*",
    "/products/:path*",
    "/pos/:path*",
    "/settings/:path*",
  ],
};
