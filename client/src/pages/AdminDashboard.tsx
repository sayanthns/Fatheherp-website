import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LogOut, RefreshCcw, User, Building2, Phone, MapPin, CalendarDays, Download, Activity, CheckCircle2, Inbox, ChevronLeft, ChevronRight, MessageSquare, Settings, Star, Plus, Trash2, Edit, LayoutDashboard, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Lead {
    id: string;
    name: string;
    businessName: string;
    phoneNumber?: string;
    phone?: string;
    location: string;
    source?: string;
    date: string;
    status?: "New" | "Contacted" | "Converted" | "Spam" | "Failed";
    comment?: string;
}

interface Testimonial {
    id: string;
    quote: string;
    name: string;
    role: string;
    company: string;
    rating: number;
}

interface AdminUser {
    id: string;
    username: string;
    role: string;
    created: string;
}

export default function AdminDashboard() {
    const [, setLocation] = useLocation();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"dashboard" | "leads" | "testimonials" | "users" | "settings">("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Authentication Context
    const [adminRole, setAdminRole] = useState<"super_admin" | "user">("user");
    const [adminUsername, setAdminUsername] = useState("");

    // Analytics Data
    const [analytics, setAnalytics] = useState<{ visits: { date: string, path: string }[] }>({ visits: [] });

    // Users Data
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Comments Modal
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [commentText, setCommentText] = useState("");
    const [savingComment, setSavingComment] = useState(false);

    // Settings Modal
    const [settingsData, setSettingsData] = useState({ calendlyUrl: "" });
    const [savingSettings, setSavingSettings] = useState(false);

    // Testimonials
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [testimonialFormOpen, setTestimonialFormOpen] = useState(false);
    const [savingTestimonial, setSavingTestimonial] = useState(false);

    // Initial Auth Decoding & Data Fetching
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            setLocation("/admin");
            return;
        }

        try {
            // Very simple JWT role decode for UI purposes (Backend still strictly verifies)
            const payload = JSON.parse(atob(token.split('.')[1]));
            setAdminRole(payload.role);
            setAdminUsername(payload.username || "Admin");
        } catch (e) {
            setLocation("/admin");
            return;
        }

        fetchLeads();
        fetchSettings();
        fetchTestimonials();
        fetchAnalytics();
        fetchUsers();
    }, [setLocation]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const getHeaders = () => ({
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "application/json"
    });

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/analytics", { headers: getHeaders() });
            const data = await res.json();
            if (data.success) setAnalytics(data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users", { headers: getHeaders() });
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (err) { console.error(err); }
    };

    const fetchLeads = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/leads", { headers: getHeaders() });

            // Handle unauthorized dummy tokens gracefully in dev
            if (res.status === 401 || res.status === 403) {
                setLoading(false);
                setError("Unauthorized Action");
                return;
            }

            const data = await res.json();

            if (data.success) {
                const sortedLeads = data.leads.sort((a: Lead, b: Lead) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setLeads(sortedLeads);
            } else {
                setError(data.message || "Failed to fetch leads");
            }
        } catch (err) {
            setError("Failed to fetch leads");
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings", { headers: getHeaders() });
            const data = await res.json();
            if (data.success && data.settings) {
                setSettingsData(data.settings);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTestimonials = async () => {
        try {
            const res = await fetch("/api/testimonials");
            const data = await res.json();
            if (data.success) {
                setTestimonials(data.testimonials);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setLocation("/admin");
    };

    const handleStatusUpdate = async (leadId: string, newStatus: string) => {
        setUpdatingId(leadId);
        try {
            const res = await fetch(`/api/leads/${leadId}/status`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: newStatus as any } : lead));
            } else {
                setError("Failed to update status");
            }
        } catch (err) {
            setError("Error connecting to server");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaveComment = async () => {
        if (!selectedLead) return;
        setSavingComment(true);
        try {
            const res = await fetch(`/api/leads/${selectedLead.id}/comment`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ comment: commentText })
            });

            if (res.ok) {
                const updated = { ...selectedLead, comment: commentText };
                setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                setSelectedLead(updated);
            } else {
                setError("Failed to save comment");
            }
        } catch (err) {
            setError("Error connecting to server");
        } finally {
            setSavingComment(false);
        }
    };

    const exportToCSV = () => {
        if (leads.length === 0) return;

        const headers = ["Date", "Name", "Business Name", "Phone", "Location", "Source", "Status"];
        const rows = filteredLeads.map(lead => [
            new Date(lead.date).toLocaleString(),
            `"${lead.name.replace(/"/g, '""')}"`,
            `"${(lead.businessName || "").replace(/"/g, '""')}"`,
            `"${lead.phoneNumber || lead.phone || ""}"`,
            `"${(lead.location || "").replace(/"/g, '""')}"`,
            lead.source || "Web Form",
            lead.status || "New"
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fateh_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        }).format(d);
    };

    const metrics = {
        total: leads.length,
        new: leads.filter(l => (l.status || "New") === "New").length,
        contacted: leads.filter(l => l.status === "Contacted").length,
        converted: leads.filter(l => l.status === "Converted").length,
    };

    // Calculate visits per day for chart
    const getChartData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dataMap = last7Days.reduce((acc, date) => ({ ...acc, [date]: 0 }), {} as Record<string, number>);

        analytics.visits.forEach(v => {
            const dateStr = v.date.split('T')[0];
            if (dataMap[dateStr] !== undefined) {
                dataMap[dateStr]++;
            }
        });

        return Object.entries(dataMap).map(([date, count]) => ({
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            visits: count
        }));
    };

    const filteredLeads = statusFilter === "All" ? leads : leads.filter(l => (l.status || "New") === statusFilter);
    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Sidebar Navigation Items
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "leads", label: "Leads", icon: Inbox },
        { id: "testimonials", label: "Testimonials", icon: Star },
        ...(adminRole === "super_admin" ? [{ id: "users", label: "Users", icon: Users }] : []),
        { id: "settings", label: "Settings", icon: Settings },
    ] as const;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-body text-slate-900">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-navy text-white transition-all duration-300 flex flex-col`}>
                <div className="h-16 flex items-center justify-between px-4 bg-navy-light/30 border-b border-white/10">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2 font-display font-bold text-lg">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">F</div>
                            <span>Fateh ERP</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors mx-auto">
                        <Menu className="w-5 h-5 text-slate-300" />
                    </button>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto px-3">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h1 className="font-display font-bold text-xl text-slate-800 capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{adminUsername}</span>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === "dashboard" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4"><Inbox className="w-6 h-6" /></div>
                                    <p className="text-sm font-medium text-slate-500">Total Leads</p><h3 className="text-2xl font-bold text-slate-900">{metrics.total}</h3>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4"><Activity className="w-6 h-6" /></div>
                                    <p className="text-sm font-medium text-slate-500">New Leads</p><h3 className="text-2xl font-bold text-slate-900">{metrics.new}</h3>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4"><Phone className="w-6 h-6" /></div>
                                    <p className="text-sm font-medium text-slate-500">Contacted</p><h3 className="text-2xl font-bold text-slate-900">{metrics.contacted}</h3>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4"><CheckCircle2 className="w-6 h-6" /></div>
                                    <p className="text-sm font-medium text-slate-500">Converted</p><h3 className="text-2xl font-bold text-slate-900">{metrics.converted}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="font-display font-semibold text-lg text-slate-800 mb-6">Website Visits (Last 7 Days)</h3>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                                                />
                                                <Line type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                        <Activity className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-4xl font-display font-bold text-slate-900 mb-2">{analytics.visits.length}</h3>
                                    <p className="text-slate-500 font-medium">Total Lifetime Page Views</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "leads" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50 shrink-0">
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={exportToCSV} disabled={leads.length === 0} className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="gap-2">
                                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-600">Filter Status:</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="text-sm border-slate-300 rounded-lg bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 border"
                                    >
                                        <option value="All">All Leads</option>
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Spam">Spam</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                </div>
                            </div>

                            {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-medium border-b border-red-100 shrink-0">{error}</div>}

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-body font-semibold text-slate-700 text-sm whitespace-nowrap">Contact Info</th>
                                            <th className="px-6 py-3 font-body font-semibold text-slate-700 text-sm whitespace-nowrap">Business</th>
                                            <th className="px-6 py-3 font-body font-semibold text-slate-700 text-sm whitespace-nowrap">Location</th>
                                            <th className="px-6 py-3 font-body font-semibold text-slate-700 text-sm whitespace-nowrap">Source/Date</th>
                                            <th className="px-6 py-3 font-body font-semibold text-slate-700 text-sm whitespace-nowrap">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading leads...</td></tr>
                                        ) : paginatedLeads.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No leads found.</td></tr>
                                        ) : (
                                            paginatedLeads.map((lead) => (
                                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 cursor-pointer align-top" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full mt-0.5 bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors">{lead.name}</div>
                                                                {(lead.phoneNumber || lead.phone) && (
                                                                    <div className="text-slate-500 text-xs flex items-center mt-1">
                                                                        <Phone className="w-3 h-3 mr-1" />
                                                                        {lead.phoneNumber || lead.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 cursor-pointer align-top" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="flex items-center text-slate-700 text-sm">
                                                            <Building2 className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                                                            <span className="line-clamp-2">{lead.businessName || <span className="text-slate-400 italic">Not provided</span>}</span>
                                                        </div>
                                                        {lead.comment && (
                                                            <div className="flex items-start text-slate-500 text-xs mt-2 p-2 bg-amber-50 rounded border border-amber-100">
                                                                <MessageSquare className="w-3 h-3 mr-1.5 shrink-0 mt-0.5 text-amber-500" />
                                                                <span className="line-clamp-2">{lead.comment}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 cursor-pointer align-top" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="flex items-center text-slate-700 text-sm">
                                                            <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                                                            <span className="line-clamp-2">{lead.location || <span className="text-slate-400 italic">Not provided</span>}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 cursor-pointer align-top" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="text-sm">
                                                            <span className="inline-flex items-center px-2 py-1 rounded border border-slate-200 bg-white shadow-sm text-slate-600 text-xs font-medium mb-1.5">
                                                                {lead.source || "Web Form"}
                                                            </span>
                                                            <div className="flex items-center text-slate-500 text-xs">
                                                                <CalendarDays className="w-3 h-3 mr-1 shrink-0" />
                                                                {formatDate(lead.date)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <select
                                                            value={lead.status || "New"}
                                                            disabled={updatingId === lead.id}
                                                            onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                                                            className={`text-sm border rounded-lg px-3 py-1.5 outline-none font-medium transition-colors w-full ${(lead.status || "New") === "New" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                lead.status === "Contacted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                                    lead.status === "Converted" ? "bg-green-50 text-green-700 border-green-200" :
                                                                        lead.status === "Spam" ? "bg-slate-100 text-slate-600 border-slate-300" :
                                                                            "bg-red-50 text-red-700 border-red-200"
                                                                }`}
                                                        >
                                                            <option value="New">New</option>
                                                            <option value="Contacted">Contacted</option>
                                                            <option value="Converted">Converted</option>
                                                            <option value="Spam">Spam</option>
                                                            <option value="Failed">Failed</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
                                    <div className="text-sm text-slate-500">
                                        Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> of <span className="font-medium text-slate-900">{filteredLeads.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                                            Next <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "testimonials" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-body text-slate-500">Manage client reviews shown on the public site.</p>
                                <Button onClick={() => { setEditingTestimonial(null); setTestimonialFormOpen(true); }} className="bg-primary hover:bg-primary-light">
                                    <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {testimonials.map(t => (
                                    <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col pt-8 relative mt-6 transition-all hover:shadow-md">
                                        <div className="absolute -top-6 left-6 w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-display font-bold text-lg border-4 border-slate-50 shadow-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <button onClick={() => { setEditingTestimonial(t); setTestimonialFormOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button onClick={async () => {
                                                if (!confirm("Delete this testimonial?")) return;
                                                try {
                                                    const res = await fetch(`/api/testimonials/${t.id}`, { method: "DELETE", headers: getHeaders() });
                                                    if (res.ok) setTestimonials(prev => prev.filter(x => x.id !== t.id));
                                                } catch (e) { console.error(e); }
                                            }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>

                                        <div className="flex gap-0.5 mb-3">
                                            {Array.from({ length: t.rating }).map((_, j) => (
                                                <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-slate-700 font-body text-sm leading-relaxed flex-1 italic mb-4">"{t.quote}"</p>
                                        <div>
                                            <p className="font-display font-semibold text-sm text-slate-900">{t.name}</p>
                                            <p className="text-slate-500 font-body text-xs">{t.role}, {t.company}</p>
                                        </div>
                                    </div>
                                ))}
                                {testimonials.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                                        No testimonials available. Add one to display it on the site.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "users" && adminRole === "super_admin" && (
                        <div className="max-w-4xl space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-body text-slate-500">Manage administrator access to the dashboard.</p>
                                <Button onClick={() => { setEditingUserId(null); setUserFormOpen(true); }} className="bg-primary hover:bg-primary-light">
                                    <Plus className="w-4 h-4 mr-2" /> Add User
                                </Button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Username</th>
                                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Role</th>
                                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Created</th>
                                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* Show Super Admin as a static protected row */}
                                        <tr className="bg-amber-50/30">
                                            <td className="px-6 py-4 font-medium text-amber-900">Super Admin (You)</td>
                                            <td className="px-6 py-4"><span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold uppercase tracking-wider">Super Admin</span></td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">System Default</td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-400 italic">Managed via .env</td>
                                        </tr>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-4 font-medium text-slate-900">{u.username}</td>
                                                <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium uppercase tracking-wider">{u.role}</span></td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{formatDate(u.created)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => { setEditingUserId(u.id); setUserFormOpen(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        Reset Password
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={async () => {
                                                        if (!confirm(`Delete user ${u.username}?`)) return;
                                                        const res = await fetch(`/api/users/${u.id}`, { method: "DELETE", headers: getHeaders() });
                                                        if (res.ok) fetchUsers();
                                                    }} className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800 mb-1">Global Configuration</h2>
                                <p className="text-sm text-slate-500">Settings applied across the entire public application.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Calendly Demo URL</label>
                                    <input
                                        type="url"
                                        value={settingsData.calendlyUrl}
                                        onChange={e => setSettingsData({ ...settingsData, calendlyUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="https://calendly.com/your-link"
                                    />
                                    <p className="text-xs text-slate-500">Connects the "Schedule Demo" buttons straight to your booking page.</p>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        onClick={async () => {
                                            setSavingSettings(true);
                                            try {
                                                const res = await fetch("/api/settings", {
                                                    method: "PUT",
                                                    headers: getHeaders(),
                                                    body: JSON.stringify(settingsData)
                                                });
                                                if (res.ok) alert("Settings Saved Successfully");
                                                else setError("Failed to save settings");
                                            } catch (err) { setError("Error connecting to server"); } finally { setSavingSettings(false); }
                                        }}
                                        disabled={savingSettings}
                                        className="bg-primary hover:bg-primary-light w-full sm:w-auto"
                                    >
                                        {savingSettings ? "Saving..." : "Save Configuration"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Submission Detail Modal */}
            <Dialog open={selectedLead !== null} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Lead Details</DialogTitle>
                    </DialogHeader>
                    {selectedLead && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label><div className="text-slate-900 font-medium">{selectedLead.name}</div></div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Business</label><div className="text-slate-900 font-medium">{selectedLead.businessName || "N/A"}</div></div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Phone</label><div className="text-slate-900 font-medium">{selectedLead.phoneNumber || selectedLead.phone || "N/A"}</div></div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Location</label><div className="text-slate-900 font-medium">{selectedLead.location || "N/A"}</div></div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Status</label><div className="inline-flex px-2 py-1 bg-slate-100 rounded text-sm text-slate-800 font-medium">{selectedLead.status || "New"}</div></div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Submitted</label><div className="text-slate-900 text-sm">{formatDate(selectedLead.date)}</div></div>
                            </div>
                            <hr className="border-slate-100" />
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Admin Notes / Comments</label>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add notes about this lead here..."
                                    className="w-full h-32 p-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-body"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSaveComment} disabled={savingComment || commentText === (selectedLead.comment || "")} className="bg-primary hover:bg-primary-light">
                                    {savingComment ? 'Saving...' : 'Save Notes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Testimonials Add/Edit Modal */}
            <Dialog open={testimonialFormOpen} onOpenChange={setTestimonialFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setSavingTestimonial(true);
                        const formData = new FormData(e.currentTarget);
                        const payload = {
                            name: formData.get("name"), role: formData.get("role"), company: formData.get("company"),
                            quote: formData.get("quote"), rating: Number(formData.get("rating"))
                        };
                        try {
                            const method = editingTestimonial ? "PUT" : "POST";
                            const endpoint = editingTestimonial ? `/api/testimonials/${editingTestimonial.id}` : "/api/testimonials";
                            const res = await fetch(endpoint, { method, headers: getHeaders(), body: JSON.stringify(payload) });
                            if (res.ok) { fetchTestimonials(); setTestimonialFormOpen(false); } else { alert("Failed to save testimonial."); }
                        } catch (err) { alert("Error connecting to server."); } finally { setSavingTestimonial(false); }
                    }} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Client Name</label><input name="name" required defaultValue={editingTestimonial?.name || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Rating (1-5)</label><input name="rating" type="number" min="1" max="5" required defaultValue={editingTestimonial?.rating || 5} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Job Role</label><input name="role" required defaultValue={editingTestimonial?.role || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Company</label><input name="company" required defaultValue={editingTestimonial?.company || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Testimonial Quote</label><textarea name="quote" required defaultValue={editingTestimonial?.quote || ""} className="w-full h-24 p-3 border border-slate-300 rounded-md text-sm" /></div>
                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => setTestimonialFormOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={savingTestimonial} className="bg-primary hover:bg-primary-light">{savingTestimonial ? "Saving..." : "Save Testimonial"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Users Add/Edit Modal */}
            <Dialog open={userFormOpen} onOpenChange={setUserFormOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{editingUserId ? "Reset User Password" : "Create Sub-User"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const payload = {
                            username: formData.get("username"),
                            password: formData.get("password")
                        };

                        try {
                            const method = editingUserId ? "PUT" : "POST";
                            const endpoint = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
                            const res = await fetch(endpoint, { method, headers: getHeaders(), body: JSON.stringify(payload) });
                            if (res.ok) { fetchUsers(); setUserFormOpen(false); }
                            else { const d = await res.json(); alert(d.message || "Failed to save user."); }
                        } catch (err) { alert("Error connecting to server."); }
                    }} className="space-y-4 py-4">
                        {!editingUserId && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Username</label>
                                <input name="username" required className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">New Password</label>
                            <input name="password" type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                        </div>
                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => setUserFormOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary-light">Save User</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
