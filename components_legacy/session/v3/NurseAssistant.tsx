import React, { useState } from 'react';
import { Mic, Send } from 'lucide-react';

interface NurseAssistantProps {
    onOrder: (order: string) => void;
}

const NurseAssistant: React.FC<NurseAssistantProps> = ({ onOrder }) => {
    const [nurseInput, setNurseInput] = useState('');

    const handleSubmit = () => {
        if (!nurseInput.trim()) return;
        onOrder(nurseInput);
        setNurseInput('');
    };

    return (
        <div className="flex flex-col gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=NurseSarah&backgroundColor=b6e3f4"
                        alt="Nurse"
                        className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-600"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white leading-none">Nurse Sarah</h3>
                    <p className="text-[10px] text-emerald-400 font-medium mt-1">Ready for orders</p>
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={nurseInput}
                    onChange={(e) => setNurseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Order labs, asking for help..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                    onClick={handleSubmit}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    {nurseInput ? <Send size={14} /> : <Mic size={14} />}
                </button>
            </div>
        </div>
    );
};

export default NurseAssistant;
