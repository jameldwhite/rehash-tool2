
import React, { useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import ReactToPrint from 'react-to-print';

export default function RehashTool() {
  // Vehicle
  const [salesPrice, setSalesPrice] = useState(25000);
  const [bookValue, setBookValue] = useState(23000);

  // Customer & debts
  const [income, setIncome] = useState(5000);
  const [otherMonthlyDebt, setOtherMonthlyDebt] = useState(400); // rent, cards etc.

  // Existing auto loans (array)
  const [existingLoans, setExistingLoans] = useState([350]); // list of monthly payments

  // Loan inputs
  const [downPayment, setDownPayment] = useState(2000);
  const [rate, setRate] = useState(7.5);
  const [term, setTerm] = useState(60);

  // Helpers
  const addExistingLoan = () => setExistingLoans([...existingLoans, 0]);
  const removeExistingLoan = (idx) => setExistingLoans(existingLoans.filter((_,i)=>i!==idx));
  const updateExistingLoan = (idx, val) => setExistingLoans(existingLoans.map((v,i)=> i===idx ? Number(val) : v));

  const existingTotal = existingLoans.reduce((s,v)=> s + Number(v || 0), 0);

  // Calculations
  const loanAmount = Math.max(0, Number(salesPrice) - Number(downPayment));
  const monthlyRate = Number(rate) / 100 / 12;
  const newPayment = monthlyRate === 0 ? (loanAmount / term || 0) : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term || 1));

  const totalAutoPayments = existingTotal + newPayment;
  const pti = income > 0 ? (totalAutoPayments / income) * 100 : 0;

  const totalMonthlyDebt = Number(otherMonthlyDebt) + totalAutoPayments;
  const dti = income > 0 ? (totalMonthlyDebt / income) * 100 : 0;

  const diff = Number(salesPrice) - Number(bookValue); // positive = customer paying over book (negative equity risk)
  const equityPercent = (diff / Math.max(1, Number(bookValue))) * 100 * -1; // negative percent if positive diff (i.e., negative equity)

  // Visual helpers
  const ptiColor = pti < 15 ? '#16A34A' : pti < 20 ? '#D97706' : '#DC2626';
  const equityColor = diff <= 0 ? '#16A34A' : diff < 2000 ? '#D97706' : '#DC2626';

  // Scorecard: simple weighted score (50% PTI, 50% equity)
  const ptiScore = pti >= 30 ? 0 : Math.max(0, 100 - (pti * 4)); // rough mapping
  const equityScore = diff <= 0 ? 100 : Math.max(0, 100 - (diff / Math.max(1, bookValue) * 100));
  const overallScore = Math.round((ptiScore * 0.5) + (equityScore * 0.5));

  const scoreColor = overallScore > 80 ? 'bg-green-100 border-green-400' : overallScore > 60 ? 'bg-yellow-100 border-yellow-400' : 'bg-red-100 border-red-400';

  // Charts data
  const barData = [
    { name: 'Sales Price', value: Number(salesPrice) },
    { name: 'Book Value', value: Number(bookValue) }
  ];

  const gaugeData = [
    { name: 'Used', value: Math.min(pti, 100) },
    { name: 'Remaining', value: 100 - Math.min(pti, 100) }
  ];

  // Print ref
  const componentRef = useRef();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rehash Tool — Finance Manager</h1>
          <div className="flex items-center gap-3">
            <ReactToPrint
              trigger={() => <button className="px-4 py-2 bg-blue-600 text-white rounded">Print / Export PDF</button>}
              content={() => componentRef.current}
            />
          </div>
        </div>

        <div ref={componentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Vehicle */}
          <div className="col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Vehicle</h2>
            <label className="block text-sm">Sales Price ($)</label>
            <input type="number" value={salesPrice} onChange={e=>setSalesPrice(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />

            <label className="block text-sm">Book Value ($)</label>
            <input type="number" value={bookValue} onChange={e=>setBookValue(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />

            <div className="mt-4">
              <p className={`font-bold`}><span className={`px-2 py-1 rounded`} style={{color: equityColor}}>Difference:</span> <span className="ml-2">${diff.toFixed(2)}</span></p>
              <p className="text-sm text-gray-600 mt-2">Equity % (negative means customer paid over book): {equityPercent.toFixed(2)}%</p>
            </div>

            <div style={{height:220}} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Middle: Loans & Inputs */}
          <div className="col-span-1 lg:col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Loan Inputs</h2>

            <label className="block text-sm">Down Payment (${downPayment})</label>
            <input type="range" min="0" max={Math.max(10000, salesPrice)} value={downPayment} onChange={e=>setDownPayment(Number(e.target.value))} className="w-full mb-2" />
            <input type="number" value={downPayment} onChange={e=>setDownPayment(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />

            <label className="block text-sm">APR (%) — {rate}%</label>
            <input type="range" min="0" max="25" step="0.1" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mb-2" />
            <input type="number" step="0.1" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />

            <label className="block text-sm">Term (months)</label>
            <select value={term} onChange={e=>setTerm(Number(e.target.value))} className="w-full p-2 border rounded mb-3">
              <option value={36}>36</option>
              <option value={48}>48</option>
              <option value={60}>60</option>
              <option value={72}>72</option>
            </select>

            <h3 className="mt-4 font-medium">Existing Auto Loans</h3>
            <div className="space-y-2 mt-2">
              {existingLoans.map((amt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="number" value={amt} onChange={e=>updateExistingLoan(idx, e.target.value)} className="flex-1 p-2 border rounded" />
                  <button onClick={()=>removeExistingLoan(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                </div>
              ))}
              <button onClick={addExistingLoan} className="mt-2 px-3 py-2 bg-gray-200 rounded">Add Loan</button>
            </div>

            <div className="mt-4">
              <label className="block text-sm">Other Monthly Debt ($)</label>
              <input type="number" value={otherMonthlyDebt} onChange={e=>setOtherMonthlyDebt(Number(e.target.value))} className="w-full p-2 border rounded" />
            </div>
          </div>

          {/* Right: Results & Charts */}
          <div className="col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Customer & Results</h2>

            <label className="block text-sm">Monthly Income ($)</label>
            <input type="number" value={income} onChange={e=>setIncome(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />

            <div className="space-y-2">
              <p>Loan Amount: <strong>${loanAmount.toFixed(2)}</strong></p>
              <p>New Payment: <strong>${newPayment.toFixed(2)}</strong></p>
              <p>Total Auto Payments (existing + new): <strong>${totalAutoPayments.toFixed(2)}</strong></p>
              <p className="flex items-center gap-2">PTI: <strong style={{color: ptiColor}}>{pti.toFixed(2)}%</strong></p>
              <p>DTI: <strong>{dti.toFixed(2)}%</strong></p>
            </div>

            <div className={`mt-4 p-3 border rounded ${scoreColor}`}>
              <p className="text-sm text-gray-700">Financeability Score</p>
              <p className="text-2xl font-bold">{overallScore}/100</p>
              <p className="text-sm">Quick guide: higher is better. Score uses PTI and equity to give a simple signal.</p>
            </div>

            <div style={{height:180}} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gaugeData} innerRadius={60} outerRadius={80} startAngle={210} endAngle={-30} dataKey="value">
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? ptiColor : '#E5E7EB'} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{height:160}} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        <div className="text-sm text-gray-600 mt-4">* This tool gives estimates only. Confirm exact payments with your lending partner.</div>
      </div>
    </div>
  );
}
