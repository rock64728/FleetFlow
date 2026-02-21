'use client'

import { useState } from 'react'
import { logMaintenance } from '../actions'
import { useRouter } from 'next/navigation'

export default function MaintenanceForm({ vehicles }: { vehicles: any[] }) {
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    const result = await logMaintenance(formData)
    
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
    <form action={onSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Select Vehicle</label>
        <select name="vehicleId" required className="w-full p-2 border rounded-md bg-slate-50">
          <option value="">-- Choose a Vehicle --</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.model} ({v.licensePlate}) - Currently: {v.status}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Repair Cost ($)</label>
        <input type="number" name="cost" required min="1" step="0.01" className="w-full p-2 border rounded-md bg-slate-50" placeholder="e.g. 250.00" />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 mt-4"
      >
        {isLoading ? 'Processing...' : 'Send to Shop'}
      </button>
    </form>
  )
}