import { prisma } from '../../../../lib/prisma'

export async function GET(req) {
    try {
        console.log("Fetching payment types...")
        const paymentTypes = await prisma.paymentType.findMany()
        return new Response(JSON.stringify(paymentTypes), { status: 200 })
    } catch (error) {
        console.error('Error fetching payment types:', error)
        return new Response(`Error: ${error.message}`, { status: 500 })
    }
}

