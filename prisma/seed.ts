import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Planting seeds... 🌱')
  await prisma.log.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()
  // 1. Create Mock Users (RBAC)
  await prisma.user.create({
    data: { name: 'Fleet Manager', email: 'manager@fleet.com', role: 'Manager', password: 'password123' }
  })
  await prisma.user.create({
    data: { name: 'Dispatcher Pro', email: 'dispatch@fleet.com', role: 'Dispatcher', password: 'password123' }
  })

  // 2. Create Vehicles (Varying statuses and capacities)
  await prisma.vehicle.createMany({
    data: [
      { model: 'Light Van', licensePlate: 'GJ-01-AB-1234', maxCapacity: 500, odometer: 15000, status: 'Available', acquisitionCost: 25000 },
      { model: 'Heavy Truck', licensePlate: 'GJ-01-XY-9999', maxCapacity: 5000, odometer: 85000, status: 'In Shop', acquisitionCost: 80000 },
      { model: 'City Bike', licensePlate: 'GJ-01-BK-0011', maxCapacity: 50, odometer: 2000, status: 'On Trip', acquisitionCost: 1500 },
    ]
  })

  // 3. Create Drivers (Testing compliance: Alex is valid, Ravi has an expired license)
  await prisma.driver.createMany({
    data: [
      { name: 'Alex (Valid)', licenseExpiry: new Date('2028-12-31'), safetyScore: 98, status: 'Off Duty' },
      { name: 'Ravi (Expired)', licenseExpiry: new Date('2023-01-01'), safetyScore: 60, status: 'Suspended' },
      { name: 'Sarah (Active)', licenseExpiry: new Date('2027-06-15'), safetyScore: 100, status: 'On Duty' },
    ]
  })

  console.log('Database seeded successfully! Your fleet is ready. 🚚')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })