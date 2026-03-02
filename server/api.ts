import express, { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiRouter = Router();

apiRouter.use(express.json());

const LEADS_FILE_PATH = path.join(__dirname, "..", "leads.json");
const SETTINGS_FILE_PATH = path.join(__dirname, "..", "settings.json");
const TESTIMONIALS_FILE_PATH = path.join(__dirname, "..", "testimonials.json");
const USERS_FILE_PATH = path.join(__dirname, "..", "users.json");
const ANALYTICS_FILE_PATH = path.join(__dirname, "..", "analytics.json");
const PRICING_FILE_PATH = path.join(__dirname, "..", "pricing.json");

const defaultSettings = {
    calendlyUrl: "https://calendly.com/fateherp",
    twoFactorSecret: "" // We will store the Google Auth secret here
};

// Environment keys (or fallbacks for easy local setup before deployment)
const JWT_SECRET = process.env.JWT_SECRET || "fateh-erp-super-secret-key-2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "XXRTFghJ00?@dfg"; // Reinstating standard password

// Ensure leads.json and settings.json exist
function initFiles() {
    if (!fs.existsSync(LEADS_FILE_PATH)) {
        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify([]), "utf-8");
    }
    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(defaultSettings, null, 2), "utf-8");
    }
    if (!fs.existsSync(TESTIMONIALS_FILE_PATH)) {
        fs.writeFileSync(TESTIMONIALS_FILE_PATH, JSON.stringify([]), "utf-8");
    }
    if (!fs.existsSync(USERS_FILE_PATH)) {
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([]), "utf-8");
    }
    if (!fs.existsSync(ANALYTICS_FILE_PATH)) {
        fs.writeFileSync(ANALYTICS_FILE_PATH, JSON.stringify({ visits: [] }), "utf-8");
    }
    if (!fs.existsSync(PRICING_FILE_PATH)) {
        const defaultPricing = { plans: [], comparisonCategories: [] };
        fs.writeFileSync(PRICING_FILE_PATH, JSON.stringify(defaultPricing, null, 2), "utf-8");
    }
}

initFiles();

function getSettings() {
    try {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, "utf-8"));
    } catch {
        return defaultSettings;
    }
}

function getTestimonials() {
    try {
        if (!fs.existsSync(TESTIMONIALS_FILE_PATH)) return [];
        return JSON.parse(fs.readFileSync(TESTIMONIALS_FILE_PATH, "utf-8"));
    } catch {
        return [];
    }
}

function getUsers() {
    try {
        if (!fs.existsSync(USERS_FILE_PATH)) return [];
        return JSON.parse(fs.readFileSync(USERS_FILE_PATH, "utf-8"));
    } catch {
        return [];
    }
}

function getAnalytics() {
    try {
        if (!fs.existsSync(ANALYTICS_FILE_PATH)) return { visits: [] };
        return JSON.parse(fs.readFileSync(ANALYTICS_FILE_PATH, "utf-8"));
    } catch {
        return { visits: [] };
    }
}

function getPricing() {
    try {
        if (!fs.existsSync(PRICING_FILE_PATH)) return { plans: [], comparisonCategories: [] };
        return JSON.parse(fs.readFileSync(PRICING_FILE_PATH, "utf-8"));
    } catch {
        return { plans: [], comparisonCategories: [] };
    }
}

// --- API ROUTES ---

// Submit a new lead
apiRouter.post("/leads", (req, res) => {
    try {
        const newLead = {
            ...req.body,
            status: "New", // Default status
            date: new Date().toISOString(),
            id: Date.now().toString()
        };
        const leadsData = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
        const leads = JSON.parse(leadsData);

        leads.push(newLead);

        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");

        res.status(200).json({ success: true, message: "Lead saved successfully" });
    } catch (error) {
        console.error("Error saving lead:", error);
        res.status(500).json({ success: false, message: "Failed to save lead" });
    }
});

// Update Lead Status
apiRouter.put("/leads/:id/status", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    } catch (e) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const leadId = req.params.id;
        const { status } = req.body;

        const leadsData = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
        const leads = JSON.parse(leadsData);

        const leadIndex = leads.findIndex((l: any) => l.id === leadId);
        if (leadIndex === -1) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        // Phase 7: Track status time for auto-purge
        leads[leadIndex].status = status;
        leads[leadIndex].statusUpdatedAt = new Date().toISOString();

        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");

        res.status(200).json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating lead status:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
});

// Add/Update Lead Comment
apiRouter.put("/leads/:id/comment", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    } catch (e) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const leadId = req.params.id;
        const { comment } = req.body;

        const leadsData = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
        const leads = JSON.parse(leadsData);

        const leadIndex = leads.findIndex((l: any) => l.id === leadId);
        if (leadIndex === -1) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        leads[leadIndex].comment = comment;
        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");

        res.status(200).json({ success: true, message: "Comment updated successfully" });
    } catch (error) {
        console.error("Error updating lead comment:", error);
        res.status(500).json({ success: false, message: "Failed to update comment" });
    }
});

// Two-Factor Authentication Endpoints

// 1. Generate QR Code (Initial Setup)
apiRouter.post("/setup-2fa", async (req, res) => {
    const { password } = req.body;

    // Must authenticate with normal password before getting a QR code
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Invalid admin password" });
    }

    const settings = getSettings();

    // If already set up, we shouldn't show it again (unless we add a reset mechanism)
    if (settings.twoFactorSecret) {
        return res.status(400).json({ success: false, message: "2FA is already configured." });
    }

    const secret = authenticator.generateSecret();
    const otpauth = `otpauth://totp/Fateh%20ERP%20Dashboard:Admin?secret=${secret}&issuer=Fateh%20ERP%20Dashboard`;

    try {
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Save the generated secret
        const newSettings = { ...settings, twoFactorSecret: secret };
        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(newSettings, null, 2), "utf-8");

        res.status(200).json({ success: true, qrCodeUrl, secret });
    } catch (err) {
        console.error("QR Code Error:", err);
        res.status(500).json({ success: false, message: "Failed to generate QR Code" });
    }
});

// 2. Perform Login with Password + TOTP (Super Admin) OR matching user credentials (Sub-user)
apiRouter.post("/login", (req, res) => {
    const { username, password, token } = req.body;

    // Is it a Super Admin attempt?
    if (password === ADMIN_PASSWORD) {
        const settings = getSettings();

        if (!settings.twoFactorSecret) {
            return res.status(403).json({
                success: false,
                message: "Setup Required",
                requiresSetup: true
            });
        }

        if (!token) {
            return res.status(400).json({ success: false, message: "Google Authenticator code required" });
        }

        const isValid = authenticator.verify({ token, secret: settings.twoFactorSecret });
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid Authentication Code" });
        }

        const jwtToken = jwt.sign({ role: "super_admin", username: "Super Admin" }, JWT_SECRET, { expiresIn: "24h" });
        return res.status(200).json({ success: true, token: jwtToken, message: "Logged in successfully as Super Admin", role: "super_admin" });
    }

    // Sub-user logic
    // We expect both 'username' and 'password' in request body if bypassing the global password
    if (username && password) {
        const users = getUsers();
        const user = users.find((u: any) => u.username === username && u.password === password);

        if (user) {
            const jwtToken = jwt.sign({ role: "user", username: user.username, id: user.id }, JWT_SECRET, { expiresIn: "24h" });
            return res.status(200).json({ success: true, token: jwtToken, message: `Logged in as ${user.username}`, role: "user" });
        }
    }

    // Default Fallback mapping Invalid
    return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// ============================================
// TESTIMONIALS API (Public GET, Protected Write)
// ============================================

// Get Testimonials (Public)
apiRouter.get("/testimonials", (req, res) => {
    res.status(200).json({ success: true, testimonials: getTestimonials() });
});

// Create Testimonial
apiRouter.post("/testimonials", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

    try { jwt.verify(authHeader.split(" ")[1], JWT_SECRET); } catch (e) { return res.status(403).json({ success: false, message: "Invalid token" }); }

    try {
        const newTestimonial = { ...req.body, id: Date.now().toString() };
        const testimonials = getTestimonials();
        testimonials.push(newTestimonial);
        fs.writeFileSync(TESTIMONIALS_FILE_PATH, JSON.stringify(testimonials, null, 2), "utf-8");
        res.status(201).json({ success: true, testimonial: newTestimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save testimonial" });
    }
});

// Update Testimonial
apiRouter.put("/testimonials/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

    try { jwt.verify(authHeader.split(" ")[1], JWT_SECRET); } catch (e) { return res.status(403).json({ success: false, message: "Invalid token" }); }

    try {
        let testimonials = getTestimonials();
        const index = testimonials.findIndex((t: any) => t.id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: "Not found" });

        testimonials[index] = { ...testimonials[index], ...req.body };
        fs.writeFileSync(TESTIMONIALS_FILE_PATH, JSON.stringify(testimonials, null, 2), "utf-8");
        res.status(200).json({ success: true, testimonial: testimonials[index] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update testimonial" });
    }
});

// Delete Testimonial
apiRouter.delete("/testimonials/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

    try { jwt.verify(authHeader.split(" ")[1], JWT_SECRET); } catch (e) { return res.status(403).json({ success: false, message: "Invalid token" }); }

    try {
        let testimonials = getTestimonials();
        const newTestimonials = testimonials.filter((t: any) => t.id !== req.params.id);
        fs.writeFileSync(TESTIMONIALS_FILE_PATH, JSON.stringify(newTestimonials, null, 2), "utf-8");
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete testimonial" });
    }
});

// Get Leads (Protected)
apiRouter.get("/leads", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    } catch (e) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const leadsData = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
        let leads = JSON.parse(leadsData);

        // Phase 7: Auto-purge leads in "Trash" older than 30 days
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        let purgedAny = false;

        leads = leads.filter((lead: any) => {
            if (lead.status === "Trash" && lead.statusUpdatedAt) {
                const timeInTrash = now - new Date(lead.statusUpdatedAt).getTime();
                if (timeInTrash > THIRTY_DAYS_MS) {
                    purgedAny = true;
                    return false;
                }
            }
            return true;
        });

        if (purgedAny) {
            fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
        }

        res.status(200).json({ success: true, leads });
    } catch (error) {
        console.error("Error reading leads:", error);
        res.status(500).json({ success: false, message: "Failed to read leads" });
    }
});

// Delete Lead Permanently (Protected restricted to Super Admin)
apiRouter.delete("/leads/:id", superAdminOnly, (req, res) => {
    try {
        const leadId = req.params.id;
        const leadsData = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
        let leads = JSON.parse(leadsData);

        const initialLength = leads.length;
        leads = leads.filter((l: any) => l.id !== leadId);

        if (leads.length === initialLength) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
        res.status(200).json({ success: true, message: "Lead completely deleted." });
    } catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({ success: false, message: "Failed to delete lead" });
    }
});

// Settings Endpoints
apiRouter.get("/settings", (req, res) => {
    res.status(200).json({ success: true, settings: getSettings() });
});

apiRouter.put("/settings", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    } catch (e) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const newSettings = { ...getSettings(), ...req.body };
        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(newSettings, null, 2), "utf-8");
        res.status(200).json({ success: true, message: "Settings saved successfully", settings: newSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save settings" });
    }
});

// ============================================
// USERS API (Super Admin Protected)
// ============================================

// Middleware to check for true super_admin 
function superAdminOnly(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
        const decoded: any = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
        if (decoded.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Super Admin only" });
        }
        next();
    } catch (e) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
}

apiRouter.get("/users", superAdminOnly, (req, res) => {
    // Strip passwords to frontend
    const users = getUsers().map((u: any) => ({ id: u.id, username: u.username, role: u.role, created: u.created }));
    res.status(200).json({ success: true, users });
});

apiRouter.post("/users", superAdminOnly, (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });

        let users = getUsers();
        if (users.some((u: any) => u.username === username)) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        const newUser = { id: Date.now().toString(), username, password, role: "user", created: new Date().toISOString() };
        users.push(newUser);
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");

        res.status(201).json({ success: true, message: "User created" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save user" });
    }
});

apiRouter.put("/users/:id", superAdminOnly, (req, res) => {
    try {
        let users = getUsers();
        const index = users.findIndex((u: any) => u.id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: "User not found" });

        // Update password if provided
        if (req.body.password) {
            users[index].password = req.body.password;
        }

        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
        res.status(200).json({ success: true, message: "User updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
});

apiRouter.delete("/users/:id", superAdminOnly, (req, res) => {
    try {
        let users = getUsers();
        const newUsers = users.filter((u: any) => u.id !== req.params.id);
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(newUsers, null, 2), "utf-8");
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
});

// ============================================
// PRICING API
// ============================================

apiRouter.get("/pricing", (req, res) => {
    res.status(200).json({ success: true, pricing: getPricing() });
});

apiRouter.put("/pricing", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    } catch (e) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const newPricing = req.body;
        fs.writeFileSync(PRICING_FILE_PATH, JSON.stringify(newPricing, null, 2), "utf-8");
        res.status(200).json({ success: true, message: "Pricing updated successfully", pricing: newPricing });
    } catch (error) {
        console.error("Error updating pricing:", error);
        res.status(500).json({ success: false, message: "Failed to update pricing" });
    }
});

// ============================================
// ANALYTICS API 
// ============================================

// Send visit log (Public)
apiRouter.post("/analytics/visit", (req, res) => {
    try {
        const { path, browser, source, campaign } = req.body;
        let analytics = getAnalytics();
        analytics.visits.push({
            date: new Date().toISOString(),
            path: path || "/",
            browser: browser || "Unknown",
            source: source || null,
            campaign: campaign || null
        });

        // Prevent huge files in local disk, keep last 10000 entries max.
        if (analytics.visits.length > 10000) {
            analytics.visits = analytics.visits.slice(analytics.visits.length - 10000);
        }

        fs.writeFileSync(ANALYTICS_FILE_PATH, JSON.stringify(analytics, null, 2), "utf-8");
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Failed to log visit:", error);
        res.status(500).json({ success: false });
    }
});

// Get visits (Protected)
apiRouter.get("/analytics", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

    try { jwt.verify(authHeader.split(" ")[1], JWT_SECRET); } catch (e) { return res.status(403).json({ success: false, message: "Invalid token" }); }

    res.status(200).json({ success: true, ...getAnalytics() });
});
