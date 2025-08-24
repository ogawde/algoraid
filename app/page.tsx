import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Algorithmic Trading Backtest Platform</h1>
      <p className="text-muted-foreground mb-8">
        Write Python trading strategies, backtest them on historical stock data, and analyze the results.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Write a Python strategy function and backtest it on historical data.
            </p>
            <Link href="/strategies/new">
              <Button>New Strategy</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Browse all your past backtests and analyze performance.
            </p>
            <Link href="/results">
              <Button variant="outline">View Results</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

