'use client'

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts'

interface PortfolioValue {
  date: string
  value: number
}

interface Trade {
  date: string
  action: string
  price: number
  shares: number
}

interface ResultsChartProps {
  portfolioValues: PortfolioValue[]
  trades: Trade[]
}

export function ResultsChart({ portfolioValues, trades }: ResultsChartProps) {
  const chartData = portfolioValues.map((pv) => {
    const buyTrade = trades.find((t) => t.date === pv.date && t.action === 'Buy')
    const sellTrade = trades.find((t) => t.date === pv.date && t.action === 'Sell')
    
    return {
      date: pv.date,
      value: pv.value,
      buyValue: buyTrade ? pv.value : null,
      sellValue: sellTrade ? pv.value : null,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#2563eb" 
          strokeWidth={2}
          name="Portfolio Value"
          dot={false}
        />
        <Scatter 
          dataKey="buyValue" 
          fill="#10b981" 
          name="Buy Signal"
          shape={(props: unknown) => {
            const { cx, cy } = props as { cx?: number; cy?: number }
            if (cy === null || cy === undefined) return <></>
            return <circle cx={cx} cy={cy} r={6} fill="#10b981" />
          }}
        />
        <Scatter 
          dataKey="sellValue" 
          fill="#ef4444" 
          name="Sell Signal"
          shape={(props: unknown) => {
            const { cx, cy } = props as { cx?: number; cy?: number }
            if (cy === null || cy === undefined) return <></>
            return <circle cx={cx} cy={cy} r={6} fill="#ef4444" />
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

