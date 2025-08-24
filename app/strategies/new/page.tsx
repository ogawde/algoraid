'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TICKERS = ['AAPL', 'TSLA', 'SPY', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD']

const EXAMPLE_STRATEGY = `def strategy(df):
    # df has columns: Date, Open, High, Low, Close, Volume
    # Calculate 20-day moving average
    df['SMA'] = df['Close'].rolling(window=20).mean()
    
    # Create signals: 1=buy, -1=sell, 0=hold
    df['Signal'] = 0
    df.loc[df['Close'] > df['SMA'], 'Signal'] = 1
    df.loc[df['Close'] < df['SMA'], 'Signal'] = -1
    
    return df`

export default function NewStrategyPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState(EXAMPLE_STRATEGY)
  const [ticker, setTicker] = useState('AAPL')
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState('2023-12-31')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const response = await fetch('http://localhost:8000/api/strategies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        code,
        ticker,
        start_date: startDate,
        end_date: endDate,
      }),
    })

    const data = await response.json()
    router.push(`/results/${data.backtest_id}`)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Strategy</h1>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Strategy Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="My Trading Strategy"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Strategy Code (Python)
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full h-[400px] font-mono text-sm border border-input rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={EXAMPLE_STRATEGY}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticker" className="block text-sm font-medium mb-2">
                  Stock Ticker
                </label>
                <Select
                  value={ticker}
                  onValueChange={setTicker}
                  required
                >
                  <SelectTrigger id="ticker" className="w-full">
                    <SelectValue placeholder="Select a ticker" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKERS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Running Backtest...' : 'Run Backtest'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

