import { PrismaClient } from '@prisma/client'
import DispatchForm from './DispatchForm'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function DispatchPage() {
  // Fetch available vehicles 
  const availableVehicles = await prisma.vehicle.findMany({ 
    where: { status: 'Available' } 
  })
  
  
  const availableDrivers = await prisma.driver.findMany({ 
    where: { status: 'Off Duty' } 
  })

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trip Dispatcher</h1>
            <p className="text-slate-500 mt-2">Assign drivers and vehicles to new shipments.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
        </header>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <DispatchForm vehicles={availableVehicles} drivers={availableDrivers} />
        </div>
      </div>
    </main>
  )
}