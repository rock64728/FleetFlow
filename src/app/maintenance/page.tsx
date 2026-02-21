import { PrismaClient } from '@prisma/client'
import MaintenanceForm from './MaintenanceForm'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function MaintenancePage() {
  
  const eligibleVehicles = await prisma.vehicle.findMany({ 
    where: { 
      NOT: { status: 'In Shop' } 
    } 
  })

  
  const recentLogs = await prisma.log.findMany({
    where: { type: 'Service' },
    include: { vehicle: true },
    orderBy: { date: 'desc' },
    take: 5
  })

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance & Service Logs</h1>
            <p className="text-slate-500 mt-2">Log repairs to automatically pull vehicles from the active fleet.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Log New Service</h2>
            <MaintenanceForm vehicles={eligibleVehicles} />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
             <h2 className="text-xl font-semibold mb-4 border-b pb-2">Recent Service History</h2>
             {recentLogs.length === 0 ? (
               <p className="text-sm text-slate-500">No service logs found.</p>
             ) : (
               <ul className="space-y-4">
                 {recentLogs.map(log => (
                   <li key={log.id} className="text-sm flex justify-between items-center border-b pb-2 last:border-0">
                     <div>
                       <p className="font-medium">{log.vehicle.licensePlate}</p>
                       <p className="text-slate-500 text-xs">{new Date(log.date).toLocaleDateString()}</p>
                     </div>
                     <div className="font-bold text-red-600">
                       ${log.cost.toFixed(2)}
                     </div>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      </div>
    </main>
  )
}