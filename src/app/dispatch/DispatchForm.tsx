'use client'

import { useState } from 'react'
import { dispatchTrip } from '../actions'
import { useRouter } from 'next/navigation'

export default function DispatchForm({ vehicles, drivers }: { vehicles: any[], drivers: any[] }) {
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    //call backend logic
    const result = await dispatchTrip(formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result.success) {
      setMessage({ type: 'success', text: result.success })
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
    setIsLoading(false)
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {/* Dynamic Alert Message */}
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Available Vehicle</label>
          <select name="vehicleId" required className="w-full p-2 border rounded-md bg-slate-50">
            <option value="">-- Choose a Vehicle --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.model} ({v.licensePlate}) - Max: {v.maxCapacity}kg</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Available Driver</label>
          <select name="driverId" required className="w-full p-2 border rounded-md bg-slate-50">
            <option value="">-- Choose a Driver --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} (License Expires: {new Date(d.licenseExpiry).toLocaleDateString()})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Weight (kg)</label>
          <input type="number" name="cargoWeight" required min="1" step="0.1" className="w-full p-2 border rounded-md bg-slate-50" placeholder="e.g. 450" />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Running Validation...' : 'Dispatch Trip'}
      </button>
    </form>
  )
}