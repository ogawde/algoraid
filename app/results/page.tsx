'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Backtest {
  id: number
  strategy_id: number
  strategy_name: string
  ticker: string
  start_date: string
  end_date: string
  total_return: number
  created_at: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [backtests, setBacktests] = useState<Backtest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBacktests()
  }, [])

  const fetchBacktests = async () => {
    const response = await fetch('http://localhost:8000/api/backtests')
    const data = await response.json()
    setBacktests(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Backtest Results</h1>

      {backtests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No backtests found. Create a strategy to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {backtests.map((backtest) => (
            <Card
              key={backtest.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/results/${backtest.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{backtest.strategy_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {backtest.ticker} • {backtest.start_date} to {backtest.end_date}
                    </p>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      backtest.total_return >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {backtest.total_return >= 0 ? '+' : ''}
                    {backtest.total_return.toFixed(2)}%
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

