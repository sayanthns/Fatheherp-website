import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Key, QrCode, User } from "lucide-react";

export default function AdminLogin() {
    const [, setLocation] = useLocation();
    
    // Login Types
    const [loginType, setLoginType] = useState<"user" | "super_admin">("user");
    
    // Credentials
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    
    const [step, setStep] = useState<"login" | "setup">("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Setup 2FA
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = loginType === "super_admin" 
                ? { password, token: totpCode }
                : { username, password };

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                setLocation("/admin/dashboard");
            } else if (data.requiresSetup && loginType === "super_admin") {
                handleSetupRequest();
            } else {
                setError(data.message || "Invalid credentials");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleSetupRequest = async () => {
        try {
            const res = await fetch("/api/setup-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                setQrCodeUrl(data.qrCodeUrl);
                setSecret(data.secret);
                setStep("setup");
                setTotpCode(""); // clear token input for the setup phase
            } else {
                setError(data.message || "Failed to initialize setup");
            }
        } catch (err) {
            setError("Failed to fetch setup data");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {step === "setup" ? <QrCode className="w-6 h-6 text-primary" /> : <Lock className="w-6 h-6 text-primary" />}
                    </div>
                </div>
                
                <h2 className="text-2xl font-display font-bold text-center text-slate-900 mb-2">
                    {step === "setup" ? "Secure Your Account" : "Welcome Back"}
                </h2>

                {step === "login" && (
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-6 max-w-[200px] mx-auto">
                        <button
                            type="button"
                            onClick={() => { setLoginType("user"); setError(""); }}
                            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${loginType === "user" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
                        >
                            User
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginType("super_admin"); setError(""); }}
                            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${loginType === "super_admin" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
                        >
                            Admin
                        </button>
                    </div>
                )}

                <p className="text-center text-slate-500 mb-8 font-body text-sm">
                    {step === "setup"
                        ? "Scan this QR code with Google Authenticator, then enter the 6-digit code below to finish setup."
                        : loginType === "super_admin" 
                            ? "Enter the global master password and 2FA code."
                            : "Sign in with your assigned dashboard credentials."}
                </p>

                {step === "setup" && qrCodeUrl && (
                    <div className="flex flex-col items-center justify-center mb-8 space-y-4">
                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            Secret: {secret}
                        </p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    
                    {step === "login" && loginType === "user" && (
                         <div className="space-y-1.5">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required={loginType === "user"}
                                    className="h-11 pl-9"
                                />
                            </div>
                        </div>
                    )}

                    {step === "login" && (
                        <div className="space-y-1.5">
                            <Label htmlFor="password">{loginType === 'super_admin' ? 'Master Password' : 'Password'}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-11 pl-9"
                                />
                            </div>
                        </div>
                    )}

                    {(loginType === "super_admin" || step === "setup") && (
                        <div className="space-y-1.5">
                            <Label htmlFor="totpCode">Authenticator Code</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="totpCode"
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value)}
                                    placeholder="123456"
                                    required={(loginType === "super_admin" || step === "setup")}
                                    className="h-11 pl-9 text-center tracking-[0.5em] font-mono text-lg"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm font-medium pt-2">{error}</p>}

                    <div className="pt-2">
                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-light text-white" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === "setup" ? "Verify & Complete Setup" : "Sign In")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
