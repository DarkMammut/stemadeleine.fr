"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";
import { normalizeToArray } from "@/utils/normalizeApiResponse";
import Card from "@/components/ui/Card";
import Currency from "@/components/ui/Currency";
import Select from "@/components/ui/Select";

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export default function DonationsChart({
  className = "",
  chartHeight = "h-56",
  refreshSignal = 0,
}) {
  const axios = useAxiosClient();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        // Prefer server-side aggregated monthly totals for the current year
        const yearToFetch = year;
        const res = await axios.get(`/api/stats/donations?year=${yearToFetch}`);
        if (!mounted) return;
        const data = res.data || {};
        // data.monthlyTotals is expected as array of 12 numbers
        const monthly = Array.isArray(data.monthlyTotals)
          ? data.monthlyTotals
          : [];
        // build payments-like array where each month has a pseudo-payment sum so existing logic can reuse
        const paymentsArray = monthly.flatMap((amount, monthIdx) => {
          if (!amount || amount === 0) return [];
          // create a synthetic payment object per month to allow years set extraction
          const pd = new Date(yearToFetch, monthIdx, 1).toISOString();
          return [{ paymentDate: pd, amount }];
        });
        setPayments(paymentsArray);
      } catch (e) {
        console.error("Erreur chargement paiements pour le graphique", e);
        // fallback: try legacy payments endpoint
        try {
          const res2 = await axios.get("/api/payments");
          const paymentsArray = normalizeToArray(res2.data);
          setPayments(paymentsArray);
        } catch (e2) {
          setPayments([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [axios, year, refreshSignal]);

  const years = useMemo(() => {
    const set = new Set();
    payments.forEach((p) => {
      if (!p.paymentDate) return;
      const y = new Date(p.paymentDate).getFullYear();
      set.add(y);
    });
    const arr = Array.from(set).sort((a, b) => b - a);
    if (!arr.includes(new Date().getFullYear()))
      arr.unshift(new Date().getFullYear());
    return arr;
  }, [payments]);

  useEffect(() => {
    // ensure default year exists in list
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years]);

  const monthlyTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    payments.forEach((p) => {
      if (!p.paymentDate) return;
      const d = new Date(p.paymentDate);
      if (d.getFullYear() !== Number(year)) return;
      const m = d.getMonth();
      const amount = Number(p.amount || p.value || 0);
      totals[m] += amount;
    });
    return totals;
  }, [payments, year]);

  // During loading we want to show zeros and force current year
  const monthlyTotalsForRender = loading
    ? new Array(12).fill(0)
    : monthlyTotals;
  const maxForRender = Math.max(...monthlyTotalsForRender, 1);
  const yearForRender = loading ? new Date().getFullYear() : year;

  return (
    <Card as="div" className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between px-2 sm:px-4 py-3">
        <h4 className="text-base font-semibold text-gray-800">
          Dons — {yearForRender}
        </h4>
        <div className="flex items-center gap-2">
          <Select
            value={year}
            onValueChange={(v) => setYear(Number(v))}
            options={
              years.length
                ? years.map((y) => ({ value: y, label: y }))
                : [
                    {
                      value: new Date().getFullYear(),
                      label: new Date().getFullYear(),
                    },
                  ]
            }
            className="w-28"
            disabled={loading}
          />
        </div>
      </div>

      <div className="px-2 sm:px-4 pb-4">
        <div className="w-full">
          {/* SVG line chart */}
          <div className={`w-full ${chartHeight}`}>
            <svg
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                {/* area gradient (faint) */}
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.06" />
                </linearGradient>

                {/* colorful stroke gradient for the line */}
                <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* grid horizontal lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
                <line
                  key={idx}
                  x1={40}
                  x2={580}
                  y1={20 + t * 160}
                  y2={20 + t * 160}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* compute points */}
              {(() => {
                const W = 600;
                const H = 200;
                const marginLeft = 40;
                const marginRight = 20;
                const marginTop = 20;
                const marginBottom = 20;
                const plotW = W - marginLeft - marginRight;
                const plotH = H - marginTop - marginBottom;
                const xStep = plotW / 11;
                const points = monthlyTotalsForRender.map((val, i) => {
                  const x = marginLeft + i * xStep;
                  const y =
                    marginTop + (1 - val / Math.max(maxForRender, 1)) * plotH;
                  return { x, y, val };
                });

                const poly = points.map((p) => `${p.x},${p.y}`).join(" ");
                const areaPoly = `${marginLeft},${H - marginBottom} ${points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")} ${marginLeft + plotW},${H - marginBottom}`;

                return (
                  <g>
                    {/* area under curve */}
                    <polyline points={areaPoly} fill="url(#g)" stroke="none" />

                    {/* line (colorful gradient) */}
                    <polyline
                      points={poly}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* points */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={3.5}
                          fill="#fff"
                          stroke="#8b5cf6"
                          strokeWidth="1.8"
                        >
                          <title>{`${MONTHS[i]}: ${p.val}`}</title>
                        </circle>
                      </g>
                    ))}

                    {/* x labels */}
                    {points.map((p, i) => (
                      <text
                        key={i}
                        x={p.x}
                        y={H - 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {MONTHS[i]}
                      </text>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
            <div>
              Total:{" "}
              <span className="font-semibold text-gray-800 text-base">
                <Currency
                  value={monthlyTotalsForRender.reduce((a, b) => a + b, 0)}
                  currency={"EUR"}
                />
              </span>
            </div>
            {loading && (
              <div className="text-sm text-gray-500">Chargement…</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
