import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import CompleteTripForm from './CompleteTripForm'

const prisma = new PrismaClient()
const pendingTrips = await prisma.trip.count({ where: { status: 'Draft' } })
// Fetch trips currently in progress
const activeTrips = await prisma.trip.findMany({
  where: { status: 'Dispatched' },
  include: { vehicle: true, driver: true } // Include relations to show names/plates
})

export default async function CommandCenter() {
  // 1. Fetch all vehicles and trips from the local database
  const vehicles = await prisma.vehicle.findMany()
  const pendingTrips = await prisma.trip.count({ where: { status: 'Draft' } })

  // 2. Calculate the exact KPIs Odoo requested
  const totalVehicles = vehicles.length
  const activeFleet = vehicles.filter(v => v.status === 'On Trip').length
  const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length
  
  // Utilization Rate: % of fleet assigned
  const utilizationRate = totalVehicles > 0 
    ? Math.round((activeFleet / totalVehicles) * 100) 
    : 0

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FleetFlow Command Center</h1>
            <p className="text-slate-500 mt-2">High-level fleet oversight and live metrics.</p>
          </div>
          <Link href="/analytics" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors shadow-sm">
            📊 View Financial Reports
          </Link>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard title="Active Fleet" value={activeFleet.toString()} subtitle="Vehicles On Trip" color="text-blue-600" />
          <KPICard title="Maintenance Alerts" value={maintenanceAlerts.toString()} subtitle="Vehicles In Shop" color="text-red-600" />
          <KPICard title="Utilization Rate" value={`${utilizationRate}%`} subtitle="Assigned vs. Idle" color="text-green-600" />
          <KPICard title="Pending Cargo" value={pendingTrips.toString()} subtitle="Shipments Waiting" color="text-amber-600" />
        </div>

        {/* Active Trips Section (NEW) */}
        <section className="bg-white p-6 rounded-xl border shadow-sm mb-8">
          <div className="flex flex-row justify-between items-center w-full mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Active Dispatched Trips</h2>
            <Link href="/dispatch" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
              + New Dispatch
            </Link>
          </div>
          
          {activeTrips.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No trips currently dispatched. All vehicles are idle or in shop.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-sm uppercase text-slate-600">
                    <th className="p-3 border-b">Vehicle</th>
                    <th className="p-3 border-b">Driver</th>
                    <th className="p-3 border-b">Cargo Load</th>
                    <th className="p-3 border-b">Action (End Trip)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTrips.map((trip) => (
                    <tr key={trip.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium">{trip.vehicle.licensePlate}</td>
                      <td className="p-3 text-slate-600">{trip.driver.name}</td>
                      <td className="p-3">{trip.cargoWeight} kg</td>
                      <td className="p-3">
                        <CompleteTripForm tripId={trip.id} currentOdometer={trip.vehicle.odometer} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Vehicle Registry Snapshot */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Vehicle Registry (Snapshot)</h2>
            <Link href="/maintenance" className="bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium py-1.5 px-3 rounded-md transition-colors">
              🔧 Log Maintenance
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-sm uppercase text-slate-600">
                  <th className="p-3 border-b">License Plate</th>
                  <th className="p-3 border-b">Model</th>
                  <th className="p-3 border-b">Max Load</th>
                  <th className="p-3 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium">{vehicle.licensePlate}</td>
                    <td className="p-3 text-slate-600">{vehicle.model}</td>
                    <td className="p-3">{vehicle.maxCapacity} kg</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${vehicle.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          vehicle.status === 'On Trip' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

// Simple reusable UI component for the metric cards
function KPICard({ title, value, subtitle, color }: { title: string, value: string, subtitle: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className={`text-4xl font-bold mt-2 mb-1 ${color}`}>{value}</div>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  )
}