'use client'

import { useState } from 'react'
import { completeTrip } from './actions'

export default function CompleteTripForm({ tripId, currentOdometer }: { tripId: string, currentOdometer: number }) {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await completeTrip(formData)
    
    // Simple browser alert for error handling to save time in the hackathon
    if (result?.error) {
      alert(result.error) 
    }
    setIsLoading(false)
  }

  return (
    <form action={onSubmit} className="flex items-center gap-2">
      <input type="hidden" name="tripId" value={tripId} />
      <input
        type="number"
        name="finalOdometer"
        required
        min={currentOdometer + 1}
        placeholder={`> ${currentOdometer}`}
        className="w-24 p-1.5 text-sm border rounded-md bg-slate-50"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Saving...' : 'Mark Done'}
      </button>
    </form>
  )
}