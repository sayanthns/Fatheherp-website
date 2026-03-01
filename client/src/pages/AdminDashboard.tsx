import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LogOut, RefreshCcw, User, Building2, Phone, MapPin, CalendarDays, Download, Activity, CheckCircle2, Inbox, ChevronLeft, ChevronRight, MessageSquare, Settings, Star, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function AdminDashboard() {
    const [, setLocation] = useLocation();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"leads" | "testimonials">("leads");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Comments Modal
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [commentText, setCommentText] = useState("");
    const [savingComment, setSavingComment] = useState(false);

    // Settings Modal
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsData, setSettingsData] = useState({ calendlyUrl: "" });
    const [savingSettings, setSavingSettings] = useState(false);

    // Testimonials
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [testimonialFormOpen, setTestimonialFormOpen] = useState(false);
    const [savingTestimonial, setSavingTestimonial] = useState(false);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const fetchLeads = async () => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("adminToken");

        if (!token) {
            setLocation("/admin");
            return;
        }

        try {
            const res = await fetch("/api/leads", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.success) {
                // Sort newest first
                const sortedLeads = data.leads.sort((a: Lead, b: Lead) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setLeads(sortedLeads);
            } else {
                localStorage.removeItem("adminToken");
                setLocation("/admin");
            }
        } catch (err) {
            setError("Failed to fetch leads");
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
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

    useEffect(() => {
        fetchLeads();
        fetchSettings();
        fetchTestimonials();
    }, [setLocation]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setLocation("/admin");
    };

    const handleStatusUpdate = async (leadId: string, newStatus: string) => {
        setUpdatingId(leadId);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`/api/leads/${leadId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
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
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`/api/leads/${selectedLead.id}/comment`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ comment: commentText })
            });

            if (res.ok) {
                const updated = { ...selectedLead, comment: commentText };
                setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                setSelectedLead(updated); // Update the modal view
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

    const filteredLeads = statusFilter === "All" ? leads : leads.filter(l => (l.status || "New") === statusFilter);
    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center overflow-hidden w-8 h-8">
                            <img
                                src="/logo.png"
                                alt="Fateh ERP Logo"
                                className="h-full w-auto object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement?.nextElementSibling?.classList.remove('hidden');
                                    target.parentElement?.classList.add('hidden');
                                }}
                            />
                        </div>
                        <div className="hidden w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold font-display">F</div>
                        <h1 className="font-display font-bold text-xl text-slate-900 ml-1">Admin Panel</h1>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("leads")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "leads" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Leads
                        </button>
                        <button
                            onClick={() => setActiveTab("testimonials")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "testimonials" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Testimonials
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={leads.length === 0} className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="gap-2">
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="gap-2 text-slate-700">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-6">
                {activeTab === "leads" ? (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Inbox className="w-6 h-6" /></div>
                                <div><p className="text-sm font-medium text-slate-500">Total Leads</p><h3 className="text-2xl font-bold text-slate-900">{metrics.total}</h3></div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Activity className="w-6 h-6" /></div>
                                <div><p className="text-sm font-medium text-slate-500">New Leads</p><h3 className="text-2xl font-bold text-slate-900">{metrics.new}</h3></div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><Phone className="w-6 h-6" /></div>
                                <div><p className="text-sm font-medium text-slate-500">Contacted</p><h3 className="text-2xl font-bold text-slate-900">{metrics.contacted}</h3></div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
                                <div><p className="text-sm font-medium text-slate-500">Converted</p><h3 className="text-2xl font-bold text-slate-900">{metrics.converted}</h3></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Header Controls */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
                                <h2 className="font-semibold text-slate-800">Recent Submissions</h2>
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

                            {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-medium border-b border-red-100">{error}</div>}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200">
                                            <th className="px-6 py-4 font-body font-semibold text-slate-700 text-sm">Contact Info</th>
                                            <th className="px-6 py-4 font-body font-semibold text-slate-700 text-sm">Business</th>
                                            <th className="px-6 py-4 font-body font-semibold text-slate-700 text-sm">Location</th>
                                            <th className="px-6 py-4 font-body font-semibold text-slate-700 text-sm">Source/Date</th>
                                            <th className="px-6 py-4 font-body font-semibold text-slate-700 text-sm">Status</th>
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
                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
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
                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="flex items-center text-slate-700 text-sm">
                                                            <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                                                            {lead.businessName || <span className="text-slate-400 italic">Not provided</span>}
                                                        </div>
                                                        {lead.comment && (
                                                            <div className="flex items-center text-slate-500 text-xs mt-1 max-w-[150px] truncate">
                                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                                {lead.comment}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="flex items-center text-slate-700 text-sm">
                                                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                                            {lead.location || <span className="text-slate-400 italic">Not provided</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => { setSelectedLead(lead); setCommentText(lead.comment || ""); }}>
                                                        <div className="text-sm">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium mb-1">
                                                                {lead.source || "Web Form"}
                                                            </span>
                                                            <div className="flex items-center text-slate-500 text-xs">
                                                                <CalendarDays className="w-3 h-3 mr-1" />
                                                                {formatDate(lead.date)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={lead.status || "New"}
                                                            disabled={updatingId === lead.id}
                                                            onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                                                            className={`text-sm border rounded-lg px-3 py-1.5 outline-none font-medium transition-colors ${(lead.status || "New") === "New" ? "bg-amber-50 text-amber-700 border-amber-200" :
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
                                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                                    <div className="text-sm text-slate-500">
                                        Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> of <span className="font-medium text-slate-900">{filteredLeads.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold font-display text-slate-800">Testimonials Manager</h2>
                                <p className="text-sm font-body text-slate-500">Manage client reviews shown on the public site.</p>
                            </div>
                            <Button onClick={() => { setEditingTestimonial(null); setTestimonialFormOpen(true); }} className="bg-primary hover:bg-primary-light">
                                <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map(t => (
                                <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col pt-8 relative mt-6">
                                    <div className="absolute -top-6 left-6 w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-display font-bold text-lg border-4 border-slate-50 shadow-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-1">
                                        <button onClick={() => { setEditingTestimonial(t); setTestimonialFormOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={async () => {
                                            if (!confirm("Delete this testimonial?")) return;
                                            try {
                                                const token = localStorage.getItem("adminToken");
                                                const res = await fetch(`/api/testimonials/${t.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
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
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <div className="text-slate-900 font-medium">{selectedLead.name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Business</label>
                                    <div className="text-slate-900 font-medium">{selectedLead.businessName || "N/A"}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Phone</label>
                                    <div className="text-slate-900 font-medium">{selectedLead.phoneNumber || selectedLead.phone || "N/A"}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Location</label>
                                    <div className="text-slate-900 font-medium">{selectedLead.location || "N/A"}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                                    <div className="inline-flex px-2 py-1 bg-slate-100 rounded text-sm text-slate-800 font-medium">{selectedLead.status || "New"}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Submitted</label>
                                    <div className="text-slate-900 text-sm">{formatDate(selectedLead.date)}</div>
                                </div>
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
                                <Button
                                    onClick={handleSaveComment}
                                    disabled={savingComment || commentText === (selectedLead.comment || "")}
                                    className="bg-primary hover:bg-primary-light"
                                >
                                    {savingComment ? 'Saving...' : 'Save Notes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dashboard Settings Modal */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Dashboard Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Calendly Demo URL</label>
                            <input
                                type="url"
                                value={settingsData.calendlyUrl}
                                onChange={e => setSettingsData({ ...settingsData, calendlyUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                placeholder="https://calendly.com/your-link"
                            />
                            <p className="text-xs text-slate-500">Connects the "Schedule Demo" buttons straight to your booking page.</p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={async () => {
                                    setSavingSettings(true);
                                    try {
                                        const token = localStorage.getItem("adminToken");
                                        const res = await fetch("/api/settings", {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`
                                            },
                                            body: JSON.stringify(settingsData)
                                        });
                                        if (res.ok) setSettingsOpen(false);
                                        else setError("Failed to save settings");
                                    } catch (err) { setError("Error connecting to server"); } finally { setSavingSettings(false); }
                                }}
                                disabled={savingSettings}
                                className="bg-primary hover:bg-primary-light"
                            >
                                {savingSettings ? "Saving..." : "Save Settings"}
                            </Button>
                        </div>
                    </div>
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
                            name: formData.get("name"),
                            role: formData.get("role"),
                            company: formData.get("company"),
                            quote: formData.get("quote"),
                            rating: Number(formData.get("rating"))
                        };
                        try {
                            const token = localStorage.getItem("adminToken");
                            const method = editingTestimonial ? "PUT" : "POST";
                            const endpoint = editingTestimonial ? `/api/testimonials/${editingTestimonial.id}` : "/api/testimonials";

                            const res = await fetch(endpoint, {
                                method,
                                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                body: JSON.stringify(payload)
                            });

                            if (res.ok) {
                                fetchTestimonials();
                                setTestimonialFormOpen(false);
                            } else {
                                alert("Failed to save testimonial.");
                            }
                        } catch (err) {
                            alert("Error connecting to server.");
                        } finally {
                            setSavingTestimonial(false);
                        }
                    }} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Client Name</label>
                                <input name="name" required defaultValue={editingTestimonial?.name || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Rating (1-5)</label>
                                <input name="rating" type="number" min="1" max="5" required defaultValue={editingTestimonial?.rating || 5} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Job Role</label>
                                <input name="role" required defaultValue={editingTestimonial?.role || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="CEO" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Company</label>
                                <input name="company" required defaultValue={editingTestimonial?.company || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Acme Corp" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Testimonial Quote</label>
                            <textarea name="quote" required defaultValue={editingTestimonial?.quote || ""} className="w-full h-24 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" placeholder="We loved using Fateh ERP..." />
                        </div>
                        <div className="flex justify-end pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => setTestimonialFormOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={savingTestimonial} className="bg-primary hover:bg-primary-light">
                                {savingTestimonial ? "Saving..." : "Save Testimonial"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
