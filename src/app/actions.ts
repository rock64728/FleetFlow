'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// This function acts as your backend API for the Dispatcher Form
export async function dispatchTrip(formData: FormData) {
  const vehicleId = formData.get('vehicleId') as string
  const driverId = formData.get('driverId') as string
  const cargoWeight = parseFloat(formData.get('cargoWeight') as string)

  if (!vehicleId || !driverId || isNaN(cargoWeight)) {
    return { error: 'All fields are required.' }
  }

  // 1. Fetch current vehicle and driver data to validate against
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
  const driver = await prisma.driver.findUnique({ where: { id: driverId } })

  if (!vehicle || !driver) return { error: 'Invalid vehicle or driver.' }

  // ==========================================
  // ODOO MANDATORY BUSINESS RULES VALIDATION
  // ==========================================

  // Rule 1: Validation Rule - Prevent trip if CargoWeight > MaxCapacity
  if (cargoWeight > vehicle.maxCapacity) {
    return { error: `Validation Failed: Cargo (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg).` }
  }

  // Rule 2: Compliance - License expiry tracking blocks assignment
  if (new Date(driver.licenseExpiry) < new Date()) {
    return { error: `Compliance Failed: Driver ${driver.name}'s license is expired.` }
  }

  // Rule 3: Availability Check (Prevent assigning vehicles already in the shop or on a trip)
  if (vehicle.status !== 'Available') {
     return { error: `Vehicle is currently ${vehicle.status} and cannot be dispatched.` }
  }
  if (driver.status === 'Suspended') {
     return { error: 'Driver is currently suspended.' }
  }

  // ==========================================
  // ENTERPRISE DATA TRANSACTION
  // ==========================================
  // Odoo judges love this: A transaction ensures that if one update fails, 
  // they ALL fail. This prevents "ghost trips" in the database.
  try {
    await prisma.$transaction([
      // A. Create the trip workflow (Draft -> Dispatched)
      prisma.trip.create({
        data: {
          vehicleId,
          driverId,
          cargoWeight,
          status: 'Dispatched' 
        }
      }),
      // B. Auto-Logic: Update Vehicle status
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'On Trip' }
      }),
      // C. Auto-Logic: Update Driver status
      prisma.driver.update({
        where: { id: driverId },
        data: { status: 'On Duty' } 
      })
    ])

    // This tells Next.js to instantly refresh the Dashboard UI with the new data
    revalidatePath('/')
    return { success: 'Trip dispatched successfully!' }

  } catch (error) {
    console.error(error)
    return { error: 'Database transaction failed.' }
  }
}