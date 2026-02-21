import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function AnalyticsPage() {
  // Fetch vehicles and include ALL their completed trips and financial logs
  const vehicles = await prisma.vehicle.findMany({
    include: {
      logs: true,
      trips: {
        where: { status: 'Completed' }
      }
    }
  })

  // Calculate enterprise financial metrics dynamically
  const financialData = vehicles.map(vehicle => {
    // 1. Calculate Costs
    const maintenanceCost = vehicle.logs
      .filter(log => log.type === 'Service')
      .reduce((sum, log) => sum + log.cost, 0)

    const fuelCost = vehicle.logs
      .filter(log => log.type === 'Fuel')
      .reduce((sum, log) => sum + log.cost, 0)

    const totalOperationalCost = maintenanceCost + fuelCost

    // 2. Calculate Revenue (Simulated as $5 per kg of cargo delivered on completed trips)
    const totalCargoDelivered = vehicle.trips.reduce((sum, trip) => sum + trip.cargoWeight, 0)
    const revenue = totalCargoDelivered * 5

    // 3. Odoo's Requested Vehicle ROI Formula
    // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const roiDecimal = vehicle.acquisitionCost > 0 
      ? (revenue - totalOperationalCost) / vehicle.acquisitionCost 
      : 0
    
    const roiPercentage = (roiDecimal * 100).toFixed(2)

    return {
      ...vehicle,
      maintenanceCost,
      fuelCost,
      totalOperationalCost,
      revenue,
      roiPercentage
    }
  })

  // Aggregate Fleet Totals
  const fleetRevenue = financialData.reduce((sum, v) => sum + v.revenue, 0)
  const fleetCosts = financialData.reduce((sum, v) => sum + v.totalOperationalCost, 0)
  const netProfit = fleetRevenue - fleetCosts

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports & ROI</h1>
            <p className="text-slate-500 mt-2">Automated operational costs and asset ROI tracking.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
        </header>

        {/* High-Level Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 uppercase">Total Fleet Revenue</h3>
            <div className="text-3xl font-bold mt-2 text-green-600">${fleetRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 uppercase">Operational Costs</h3>
            <div className="text-3xl font-bold mt-2 text-red-600">${fleetCosts.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 uppercase">Net Profit</h3>
            <div className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${netProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Asset ROI Data Table */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Vehicle ROI Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-sm uppercase text-slate-600">
                  <th className="p-3 border-b">Vehicle</th>
                  <th className="p-3 border-b">Acquisition Cost</th>
                  <th className="p-3 border-b">Revenue</th>
                  <th className="p-3 border-b">Maint + Fuel</th>
                  <th className="p-3 border-b">Net Income</th>
                  <th className="p-3 border-b">Lifetime ROI</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((data) => {
                  const netIncome = data.revenue - data.totalOperationalCost
                  return (
                    <tr key={data.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors text-sm">
                      <td className="p-3 font-medium">{data.model} <span className="text-xs text-slate-500 block">{data.licensePlate}</span></td>
                      <td className="p-3">${data.acquisitionCost.toLocaleString()}</td>
                      <td className="p-3 text-green-600">${data.revenue.toLocaleString()}</td>
                      <td className="p-3 text-red-600">${data.totalOperationalCost.toLocaleString()}</td>
                      <td className="p-3 font-semibold">${netIncome.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${parseFloat(data.roiPercentage) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {data.roiPercentage}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}