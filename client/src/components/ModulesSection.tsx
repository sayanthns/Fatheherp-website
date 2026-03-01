/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Modules: Tab-based showcase with images, trading-focused
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Package,
  ShoppingBag,
  Calculator,
  Users,
  BarChart3,
} from "lucide-react";

const TRADING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-trading-2ZcLVBS5YwcM4T4vX3vc8c.webp";
const INVENTORY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-inventory-ZogsW3eF9aVCDVzbEHytXf.webp";
const FINANCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-finance-LNqQqE4MwHSkTLErgGyeZ7.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-dashboard-TFt7bikrqWFZE8j9swnDzY.webp";

const modules = [
  {
    id: "sales",
    icon: Receipt,
    label: "Sales & Invoicing",
    title: "Sell Smarter, Invoice Faster",
    description:
      "Create quotations, convert to sales orders, and generate ZATCA-compliant e-invoices in seconds. Manage pricing lists, discounts, and customer-specific terms with full automation.",
    features: [
      "ZATCA Phase 2 E-Invoicing",
      "Point of Sale (POS)",
      "Quotations & Sales Orders",
      "Price Lists & Offers",
      "Credit Notes & Returns",
      "Sales Commission Tracking",
    ],
    image: TRADING_IMG,
  },
  {
    id: "inventory",
    icon: Package,
    label: "Inventory",
    title: "Real-Time Stock Visibility",
    description:
      "Track every item across multiple warehouses with real-time updates. Automated reorder points ensure you never run out of stock, while batch and serial number tracking provides full traceability.",
    features: [
      "Multi-Warehouse Management",
      "Real-Time Stock Levels",
      "Batch & Serial Tracking",
      "Automated Reorder Points",
      "Stocktaking & Adjustments",
      "Product Variants & Categories",
    ],
    image: INVENTORY_IMG,
  },
  {
    id: "procurement",
    icon: ShoppingBag,
    label: "Procurement",
    title: "Streamlined Purchasing",
    description:
      "Manage your entire purchase cycle from requisition to delivery. Compare supplier quotes, track purchase orders, and maintain a centralized supplier database for better negotiation.",
    features: [
      "Purchase Orders & Requisitions",
      "Supplier Management",
      "Quote Comparison",
      "Delivery Tracking",
      "Purchase Returns",
      "Supplier Performance Analytics",
    ],
    image: DASHBOARD_IMG,
  },
  {
    id: "finance",
    icon: Calculator,
    label: "Finance",
    title: "Complete Financial Control",
    description:
      "Double-entry accounting with automated journal entries, bank reconciliation, and comprehensive financial reporting. Built-in VAT management ensures compliance with Saudi tax regulations.",
    features: [
      "Chart of Accounts",
      "VAT Management & Reporting",
      "Bank Reconciliation",
      "Expense Tracking",
      "Cost Centers",
      "Financial Statements",
    ],
    image: FINANCE_IMG,
  },
  {
    id: "crm",
    icon: Users,
    label: "CRM",
    title: "Build Lasting Relationships",
    description:
      "Track every customer interaction from first contact to repeat purchase. Manage leads, run loyalty programs, and use data-driven insights to grow customer lifetime value.",
    features: [
      "Lead & Opportunity Tracking",
      "Customer Communication Log",
      "Loyalty Points Program",
      "Customer Segmentation",
      "Follow-Up Reminders",
      "Sales Pipeline Analytics",
    ],
    image: TRADING_IMG,
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Reports",
    title: "Data-Driven Decisions",
    description:
      "Access real-time dashboards and detailed reports across all business functions. From sales trends to inventory turnover, get the insights you need to make informed decisions.",
    features: [
      "Real-Time Dashboards",
      "Sales & Revenue Reports",
      "Inventory Turnover Analysis",
      "Profit & Loss Statements",
      "Custom Report Builder",
      "Export to Excel & PDF",
    ],
    image: DASHBOARD_IMG,
  },
];

export default function ModulesSection() {
  const [activeModule, setActiveModule] = useState(0);
  const current = modules[activeModule];

  return (
    <section id="modules" className="py-24 lg:py-32 bg-slate-50">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-body font-semibold tracking-wide uppercase mb-4">
            Platform Modules
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            Complete Trading Management
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Six integrated modules that cover every aspect of your trading operations — from sales to finance.
          </p>
        </motion.div>

        {/* Module Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200 ${
                activeModule === i
                  ? "bg-navy text-white shadow-lg shadow-navy/20"
                  : "bg-white text-foreground/70 hover:bg-white hover:text-foreground border border-border hover:shadow-sm"
              }`}
            >
              <mod.icon className="w-4 h-4" />
              {mod.label}
            </button>
          ))}
        </div>

        {/* Module Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            {/* Left — Text */}
            <div>
              <h3 className="font-display font-bold text-2xl lg:text-3xl text-foreground mb-4">
                {current.title}
              </h3>
              <p className="text-muted-foreground font-body text-base leading-relaxed mb-8">
                {current.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {current.features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2.5 text-sm font-body text-foreground/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-coral shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-coral/5 to-blue-500/5 rounded-2xl blur-xl" />
              <img
                src={current.image}
                alt={current.title}
                className="relative rounded-xl shadow-xl border border-border w-full"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
