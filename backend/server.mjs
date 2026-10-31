import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(backendDirectory, "..");
const dataDirectory = join(backendDirectory, "data");
const packagesPath = join(dataDirectory, "packages.json");
const ordersPath = join(dataDirectory, "coffee-orders.json");
const usersPath = join(dataDirectory, "private-users.enc.json");
const port = Number(process.env.PORT || 3000);
const baseUrl = (process.env.APP_BASE_URL || `http://localhost:${port}`).replace(/\/$/, "");
const sessionCookie = "ledgerly_admin";
const sessions = new Map();
const userSessions = new Map();
const passwordResetTokens = new Map();
const loginAttempts = new Map();
const authAttempts = new Map();
const coffeeAmountOptions = new Set([1, 5, 10, 25, 50, 100, 200, 250, 500, 1000]);
const maxBodyBytes = 65_536;
const scryptAsync = promisify(scrypt);
const encryptionKey = process.env.APP_ENCRYPTION_KEY ? Buffer.from(process.env.APP_ENCRYPTION_KEY, "base64") : null;
if (encryptionKey && encryptionKey.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be a base64-encoded 32-byte value.");
const dekWrappingKey = encryptionKey ? createHmac("sha256", encryptionKey).update("ledgerly-dek-wrap-v1").digest() : null;
const emailIndexKey = encryptionKey ? createHmac("sha256", encryptionKey).update("ledgerly-email-index-v1").digest() : null;

const starterPlans = [
    { id: "starter-free", nameKey: "packageFree", descriptionKey: "packageFreeDescription", periodKey: "packageFreePeriod", price: 0, featured: false, featureKeys: ["packageFreeFeature1", "packageFreeFeature2", "packageFreeFeature3"] },
    { id: "starter-starter", nameKey: "packageStarter", descriptionKey: "packageStarterDescription", periodKey: "packageMonthly", price: 8, featured: false, featureKeys: ["packageStarterFeature1", "packageStarterFeature2", "packageStarterFeature3"] },
    { id: "starter-trader", nameKey: "packageTrader", descriptionKey: "packageTraderDescription", periodKey: "packageMonthly", price: 18, featured: true, featureKeys: ["packageTraderFeature1", "packageTraderFeature2", "packageTraderFeature3"] },
    { id: "starter-desk", nameKey: "packageDesk", descriptionKey: "packageDeskDescription", periodKey: "packageMonthly", price: 36, featured: false, featureKeys: ["packageDeskFeature1", "packageDeskFeature2", "packageDeskFeature3"] }
];

const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".txt": "text/plain; charset=utf-8"
};

function sendJson(response, status, value) {
    response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify(value));
}

function parseCookies(request) {
    return Object.fromEntries((request.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
        const separator = part.indexOf("=");
        return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
    }));
}

function isAdmin(request) {
    const token = parseCookies(request)[sessionCookie];
    const expiresAt = token && sessions.get(token);
    if (!expiresAt || expiresAt <= Date.now()) {
        if (token) sessions.delete(token);
        return false;
    }
    return true;
}

function encryptionConfigured() {
    return Boolean(encryptionKey && dekWrappingKey && emailIndexKey);
}

function encryptJson(value, key, associatedData) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(Buffer.from(associatedData));
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
    return { iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: encrypted.toString("base64") };
}

function decryptJson(value, key, associatedData) {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(value.iv, "base64"));
    decipher.setAAD(Buffer.from(associatedData));
    decipher.setAuthTag(Buffer.from(value.tag, "base64"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(value.data, "base64")), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
}

function emailLookup(email) {
    return createHmac("sha256", emailIndexKey).update(email.trim().toLowerCase()).digest("hex");
}

function userDatabaseKey(userId, purpose) {
    return `${userId}:${purpose}:v1`;
}

function readUserVault(userRecord) {
    const userDek = decryptJson(userRecord.wrappedDek, dekWrappingKey, userDatabaseKey(userRecord.id, "dek"));
    return { userDek: Buffer.from(userDek.key, "base64"), vault: decryptJson(userRecord.vault, Buffer.from(userDek.key, "base64"), userDatabaseKey(userRecord.id, "vault")) };
}

function currentUser(request) {
    const token = parseCookies(request).ledgerly_user;
    const session = token && userSessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
        if (token) userSessions.delete(token);
        return null;
    }
    return { token, ...session };
}

function userCsrfValid(request, response, session) {
    if (!hasExpectedOrigin(request, response, baseUrl)) return false;
    const supplied = request.headers["x-csrf-token"] || "";
    if (!timingSafeTextEqual(supplied, session.csrfToken)) {
        sendJson(response, 403, { error: "İstek doğrulaması başarısız." });
        return false;
    }
    return true;
}

let userDatabaseQueue = Promise.resolve();
async function mutateUserDatabase(mutator) {
    const operation = userDatabaseQueue.then(async () => {
        const users = await readJson(usersPath, {});
        const result = await mutator(users);
        await writeJson(usersPath, users);
        return result;
    });
    userDatabaseQueue = operation.catch(() => {});
    return operation;
}

async function mutateUserVault(userId, updater) {
    const operation = userDatabaseQueue.then(async () => {
        const users = await readJson(usersPath, {});
        const record = users[userId];
        if (!record) return null;
        const { userDek, vault } = readUserVault(record);
        const result = await updater(vault);
        record.vault = encryptJson(vault, userDek, userDatabaseKey(userId, "vault"));
        users[userId] = record;
        await writeJson(usersPath, users);
        return result;
    });
    userDatabaseQueue = operation.catch(() => {});
    return operation;
}

async function readUserProfile(session) {
    const users = await readJson(usersPath, {});
    const record = users[session.userId];
    if (!record) return null;
    return { record, ...readUserVault(record) };
}

function validateTrade(input, id, existing = {}) {
    const allowedMarkets = new Set(["forex", "crypto_spot", "crypto_futures", "bist", "viop", "us_stocks", "commodities", "indices", "options", "other"]);
    const allowedSides = new Set(["long", "short"]);
    const stringField = (key, max, fallback = "") => typeof input[key] === "string" ? input[key].trim().slice(0, max) : fallback;
    const numberField = (key) => input[key] === "" || input[key] === null || input[key] === undefined ? null : Number(input[key]);
    const market = stringField("market", 40);
    const side = stringField("side", 10);
    const symbol = stringField("symbol", 40).toUpperCase();
    const entryPrice = numberField("entryPrice");
    const quantity = numberField("quantity");
    if (!allowedMarkets.has(market) || !allowedSides.has(side) || !symbol || !Number.isFinite(entryPrice) || entryPrice <= 0 || !Number.isFinite(quantity) || quantity <= 0) return null;
    const numeric = ["exitPrice", "stopLoss", "takeProfit", "leverage", "riskPercent", "fees", "funding"];
    const result = { ...existing, id, market, symbol, side, entryPrice, quantity };
    numeric.forEach((key) => {
        const value = numberField(key);
        result[key] = value !== null && Number.isFinite(value) ? value : null;
    });
    const text = ["openedAt", "closedAt", "orderType", "timeframe", "strategy", "session", "moodBefore", "moodAfter", "notes", "currency"];
    text.forEach((key) => { result[key] = stringField(key, key === "notes" ? 4000 : 120, existing[key] || ""); });
    result.followedPlan = Boolean(input.followedPlan);
    result.updatedAt = new Date().toISOString();
    result.createdAt = existing.createdAt || new Date().toISOString();
    return result;
}

function timingSafeTextEqual(first, second) {
    const firstBuffer = Buffer.from(first);
    const secondBuffer = Buffer.from(second);
    return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

async function readJson(path, fallback) {
    try {
        return JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
        if (error.code === "ENOENT") return fallback;
        throw error;
    }
}

async function writeJson(path, value) {
    await mkdir(dataDirectory, { recursive: true });
    const temporaryPath = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    const { rename } = await import("node:fs/promises");
    await rename(temporaryPath, path);
}

async function readRequestBody(request) {
    const chunks = [];
    let totalBytes = 0;
    for await (const chunk of request) {
        totalBytes += chunk.length;
        if (totalBytes > maxBodyBytes) throw new Error("Request body too large");
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
}

async function readRequestData(request) {
    const raw = await readRequestBody(request);
    const contentType = request.headers["content-type"] || "";
    if (contentType.includes("application/json")) return JSON.parse(raw || "{}");
    return Object.fromEntries(new URLSearchParams(raw));
}

function publicPlan(plan) {
    return {
        id: plan.id,
        name: plan.name,
        nameKey: plan.nameKey,
        description: plan.description,
        descriptionKey: plan.descriptionKey,
        price: plan.price,
        period: plan.period,
        periodKey: plan.periodKey,
        features: plan.features,
        featureKeys: plan.featureKeys,
        featured: Boolean(plan.featured)
    };
}

function validPlan(input, id) {
    const name = typeof input.name === "string" ? input.name.trim().slice(0, 60) : "";
    const description = typeof input.description === "string" ? input.description.trim().slice(0, 180) : "";
    const period = typeof input.period === "string" ? input.period.trim().slice(0, 32) : "";
    const features = Array.isArray(input.features) ? input.features.filter((item) => typeof item === "string").map((item) => item.trim().slice(0, 100)).filter(Boolean).slice(0, 20) : [];
    const price = Number(input.price);
    if (!name || !description || !Number.isFinite(price) || price < 0 || price > 1_000_000 || features.length === 0) return null;
    return { id, name, description, price, period, features, featured: Boolean(input.featured) };
}

function makeOrderId() {
    return `coffee_${Date.now()}_${randomBytes(8).toString("hex")}`;
}

function makePaytrToken({ merchantId, merchantKey, merchantSalt, userIp, merchantOid, email, amount, basket, testMode, currency = "TL" }) {
    const noInstallment = 1;
    const maxInstallment = 0;
    const hashInput = `${merchantId}${userIp}${merchantOid}${email}${amount}${basket}${noInstallment}${maxInstallment}${currency}${testMode}`;
    return createHmac("sha256", merchantKey).update(`${hashInput}${merchantSalt}`).digest("base64");
}

function getRemoteAddress(request) {
    if (process.env.TRUST_PROXY === "true") {
        const forwarded = request.headers["x-forwarded-for"]?.split(",")[0]?.trim();
        if (forwarded) return forwarded;
    }
    return request.socket.remoteAddress || "127.0.0.1";
}

function timingSafeHashEqual(received, expected) {
    const receivedBuffer = Buffer.from(received || "");
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function hasExpectedOrigin(request, response, expectedOrigin) {
    const requestOrigin = request.headers.origin;
    if (!requestOrigin || requestOrigin === expectedOrigin) return true;
    sendJson(response, 403, { error: "İstek kaynağı doğrulanamadı." });
    return false;
}

async function serveStatic(pathname, response) {
    const decodedPath = decodeURIComponent(pathname);
    const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
    const normalizedPath = normalize(relativePath);
    const filePath = resolve(projectRoot, normalizedPath);
    if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${sep}`)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }
    const relativeToRoot = filePath.slice(projectRoot.length + 1);
    if (relativeToRoot.startsWith(".") || filePath.startsWith(`${resolve(projectRoot, "backend")}${sep}`)) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }
    try {
        const body = await readFile(filePath);
        response.writeHead(200, {
            "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
            "x-content-type-options": "nosniff",
            "x-frame-options": "DENY",
            "referrer-policy": "strict-origin-when-cross-origin",
            "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://www.paytr.com; frame-src https://www.paytr.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.paytr.com",
            "cache-control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=3600"
        });
        response.end(body);
    } catch {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
    }
}

async function handlePaytrNotification(request, response) {
    const body = await readRequestBody(request);
    const payload = Object.fromEntries(new URLSearchParams(body));
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
    if (!merchantKey || !merchantSalt || !payload.merchant_oid || !payload.status || !payload.total_amount || !payload.hash) {
        response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        response.end("Invalid notification");
        return;
    }

    const expectedHash = createHmac("sha256", merchantKey)
        .update(`${payload.merchant_oid}${merchantSalt}${payload.status}${payload.total_amount}`)
        .digest("base64");
    if (!timingSafeHashEqual(payload.hash, expectedHash)) {
        response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        response.end("Invalid hash");
        return;
    }

    const orders = await readJson(ordersPath, {});
    const order = orders[payload.merchant_oid];
    if (!order || !["success", "failed"].includes(payload.status)) {
        response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        response.end("Unknown order");
        return;
    }
    if (order.status === "pending") {
        if (payload.status === "success" && Number(payload.total_amount) !== order.amount * 100) {
            response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
            response.end("Amount mismatch");
            return;
        }
        order.status = payload.status === "success" ? "paid" : "failed";
        order.totalAmount = payload.total_amount;
        order.currency = payload.currency || "TL";
        order.paymentType = payload.payment_type || "";
        order.updatedAt = new Date().toISOString();
        await writeJson(ordersPath, orders);
    }
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("OK");
}

async function handler(request, response) {
    const url = new URL(request.url, baseUrl);
    if (request.method === "GET" && url.pathname === "/api/health") return sendJson(response, 200, { status: "ok" });

    if (request.method === "GET" && url.pathname === "/api/packages") {
        const plans = await readJson(packagesPath, starterPlans);
        return sendJson(response, 200, { plans: plans.map(publicPlan) });
    }

    if (url.pathname.startsWith("/api/auth/") || url.pathname.startsWith("/api/trades")) {
        if (!encryptionConfigured()) return sendJson(response, 503, { error: "Kişisel hesap alanı için APP_ENCRYPTION_KEY ayarlanmalı. README kurulum adımlarını izle." });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const address = getRemoteAddress(request);
        const attemptKey = `register:${address}`;
        const attempts = authAttempts.get(attemptKey) || { count: 0, resetAt: Date.now() + 60 * 60_000 };
        if (attempts.resetAt <= Date.now()) { attempts.count = 0; attempts.resetAt = Date.now() + 60 * 60_000; }
        if (attempts.count >= 8) return sendJson(response, 429, { error: "Kayıt deneme sınırı aşıldı. Daha sonra tekrar dene." });
        const input = await readRequestData(request);
        const name = typeof input.name === "string" ? input.name.trim().slice(0, 100) : "";
        const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
        const phone = typeof input.phone === "string" ? input.phone.trim().slice(0, 32) : "";
        const password = typeof input.password === "string" ? input.password : "";
        const markets = Array.isArray(input.markets) ? [...new Set(input.markets.filter((market) => typeof market === "string").map((market) => market.slice(0, 40)))].slice(0, 10) : [];
        const symbols = Array.isArray(input.symbols) ? [...new Set(input.symbols.filter((symbol) => typeof symbol === "string").map((symbol) => symbol.trim().toUpperCase().slice(0, 24)).filter(Boolean))].slice(0, 30) : [];
        const intensity = new Set(["occasional", "weekly", "daily", "multiple_daily"]).has(input.intensity) ? input.intensity : "occasional";
        if (!name || name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150 || password.length < 12 || phone.length < 6 || markets.length === 0 || input.privacyAccepted !== true) {
            attempts.count += 1;
            authAttempts.set(attemptKey, attempts);
            return sendJson(response, 400, { error: "Ad, e-posta, telefon, en az 12 karakterli şifre, piyasa seçimi ve gizlilik onayı gerekli." });
        }

        const id = randomUUID();
        const normalizedEmail = email;
        const emailIndex = emailLookup(normalizedEmail);
        const passwordSalt = randomBytes(16);
        const passwordHash = await scryptAsync(password, passwordSalt, 64);
        const userDek = randomBytes(32);
        const profile = { name, email: normalizedEmail, phone, preferences: { markets, intensity, symbols, currency: ["TRY", "USD", "EUR"].includes(input.currency) ? input.currency : "TRY" }, privacyAcceptedAt: new Date().toISOString(), trades: [] };
        const record = {
            id,
            emailIndex,
            passwordSalt: passwordSalt.toString("base64"),
            passwordHash: Buffer.from(passwordHash).toString("base64"),
            wrappedDek: encryptJson({ key: userDek.toString("base64") }, dekWrappingKey, userDatabaseKey(id, "dek")),
            vault: encryptJson(profile, userDek, userDatabaseKey(id, "vault")),
            createdAt: new Date().toISOString()
        };

        const registration = await mutateUserDatabase((users) => {
            if (Object.values(users).some((existing) => existing.emailIndex === emailIndex)) return { duplicate: true };
            users[id] = record;
            return { duplicate: false };
        });
        if (registration.duplicate) return sendJson(response, 409, { error: "Bu e-posta adresiyle zaten hesap var." });
        const token = randomBytes(32).toString("base64url");
        const csrfToken = randomBytes(24).toString("base64url");
        userSessions.set(token, { userId: id, csrfToken, expiresAt: Date.now() + 7 * 24 * 60 * 60_000 });
        const secureCookie = new URL(baseUrl).protocol === "https:" ? "; Secure" : "";
        response.writeHead(201, { "content-type": "application/json; charset=utf-8", "set-cookie": `ledgerly_user=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secureCookie}`, "cache-control": "no-store" });
        response.end(JSON.stringify({ csrfToken, profile: { id, ...profile, trades: undefined } }));
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const address = getRemoteAddress(request);
        const attemptKey = `login:${address}`;
        const attempts = authAttempts.get(attemptKey) || { count: 0, resetAt: Date.now() + 15 * 60_000 };
        if (attempts.resetAt <= Date.now()) { attempts.count = 0; attempts.resetAt = Date.now() + 15 * 60_000; }
        if (attempts.count >= 10) return sendJson(response, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar dene." });
        const input = await readRequestData(request);
        const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
        const users = await readJson(usersPath, {});
        const record = Object.values(users).find((user) => user.emailIndex === emailLookup(email));
        const salt = record ? Buffer.from(record.passwordSalt, "base64") : Buffer.alloc(16);
        const expectedHash = record ? Buffer.from(record.passwordHash, "base64") : Buffer.alloc(64);
        const suppliedHash = Buffer.from(await scryptAsync(typeof input.password === "string" ? input.password : "", salt, 64));
        const valid = record && suppliedHash.length === expectedHash.length && timingSafeEqual(suppliedHash, expectedHash);
        if (!valid) {
            attempts.count += 1;
            authAttempts.set(attemptKey, attempts);
            return sendJson(response, 401, { error: "E-posta veya şifre hatalı." });
        }
        const token = randomBytes(32).toString("base64url");
        const csrfToken = randomBytes(24).toString("base64url");
        userSessions.set(token, { userId: record.id, csrfToken, expiresAt: Date.now() + 7 * 24 * 60 * 60_000 });
        authAttempts.delete(attemptKey);
        const { vault } = readUserVault(record);
        const secureCookie = new URL(baseUrl).protocol === "https:" ? "; Secure" : "";
        response.writeHead(200, { "content-type": "application/json; charset=utf-8", "set-cookie": `ledgerly_user=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secureCookie}`, "cache-control": "no-store" });
        response.end(JSON.stringify({ csrfToken, profile: { id: record.id, name: vault.name, email: vault.email, phone: vault.phone, preferences: vault.preferences } }));
        return;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const session = currentUser(request);
        if (!session) return sendJson(response, 401, { error: "Oturum açılmamış." });
        const user = await readUserProfile(session);
        if (!user) return sendJson(response, 401, { error: "Kullanıcı bulunamadı." });
        return sendJson(response, 200, { csrfToken: session.csrfToken, profile: { id: session.userId, name: user.vault.name, email: user.vault.email, phone: user.vault.phone, preferences: user.vault.preferences } });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        const session = currentUser(request);
        if (session && !userCsrfValid(request, response, session)) return;
        if (session) userSessions.delete(session.token);
        const secureCookie = new URL(baseUrl).protocol === "https:" ? "; Secure" : "";
        response.writeHead(200, { "content-type": "application/json; charset=utf-8", "set-cookie": `ledgerly_user=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}`, "cache-control": "no-store" });
        response.end(JSON.stringify({ ok: true }));
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/forgot-password") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const address = getRemoteAddress(request);
        const attemptKey = `forgot:${address}`;
        const attempts = authAttempts.get(attemptKey) || { count: 0, resetAt: Date.now() + 15 * 60_000 };
        if (attempts.resetAt <= Date.now()) { attempts.count = 0; attempts.resetAt = Date.now() + 15 * 60_000; }
        if (attempts.count >= 6) return sendJson(response, 429, { error: "Çok fazla şifre sıfırlama talebi. Lütfen daha sonra tekrar deneyin." });
        
        const input = await readRequestData(request);
        const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
            attempts.count += 1;
            authAttempts.set(attemptKey, attempts);
            return sendJson(response, 400, { error: "Geçerli bir e-posta adresi girin." });
        }

        const users = await readJson(usersPath, {});
        const emailIdx = emailLookup(email);
        const record = Object.values(users).find((user) => user.emailIndex === emailIdx);

        let debugToken = null;
        if (record) {
            const token = randomBytes(32).toString("base64url");
            passwordResetTokens.set(token, {
                userId: record.id,
                email,
                expiresAt: Date.now() + 60 * 60_000
            });
            debugToken = token;
            console.log(`[Ledgerly Security] Şifre sıfırlama talep edildi: ${email}. Token: ${token}`);
        }

        return sendJson(response, 200, {
            ok: true,
            message: "Eğer bu e-posta adresi sistemimizde kayıtlı ise, şifre sıfırlama bağlantısı oluşturuldu.",
            resetToken: (!process.env.SMTP_HOST || process.env.NODE_ENV !== "production") ? debugToken : undefined
        });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/reset-password") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const address = getRemoteAddress(request);
        const attemptKey = `reset:${address}`;
        const attempts = authAttempts.get(attemptKey) || { count: 0, resetAt: Date.now() + 15 * 60_000 };
        if (attempts.resetAt <= Date.now()) { attempts.count = 0; attempts.resetAt = Date.now() + 15 * 60_000; }
        if (attempts.count >= 8) return sendJson(response, 429, { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." });

        const input = await readRequestData(request);
        const token = typeof input.token === "string" ? input.token.trim() : "";
        const newPassword = typeof input.password === "string" ? input.password : "";

        if (!token || !newPassword || newPassword.length < 12) {
            attempts.count += 1;
            authAttempts.set(attemptKey, attempts);
            return sendJson(response, 400, { error: "Geçersiz istek. Şifre en az 12 karakter olmalıdır." });
        }

        const resetData = passwordResetTokens.get(token);
        if (!resetData || resetData.expiresAt < Date.now()) {
            attempts.count += 1;
            authAttempts.set(attemptKey, attempts);
            if (resetData) passwordResetTokens.delete(token);
            return sendJson(response, 400, { error: "Şifre sıfırlama kodu geçersiz veya süresi dolmuş." });
        }

        const newSalt = randomBytes(16);
        const newHash = await scryptAsync(newPassword, newSalt, 64);

        const updated = await mutateUserDatabase((users) => {
            const user = users[resetData.userId];
            if (!user) return false;
            user.passwordSalt = newSalt.toString("base64");
            user.passwordHash = Buffer.from(newHash).toString("base64");
            user.updatedAt = new Date().toISOString();
            return true;
        });

        if (!updated) {
            return sendJson(response, 404, { error: "Kullanıcı hesabı bulunamadı." });
        }

        passwordResetTokens.delete(token);

        for (const [sessToken, sess] of userSessions.entries()) {
            if (sess.userId === resetData.userId) {
                userSessions.delete(sessToken);
            }
        }

        return sendJson(response, 200, {
            ok: true,
            message: "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz."
        });
    }

    if (url.pathname === "/api/trades" || url.pathname.startsWith("/api/trades/")) {
        const session = currentUser(request);
        if (!session) return sendJson(response, 401, { error: "Oturum açman gerekiyor." });
        const user = await readUserProfile(session);
        if (!user) return sendJson(response, 401, { error: "Kullanıcı bulunamadı." });
        if (request.method === "GET" && url.pathname === "/api/trades") return sendJson(response, 200, { trades: user.vault.trades || [] });
        if (!["GET", "HEAD"].includes(request.method) && !userCsrfValid(request, response, session)) return;

        if (request.method === "POST" && url.pathname === "/api/trades") {
            const input = await readRequestData(request);
            const trade = validateTrade(input, randomUUID());
            if (!trade) return sendJson(response, 400, { error: "Piyasa, parite, yön, pozitif giriş fiyatı ve miktar gerekli." });
            await mutateUserVault(session.userId, (vault) => { vault.trades.unshift(trade); });
            return sendJson(response, 201, { trade });
        }

        const tradeId = decodeURIComponent(url.pathname.split("/").at(-1));
        const tradeIndex = (user.vault.trades || []).findIndex((trade) => trade.id === tradeId);
        if (tradeIndex < 0) return sendJson(response, 404, { error: "İşlem bulunamadı." });
        if (request.method === "PUT") {
            const input = await readRequestData(request);
            const trade = validateTrade(input, tradeId, user.vault.trades[tradeIndex]);
            if (!trade) return sendJson(response, 400, { error: "Piyasa, parite, yön, pozitif giriş fiyatı ve miktar gerekli." });
            await mutateUserVault(session.userId, (vault) => {
                const index = vault.trades.findIndex((entry) => entry.id === tradeId);
                if (index >= 0) vault.trades[index] = trade;
            });
            return sendJson(response, 200, { trade });
        }
        if (request.method === "DELETE") {
            await mutateUserVault(session.userId, (vault) => {
                const index = vault.trades.findIndex((entry) => entry.id === tradeId);
                if (index >= 0) vault.trades.splice(index, 1);
            });
            return sendJson(response, 200, { ok: true });
        }
    }

    if (request.method === "POST" && url.pathname === "/api/admin/login") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const address = getRemoteAddress(request);
        const attempts = loginAttempts.get(address) || { count: 0, resetAt: Date.now() + 15 * 60_000 };
        if (attempts.resetAt <= Date.now()) { attempts.count = 0; attempts.resetAt = Date.now() + 15 * 60_000; }
        if (attempts.count >= 10) return sendJson(response, 429, { error: "Çok fazla giriş denemesi. Bir süre sonra tekrar dene." });
        const credentials = await readRequestData(request);
        const expectedUsername = process.env.ADMIN_USERNAME;
        const expectedPassword = process.env.ADMIN_PASSWORD;
        if (!expectedUsername || !expectedPassword) return sendJson(response, 503, { error: "Admin kullanıcı bilgileri .env içinde ayarlanmamış." });
        const valid = timingSafeTextEqual(String(credentials.username || ""), expectedUsername)
            && timingSafeTextEqual(String(credentials.password || ""), expectedPassword);
        if (!valid) {
            attempts.count += 1;
            loginAttempts.set(address, attempts);
            return sendJson(response, 401, { error: "Kullanıcı adı veya şifre hatalı." });
        }
        loginAttempts.delete(address);
        const token = randomBytes(32).toString("base64url");
        sessions.set(token, Date.now() + 8 * 60 * 60_000);
        response.writeHead(200, { "content-type": "application/json; charset=utf-8", "set-cookie": `${sessionCookie}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${url.protocol === "https:" ? "; Secure" : ""}`, "cache-control": "no-store" });
        response.end(JSON.stringify({ ok: true }));
        return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/session") {
        return sendJson(response, isAdmin(request) ? 200 : 401, { authenticated: isAdmin(request) });
    }

    if (request.method === "POST" && url.pathname === "/api/admin/logout") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const token = parseCookies(request)[sessionCookie];
        if (token) sessions.delete(token);
        response.writeHead(200, { "content-type": "application/json; charset=utf-8", "set-cookie": `${sessionCookie}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${url.protocol === "https:" ? "; Secure" : ""}`, "cache-control": "no-store" });
        response.end(JSON.stringify({ ok: true }));
        return;
    }

    if (url.pathname.startsWith("/api/admin/")) {
        if (!isAdmin(request)) return sendJson(response, 401, { error: "Oturum açman gerekiyor." });
        if (request.method === "GET" && url.pathname === "/api/admin/packages") {
            const plans = await readJson(packagesPath, starterPlans);
            return sendJson(response, 200, { plans });
        }
        if (request.method === "POST" && url.pathname === "/api/admin/packages") {
            if (!hasExpectedOrigin(request, response, baseUrl)) return;
            const input = await readRequestData(request);
            const id = typeof input.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(input.id) ? input.id : randomUUID();
            const plan = validPlan(input, id);
            if (!plan) return sendJson(response, 400, { error: "Paket adı, açıklama, geçerli fiyat ve en az bir özellik gerekli." });
            const plans = await readJson(packagesPath, starterPlans);
            const planIndex = plans.findIndex((entry) => entry.id === id);
            if (planIndex === -1) plans.push(plan);
            else plans[planIndex] = plan;
            await writeJson(packagesPath, plans);
            return sendJson(response, 200, { plan });
        }
        if (request.method === "DELETE" && /^\/api\/admin\/packages\/[a-zA-Z0-9_-]{1,80}$/.test(url.pathname)) {
            if (!hasExpectedOrigin(request, response, baseUrl)) return;
            const id = decodeURIComponent(url.pathname.split("/").at(-1));
            const plans = await readJson(packagesPath, starterPlans);
            await writeJson(packagesPath, plans.filter((plan) => plan.id !== id));
            return sendJson(response, 200, { ok: true });
        }
    }

    if (request.method === "POST" && url.pathname === "/api/payments/paytr/create") {
        if (!hasExpectedOrigin(request, response, baseUrl)) return;
        const merchantId = process.env.PAYTR_MERCHANT_ID;
        const merchantKey = process.env.PAYTR_MERCHANT_KEY;
        const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
        if (!merchantId || !merchantKey || !merchantSalt) return sendJson(response, 503, { error: "PayTR bilgileri .env içinde ayarlanmamış." });
        const input = await readRequestData(request);
        const amount = Number(input.amount);
        const email = String(input.email || "").trim().toLowerCase();
        let currency = String(input.currency || "TL").trim().toUpperCase();
        if (currency === "TRY") currency = "TL";
        const allowedCurrencies = new Set(["TL", "USD", "EUR"]);
        if (!allowedCurrencies.has(currency)) currency = "TL";

        const minAmount = currency === "TL" ? 25 : 1;
        const maxAmount = currency === "TL" ? 50_000 : 5_000;
        if (!Number.isInteger(amount) || amount < minAmount || amount > maxAmount) {
            return sendJson(response, 400, {
                error: currency === "TL"
                    ? "Destek tutarı 25 TL ile 50.000 TL arasında tam sayı olmalı."
                    : `Destek tutarı 1 ile 5.000 ${currency} arasında tam sayı olmalı.`
            });
        }
        if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(response, 400, { error: "Geçerli bir e-posta adresi gerekli." });

        const merchantOid = makeOrderId();
        const paymentAmount = String(amount * 100);
        const itemName = currency === "TL"
            ? (coffeeAmountOptions.has(amount) ? "Ledgerly kahve desteği" : "Ledgerly özel destek")
            : "Ledgerly coffee support";
        const basket = Buffer.from(JSON.stringify([[itemName, amount.toFixed(2), 1]])).toString("base64");
        const testMode = process.env.PAYTR_TEST_MODE === "0" ? "0" : "1";
        const token = makePaytrToken({ merchantId, merchantKey, merchantSalt, userIp: getRemoteAddress(request), merchantOid, email, amount: paymentAmount, basket, testMode, currency });
        const params = new URLSearchParams({
            merchant_id: merchantId,
            user_ip: getRemoteAddress(request),
            merchant_oid: merchantOid,
            email,
            payment_amount: paymentAmount,
            paytr_token: token,
            user_basket: basket,
            debug_on: testMode,
            no_installment: "1",
            max_installment: "0",
            merchant_ok_url: `${baseUrl}/pages/payment-result.html?order=${encodeURIComponent(merchantOid)}`,
            merchant_fail_url: `${baseUrl}/pages/payment-result.html?order=${encodeURIComponent(merchantOid)}`,
            timeout_limit: "30",
            currency,
            test_mode: testMode,
            lang: ["tr", "en"].includes((input.lang || "").toLowerCase()) ? input.lang.toLowerCase() : (currency === "TL" ? "tr" : "en")
        });

        const paytrResponse = await fetch("https://www.paytr.com/odeme/api/get-token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: params, signal: AbortSignal.timeout(20_000) });
        const paytrResult = await paytrResponse.json();
        if (!paytrResponse.ok || paytrResult.status !== "success" || typeof paytrResult.token !== "string") {
            console.error("PayTR token request failed", paytrResult.reason || paytrResponse.status);
            return sendJson(response, 502, { error: "PayTR ödeme oturumu oluşturulamadı. Mağaza ayarlarını kontrol edip tekrar deneyin." });
        }

        const orders = await readJson(ordersPath, {});
        orders[merchantOid] = { id: merchantOid, amount, currency, status: "pending", createdAt: new Date().toISOString() };
        await writeJson(ordersPath, orders);
        return sendJson(response, 200, { iframeUrl: `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(paytrResult.token)}`, merchantOid });
    }

    if (request.method === "POST" && url.pathname === "/api/payments/paytr/notify") return handlePaytrNotification(request, response);

    if (request.method === "GET" && /^\/api\/payments\/status\/[a-zA-Z0-9_-]{1,100}$/.test(url.pathname)) {
        const orderId = decodeURIComponent(url.pathname.split("/").at(-1));
        const orders = await readJson(ordersPath, {});
        const order = orders[orderId];
        if (!order) return sendJson(response, 404, { error: "Sipariş bulunamadı." });
        return sendJson(response, 200, { status: order.status });
    }

    if (request.method === "GET") return serveStatic(url.pathname, response);
    return sendJson(response, 404, { error: "Not found" });
}

await mkdir(dataDirectory, { recursive: true });
if (!existsSync(packagesPath)) await writeJson(packagesPath, starterPlans);
if (!existsSync(ordersPath)) await writeJson(ordersPath, {});

const server = createServer((request, response) => {
    handler(request, response).catch((error) => {
        console.error("Request failed", error);
        if (!response.headersSent) sendJson(response, 500, { error: "Sunucu isteği tamamlayamadı." });
        else response.destroy();
    });
});

server.listen(port, () => console.log(`Ledgerly is running at ${baseUrl}`));
