import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { phone, message, hospitalName } = await request.json();

    // Validate inputs
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Check if Twilio credentials are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.log('[v0] Twilio credentials not configured - returning demo response');
      console.log(`[v0] SMS would be sent to ${phone} (${hospitalName}): ${message}`);

      // Demo mode - no credentials configured
      return NextResponse.json({
        success: true,
        message: `Demo Mode: SMS would be sent to ${hospitalName} at ${phone}`,
        phone,
        hospitalName,
        timestamp: new Date().toISOString(),
        smsContent: message,
        mode: 'demo',
      });
    }

    // Real SMS sending with Twilio
    const client = twilio(accountSid, authToken);

    const smsResponse = await client.messages.create({
      body: message,
      from: fromPhone,
      to: phone,
    });

    console.log('[v0] Real SMS sent:', smsResponse.sid);

    return NextResponse.json({
      success: true,
      message: `SMS sent to ${hospitalName} at ${phone}`,
      phone,
      hospitalName,
      timestamp: new Date().toISOString(),
      smsContent: message,
      mode: 'production',
      messageSid: smsResponse.sid,
    });
  } catch (error) {
    console.error('[v0] SMS error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS', details: (error as Error).message },
      { status: 500 }
    );
  }
}
