'use client'

interface Trade {
  date: string
  action: string
  price: number
  shares: number
}

interface TradesTableProps {
  trades: Trade[]
}

export function TradesTable({ trades }: TradesTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trades executed
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Action</th>
            <th className="text-right p-3 font-medium">Price</th>
            <th className="text-right p-3 font-medium">Shares</th>
            <th className="text-right p-3 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              <td className="p-3">{trade.date}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    trade.action === 'Buy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {trade.action}
                </span>
              </td>
              <td className="p-3 text-right">${trade.price.toFixed(2)}</td>
              <td className="p-3 text-right">{trade.shares.toFixed(4)}</td>
              <td className="p-3 text-right">
                ${(trade.price * trade.shares).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

