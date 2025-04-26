import { prisma } from '../../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
    const q = req.nextUrl.searchParams.get('q') || ''
    const tenants = await prisma.tenant.findMany({
        where: {
            OR: [
                { name: { contains: q } },
                { phone: { contains: q } },
                { note: { contains: q } }
            ]
        },
        include: { paymentType: true },
        orderBy: { id: 'asc' },
    })
    return NextResponse.json(tenants)
}

export async function POST(req) {
    const { name, phone, startDate, paymentTypeId, note } = await req.json()
    const isoDate = new Date(startDate).toISOString()
    const tenant = await prisma.tenant.create({
        data: { name, phone, startDate: isoDate, paymentTypeId: parseInt(paymentTypeId, 10), note }
    })
    return NextResponse.json(tenant)
}

export async function DELETE(req) {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ success: false, message: 'No IDs provided' }, { status: 400 })
    }
    await prisma.tenant.deleteMany({ where: { id: { in: ids.map(id => parseInt(id, 10)) } } })
    return NextResponse.json({ success: true })
}

export async function PUT(req) {
    const { id, name, phone, startDate, paymentTypeId, note } = await req.json()
    const isoDate = new Date(startDate).toISOString()
    const tenant = await prisma.tenant.update({
        where: { id },
        data: { name, phone, startDate: isoDate, paymentTypeId: parseInt(paymentTypeId, 10), note }
    })
    return NextResponse.json(tenant)
}
