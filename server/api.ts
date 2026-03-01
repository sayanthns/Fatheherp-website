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

        leads[leadIndex].status = status;
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

// 2. Perform Login with Password + TOTP
apiRouter.post("/login", (req, res) => {
    const { password, token } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const settings = getSettings();

    // If 2FA isn't configured yet, send a special response telling the frontend to show the setup screen
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

    const jwtToken = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.status(200).json({ success: true, token: jwtToken, message: "Logged in successfully" });
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
        const leads = JSON.parse(leadsData);
        res.status(200).json({ success: true, leads });
    } catch (error) {
        console.error("Error reading leads:", error);
        res.status(500).json({ success: false, message: "Failed to read leads" });
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
