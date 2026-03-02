import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    type: "bot" | "user";
    text: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", type: "bot", text: "Hi! I'm Fateh AI. Ready to elevate your business?" },
        { id: "2", type: "bot", text: "What is your full name?" },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const [step, setStep] = useState(0); // 0: Name, 1: Business, 2: Phone, 3: Location, 4: Done
    const [userData, setUserData] = useState({
        name: "",
        businessName: "",
        phone: "",
        location: "",
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userText = inputValue.trim();
        setInputValue("");

        // Add user message
        const newMessages = [...messages, { id: Date.now().toString(), type: "user" as const, text: userText }];
        setMessages(newMessages);
        setIsTyping(true);

        const data = { ...userData };

        // Simulate thinking/typing
        setTimeout(() => {
            let nextMsg = "";
            if (step === 0) {
                data.name = userText;
                nextMsg = `Nice to meet you, ${userText}! What's the name of your business?`;
                setStep(1);
            } else if (step === 1) {
                data.businessName = userText;
                nextMsg = "Great! What is your phone number so our team can reach you?";
                setStep(2);
            } else if (step === 2) {
                data.phone = userText;
                nextMsg = "Got it. Lastly, which city are you located in?";
                setStep(3);
            } else if (step === 3) {
                data.location = userText;
                nextMsg = "Thank you! I've sent your details to our team. An expert will contact you soon.";
                setStep(4);

                // Calculate Tracking Source
                const adSource = sessionStorage.getItem('ad_source');
                const adCampaign = sessionStorage.getItem('ad_campaign');
                let finalSource = "Chatbot";
                if (adSource) {
                    finalSource = `Chatbot via ${adSource}`;
                    if (adCampaign) finalSource += ` [${adCampaign}]`;
                }

                // Send to backend
                fetch("/api/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: data.name,
                        businessName: data.businessName,
                        phoneNumber: data.phone,
                        location: data.location,
                        source: finalSource
                    }),
                }).catch(err => console.error("Failed to send chat lead", err));
            }

            setUserData(data);
            setMessages((prev) => [...prev, { id: Date.now().toString() + "bot", type: "bot", text: nextMsg }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-light transition-colors relative group"
                        >
                            <MessageCircle className="w-6 h-6" />
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[380px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden flex flex-col h-[500px] max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-primary px-4 py-3 border-b border-primary-light flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative">
                                    <Bot className="w-5 h-5 text-white" />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-display font-semibold text-sm leading-tight">Fateh Assistant</h3>
                                    <p className="text-white/70 text-[0.65rem] font-medium uppercase tracking-wider">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
                            <div className="text-center mb-6">
                                <span className="text-[0.65rem] font-medium text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Today</span>
                            </div>

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex max-w-[85%] items-end gap-2 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.type === "user" ? "bg-slate-200" : "bg-primary/10"}`}>
                                            {msg.type === "user" ? <User className="w-3.5 h-3.5 text-slate-600" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                                        </div>
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl text-[0.9rem] font-body leading-relaxed shadow-sm ${msg.type === "user"
                                                ? "bg-primary text-white rounded-br-sm"
                                                : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-[85%] items-end gap-2 flex-row">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: 0, duration: 0.8 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: 0.2, duration: 0.8 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: 0.4, duration: 0.8 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-100">
                            {step < 4 ? (
                                <form onSubmit={handleSend} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type your answer..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-slate-400"
                                        disabled={isTyping}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!inputValue.trim() || isTyping}
                                        className="w-10 h-10 rounded-full bg-primary hover:bg-primary-light p-0 flex items-center justify-center shrink-0 shadow-md shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isTyping ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white ml-0.5" />}
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center py-2 text-sm text-slate-500 font-body">
                                    Chat completed. Thank you!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
