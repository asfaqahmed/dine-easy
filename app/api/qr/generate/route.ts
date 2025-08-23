import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url, table_number, type = 'table' } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // For API-based QR codes (simpler fallback)
      const apiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

      return NextResponse.json({
        success: true,
        qr_code_data_url: qrCodeDataURL,
        qr_code_api_url: apiQrUrl,
        url,
        table_number,
        type
      });
    } catch (qrError) {
      console.error('QR generation error:', qrError);
      
      // Fallback to API-based QR code
      const apiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      
      return NextResponse.json({
        success: true,
        qr_code_api_url: apiQrUrl,
        url,
        table_number,
        type
      });
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const table_number = searchParams.get('table_number');
    const type = searchParams.get('type') || 'table';

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Generate API-based QR code URL
    const apiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

    return NextResponse.json({
      success: true,
      qr_code_api_url: apiQrUrl,
      url,
      table_number,
      type
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}