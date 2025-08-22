'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResultsChart } from '@/components/results-chart'
import { TradesTable } from '@/components/trades-table'

interface BacktestData {
  id: number
  strategy_id: number
  strategy_name: string
  ticker: string
  start_date: string
  end_date: string
  results: {
    trades: Array<{
      date: string
      action: string
      price: number
      shares: number
    }>
    portfolio_values: Array<{
      date: string
      value: number
    }>
    metrics: {
      total_return: number
      total_trades: number
      win_rate: number
      max_drawdown: number
      final_value: number
      initial_cash: number
    }
  }
}

export default function BacktestDetailPage() {
  const params = useParams()
  const backtestId = params.id as string
  const [backtest, setBacktest] = useState<BacktestData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (backtestId) {
      fetchBacktest()
    }
  }, [backtestId])

  const fetchBacktest = async () => {
    const response = await fetch(`http://localhost:8000/api/backtest/${backtestId}`)
    const data = await response.json()
    setBacktest(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!backtest) {
    return (
      <div className="container mx-auto p-8">
        <p>Backtest not found</p>
      </div>
    )
  }

  const { metrics, trades, portfolio_values } = backtest.results

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{backtest.strategy_name}</h1>
        <p className="text-muted-foreground">
          {backtest.ticker} • {backtest.start_date} to {backtest.end_date}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                metrics.total_return >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.total_return >= 0 ? '+' : ''}
              {metrics.total_return.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_trades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.win_rate.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.max_drawdown.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsChart portfolioValues={portfolio_values} trades={trades} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <TradesTable trades={trades} />
        </CardContent>
      </Card>
    </div>
  )
}

