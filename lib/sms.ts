interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class SMSService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.SMS_API_URL || 'https://sms.send.lk/api/v3/';
    this.apiKey = process.env.SMS_API_KEY || '';
  }

  async sendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
    if (!this.apiKey) {
      console.log('SMS API key not configured, message would be:', message);
      return { success: true, message: 'SMS sent (demo mode)' };
    }

    try {
      const response = await fetch(`${this.apiUrl}sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          recipient: phoneNumber,
          sender_id: 'DineEasy',
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'SMS sent successfully', data };
      } else {
        return { success: false, message: data.message || 'Failed to send SMS' };
      }
    } catch (error) {
      console.error('SMS Service Error:', error);
      return { success: false, message: 'SMS service unavailable' };
    }
  }

  async sendOrderConfirmation(phoneNumber: string, orderNumber: string, totalAmount: number): Promise<SMSResponse> {
    const message = `Order confirmed! Order #${orderNumber} for LKR ${totalAmount.toFixed(2)}. Thank you for choosing DineEasy! Track your order status online.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendOrderStatusUpdate(phoneNumber: string, orderNumber: string, status: string): Promise<SMSResponse> {
    let message = '';
    
    switch (status) {
      case 'preparing':
        message = `Your order #${orderNumber} is now being prepared. Estimated time: 15-20 minutes. - DineEasy`;
        break;
      case 'ready':
        message = `Great news! Your order #${orderNumber} is ready for pickup/serving. Thank you for your patience! - DineEasy`;
        break;
      case 'completed':
        message = `Order #${orderNumber} completed. Thank you for dining with DineEasy! We hope to see you again soon.`;
        break;
      default:
        message = `Order #${orderNumber} status updated to: ${status}. - DineEasy`;
    }
    
    return this.sendSMS(phoneNumber, message);
  }

  async sendPaymentConfirmation(phoneNumber: string, orderNumber: string, amount: number, paymentId: string): Promise<SMSResponse> {
    const message = `Payment confirmed for order #${orderNumber}. Amount: LKR ${amount.toFixed(2)}. Payment ID: ${paymentId}. Thank you! - DineEasy`;
    return this.sendSMS(phoneNumber, message);
  }
}

export const smsService = new SMSService();