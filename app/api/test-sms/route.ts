import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log('Testing SMS with:', { phoneNumber, message });
    console.log('Environment variables:', {
      provider: process.env.SMS_PROVIDER,
      apiUrl: process.env.SMS_API_URL,
      userId: process.env.SMS_USER_ID,
      apiKey: process.env.SMS_API_KEY ? 'configured' : 'missing',
      password: process.env.SMS_PASSWORD ? 'configured' : 'missing'
    });
    
    const result = await smsService.sendSMS(phoneNumber, message);
    
    return NextResponse.json({
      success: true,
      result: result,
      config: {
        provider: process.env.SMS_PROVIDER,
        apiUrl: process.env.SMS_API_URL,
        userId: process.env.SMS_USER_ID,
        hasApiKey: !!process.env.SMS_API_KEY,
        hasPassword: !!process.env.SMS_PASSWORD
      }
    });
    
  } catch (error) {
    console.error('SMS test error:', error);
    return NextResponse.json(
      { error: 'SMS test failed', details: error.message },
      { status: 500 }
    );
  }
}