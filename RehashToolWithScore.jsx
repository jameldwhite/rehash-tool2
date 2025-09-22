import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useReactToPrint } from "react-to-print";

export default function RehashTool() {
  // Vehicle data
  const [salesPrice, setSalesPrice] = useState(25000);
  const [bookValue, setBookValue] = useState(23000);

  // Trade data
  const [tradeAllowance, setTradeAllowance] = useState(0);
  const [tradePayoff, setTradePayoff] = useState(0);

  // Customer data
  const [income, setIncome] = useState(5000);

  // Loan inputs
  const [downPayment, setDownPayment] = useState(2000);
  const [rate, setRate] = useState(7.5);
  const [term, setTerm] = useState(60);

  // Fees
  const [docFee, setDocFee] = useState(799);
  const [salesTaxRate, setSalesTaxRate] = useState(7);
  const [ttl, setTtl] = useState(500);
  const [frontend, setFrontend] = useState(0);
  const [backend, setBackend] = useState(0);

  // --- Calculations ---
  const netTrade = tradeAllowance - tradePayoff;
  const taxableAmount = salesPrice - tradeAllowance;
  const salesTax = (taxableAmount > 0 ? taxableAmount : 0) * (salesTaxRate / 100);
  const loanAmount =
    salesPrice + salesTax + docFee + ttl + frontend + backend - downPayment - netTrade;
  const monthlyRate = rate / 100 / 12;
  const newPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
  const pti = (newPayment / income) * 100;

  // Financeability Score Calculation
  let score = 100;
  if (pti > 15) score -= (pti - 15) * 2;
  if (netTrade < 0) score -= Math.abs(netTrade) / 100;
  if (frontend + backend > 2000) score -= 5;
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  let grade = "F";
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";

  const ptiColor = pti < 15 ? "text-green-600" : pti < 20 ? "text-yellow-600" : "text-red-600";
  const diff = salesPrice - bookValue;
  const diffColor = diff <= 0 ? "text-green-600" : diff < 2000 ? "text-yellow-600" : "text-red-600";

  const ptiData = [
    { name: "PTI", value: pti },
    { name: "Remaining", value: 100 - pti },
  ];

  const priceData = [
    { name: "Sales Price", value: salesPrice },
    { name: "Book Value", value: bookValue },
  ];

  const targetPayment = income * 0.15;
  const neededLoanAmount = (targetPayment * (1 - Math.pow(1 + monthlyRate, -term))) / monthlyRate;
  const suggestedDown = loanAmount - neededLoanAmount;

  const downData = [
    { name: "Current Down", value: downPayment },
    { name: "Suggested Down", value: suggestedDown > 0 ? suggestedDown : 0 },
  ];

  const COLORS = ["#22c55e", "#e5e7eb"];
  const handlePrint = useReactToPrint({ contentRef: () => document.getElementById("rehash-report") });

  return (
    <div id="rehash-report" className="p-6 bg-gray-100 min-h-screen space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Vehicle Info</h2>
          <label className="block mb-2">Sales Price ($)</label>
          <input type="number" value={salesPrice} onChange={(e) => setSalesPrice(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
          <label className="block mb-2">Book Value ($)</label>
          <input type="number" value={bookValue} onChange={(e) => setBookValue(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
          <p className={`text-lg font-bold ${diffColor}`}>Difference: ${diff.toFixed(2)}</p>
          <div className="mt-6 h-48 print:hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Customer Finance</h2>
          <label className="block mb-2">Monthly Income ($)</label>
          <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Trade-In</h3>
            <label className="block mb-2">Trade Allowance ($)</label>
            <input type="number" value={tradeAllowance} onChange={(e) => setTradeAllowance(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
            <label className="block mb-2">Trade Payoff ($)</label>
            <input type="number" value={tradePayoff} onChange={(e) => setTradePayoff(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
            <p className="text-lg font-bold">Net Trade Equity: ${netTrade.toFixed(2)}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Fees</h3>
            <label className="block mb-2">Doc Fee ($)</label>
            <input type="number" value={docFee} onChange={(e) => setDocFee(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
            <label className="block mb-2">Sales Tax Rate (%)</label>
            <input type="number" step="0.1" value={salesTaxRate} onChange={(e) => setSalesTaxRate(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
            <label className="block mb-2">TT&L ($)</label>
            <input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
            <label className="block mb-2">Frontend ($)</label>
            <input type="number" value={frontend} onChange={(e) => setFrontend(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
            <label className="block mb-2">Backend ($)</label>
            <input type="number" value={backend} onChange={(e) => setBackend(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
          </div>
          <label className="block mb-2">Down Payment ($)</label>
          <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
          <label className="block mb-2">APR (%)</label>
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
          <label className="block mb-2">Term (months)</label>
          <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full p-2 border rounded mb-4">
            {[36,48,54,60,66,72,75,84].map(t=>(<option key={t} value={t}>{t}</option>))}
          </select>
          <div className="mt-6 space-y-2">
            <p className="text-lg">Loan Amount: <span className="font-bold">${loanAmount.toFixed(2)}</span></p>
            <p className="text-lg">New Payment: <span className="font-bold">${newPayment.toFixed(2)}</span></p>
            <p className={`text-lg font-bold ${ptiColor}`}>PTI Ratio: {pti.toFixed(2)}%</p>
            <p className="text-lg font-bold print:hidden">Financeability Score: {score.toFixed(0)} ({grade})</p>
          </div>
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ptiData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {ptiData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded shadow">Print / Save PDF</button>
      </div>
    </div>
  );
}
