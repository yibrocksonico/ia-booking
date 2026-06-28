import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    // Fetch catalog for dynamic capacity and names
    const catalog = await prisma.catalog.findMany();
    const totalCapacity = catalog.reduce((sum, item) => sum + item.capacity, 0) || 42;

    // Fetch all bookings except cancelled ones for general stats
    const bookings = await prisma.booking.findMany({
      include: {
        accommodation: true,
      },
      orderBy: {
        checkIn: 'asc',
      },
    });

    // 1. Filter out expired blocks
    const activeBookings = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (b.status === 'blocked' && b.expiresAt && new Date(b.expiresAt) < now) return false;
      return true;
    });

    // 2. Total active/confirmed bookings
    const totalBookings = activeBookings.length;
    const confirmedBookings = activeBookings.filter((b) => b.status === 'confirmed').length;
    const pendingBookings = activeBookings.filter((b) => b.status === 'blocked').length;

    // 3. Total revenue (confirmed only)
    const confirmedOnly = activeBookings.filter((b) => b.paymentStatus === 'completed');
    const totalRevenue = confirmedOnly.reduce((sum, b) => sum + b.totalPrice, 0);

    // 4. Monthly metrics (Revenue & Ocupancy)
    const monthlyData: { [key: string]: { revenue: number; bookingsCount: number; nightsSold: number } } = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    confirmedOnly.forEach((b) => {
      const date = new Date(b.checkIn);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthLabel = `${months[monthIndex]} ${year}`;

      if (!monthlyData[monthLabel]) {
        monthlyData[monthLabel] = { revenue: 0, bookingsCount: 0, nightsSold: 0 };
      }

      monthlyData[monthLabel].revenue += b.totalPrice;
      monthlyData[monthLabel].bookingsCount += 1;

      // Calculate nights
      const diffTime = Math.abs(new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime());
      const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      monthlyData[monthLabel].nightsSold += nights;
    });

    const monthlyReport = Object.keys(monthlyData).map((key) => {
      // Average occupancy rate: (nights sold / (capacity * days in month))
      // For simplicity, let's assume average of 30 days per month.
      const maxMonthlyCapacity = totalCapacity * 30;
      const occupancyRate = Math.min(100, Math.round((monthlyData[key].nightsSold / maxMonthlyCapacity) * 100));

      return {
        month: key,
        revenue: monthlyData[key].revenue,
        bookings: monthlyData[key].bookingsCount,
        occupancyRate,
      };
    });

    // 5. Customer statistics (Visits Frequency / Loyalty)
    const customerStatsMap: {
      [email: string]: {
        name: string;
        phone: string;
        email: string;
        bookingCount: number;
        totalSpent: number;
        lastBookingDate: Date;
      };
    } = {};

    activeBookings.forEach((b) => {
      const email = b.customerEmail.toLowerCase().trim();
      if (!customerStatsMap[email]) {
        customerStatsMap[email] = {
          name: b.customerName,
          phone: b.customerPhone,
          email: b.customerEmail,
          bookingCount: 0,
          totalSpent: 0,
          lastBookingDate: b.checkIn,
        };
      }

      customerStatsMap[email].bookingCount += 1;
      if (b.paymentStatus === 'completed') {
        customerStatsMap[email].totalSpent += b.totalPrice;
      }
      if (new Date(b.checkIn) > new Date(customerStatsMap[email].lastBookingDate)) {
        customerStatsMap[email].lastBookingDate = b.checkIn;
      }
    });

    const customersList = Object.values(customerStatsMap).sort((a, b) => b.bookingCount - a.bookingCount);

    // 6. Distribution of Payment Methods
    const paymentMethods = {
      paypal: confirmedOnly.filter((b) => b.paymentMethod === 'paypal').length,
      transfer: confirmedOnly.filter((b) => b.paymentMethod === 'transfer').length,
      conekta: confirmedOnly.filter((b) => b.paymentMethod === 'conekta').length,
    };

    // 7. Distribution by accommodation type (dynamic from catalog)
    const accommodationDistribution: { [key: string]: number } = {};
    catalog.forEach((item) => {
      accommodationDistribution[item.id] = confirmedOnly.filter((b) => b.accommodationId === item.id).length;
    });

    // 8. Day of week demand (suggested report)
    // Find check-in weekdays
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekdayDemand = [0, 0, 0, 0, 0, 0, 0];

    confirmedOnly.forEach((b) => {
      const day = new Date(b.checkIn).getDay();
      weekdayDemand[day] += 1;
    });

    const demandByDay = weekdayNames.map((name, index) => ({
      day: name,
      count: weekdayDemand[index],
    }));

    return NextResponse.json({
      summary: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue,
      },
      monthlyReport,
      paymentMethods,
      accommodationDistribution,
      demandByDay,
      topCustomers: customersList.slice(0, 15), // Top 15 loyal customers
      allCustomers: customersList,
    });
  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
