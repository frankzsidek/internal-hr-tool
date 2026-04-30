import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/** Google Calendar all-day events use an exclusive end date (day after the last visible day). */
function exclusiveEnd(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Google Calendar credentials not configured');

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
  return google.calendar({ version: 'v3', auth });
}

const calendarId = () => {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error('GOOGLE_CALENDAR_ID not configured');
  return id;
};

// POST /api/calendar  — create an event, returns { eventId }
// PATCH /api/calendar — update an existing event
// DELETE /api/calendar — delete an event
export async function POST(req: NextRequest) {
  try {
    const { employeeName, leaveType, startDate, endDate, leaveId } = await req.json();
    if (!employeeName || !leaveType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const calendar = getCalendarClient();
    const summary = leaveType === 'sick'
      ? `🤒 Sick Leave — ${employeeName}`
      : `🌴 Vacation — ${employeeName}`;

    const event = await calendar.events.insert({
      calendarId: calendarId(),
      requestBody: {
        summary,
        description: `Leave ID: ${leaveId}`,
        start: { date: startDate },
        end: { date: exclusiveEnd(endDate) },
        transparency: 'transparent',
        colorId: leaveType === 'sick' ? '5' : '2', // banana=sick, sage=vacation
      },
    });

    return NextResponse.json({ eventId: event.data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[calendar POST]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { eventId, employeeName, leaveType, startDate, endDate, leaveId } = await req.json();
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    const calendar = getCalendarClient();
    const summary = leaveType === 'sick'
      ? `🤒 Sick Leave — ${employeeName}`
      : `🌴 Vacation — ${employeeName}`;

    await calendar.events.update({
      calendarId: calendarId(),
      eventId,
      requestBody: {
        summary,
        description: `Leave ID: ${leaveId}`,
        start: { date: startDate },
        end: { date: exclusiveEnd(endDate) },
        transparency: 'transparent',
        colorId: leaveType === 'sick' ? '5' : '2',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[calendar PATCH]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { eventId } = await req.json();
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    const calendar = getCalendarClient();
    await calendar.events.delete({ calendarId: calendarId(), eventId });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[calendar DELETE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
