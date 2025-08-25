import { supabaseAdmin } from './supabase';

interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class SMSService {
  private apiUrl: string;
  private apiKey: string;
  private provider: string;
  private userId?: string;
  private password?: string;
  private senderId: string;

  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'notify.lk'; // Default to notify.lk
    
    if (this.provider === 'notify.lk') {
      this.apiUrl = process.env.SMS_API_URL || 'https://app.notify.lk/api/v1/';
      this.userId = process.env.SMS_USER_ID || '';
      this.apiKey = process.env.SMS_API_KEY || '';
      this.password = process.env.SMS_PASSWORD || '';
      this.senderId = process.env.SMS_SENDER_ID || 'NotifyDEMO';
    } else {
      // Send.lk configuration (legacy)
      this.apiUrl = process.env.SMS_API_URL || 'https://sms.send.lk/api/v3/';
      this.apiKey = process.env.SMS_API_KEY || '';
      this.senderId = process.env.SMS_SENDER_ID || 'DineEasy';
    }
  }

  async sendSMS(phoneNumber: string, message: string, orderId?: string): Promise<SMSResponse> {
    // Log SMS attempt to database
    const logStatus = await this.logSMS(phoneNumber, message, orderId, 'pending');
    
    if (this.provider === 'notify.lk') {
      return this.sendNotifyLkSMS(phoneNumber, message, logStatus.id);
    } else {
      return this.sendSendLkSMS(phoneNumber, message, logStatus.id);
    }
  }

  private async sendNotifyLkSMS(phoneNumber: string, message: string, logId?: string): Promise<SMSResponse> {
    if (!this.userId || !this.apiKey || !this.password) {
      console.log('Notify.lk credentials not configured, message would be:', message);
      console.log('Missing credentials:', {
        userId: !!this.userId,
        apiKey: !!this.apiKey,
        password: !!this.password
      });
      // Update log status to sent (demo mode)
      if (logId) {
        await this.updateSMSStatus(logId, 'sent');
      }
      return { success: true, message: 'SMS sent (demo mode - Notify.lk credentials not configured)' };
    }

    try {
      // Format phone number for Notify.lk (remove +, ensure 11 digits)
      let formattedPhone = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digits
      if (formattedPhone.startsWith('94')) {
        // Already has country code
        formattedPhone = formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        // Remove leading 0 and add country code
        formattedPhone = '94' + formattedPhone.substring(1);
      } else {
        // Add country code
        formattedPhone = '94' + formattedPhone;
      }

      // Notify.lk API format based on their documentation
      const requestBody = {
        user_id: this.userId,
        api_key: this.apiKey,
        sender_id: this.senderId,
        to: formattedPhone,
        message: message,
      };

      console.log('Sending SMS to Notify.lk:', {
        url: `${this.apiUrl}send`,
        body: { ...requestBody, api_key: 'hidden' }
      });

      const response = await fetch(`${this.apiUrl}send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Notify.lk response status:', response.status);
      console.log('Notify.lk response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        data = { message: responseText };
      }

      // Notify.lk might return different success indicators
      const isSuccess = response.ok && (
        data.status === 'success' || 
        data.status === '200' || 
        responseText.includes('success') ||
        responseText.includes('sent')
      );

      if (isSuccess) {
        // Update log status to sent
        if (logId) {
          await this.updateSMSStatus(logId, 'sent');
        }
        return { success: true, message: 'SMS sent successfully via Notify.lk', data };
      } else {
        // Update log status to failed
        if (logId) {
          await this.updateSMSStatus(logId, 'failed');
        }
        return { success: false, message: data.message || `Failed to send SMS via Notify.lk: ${responseText}` };
      }
    } catch (error) {
      console.error('Notify.lk SMS Service Error:', error);
      // Update log status to failed
      if (logId) {
        await this.updateSMSStatus(logId, 'failed');
      }
      return { success: false, message: `Notify.lk SMS service unavailable: ${error.message}` };
    }
  }

  private async sendSendLkSMS(phoneNumber: string, message: string, logId?: string): Promise<SMSResponse> {
    if (!this.apiKey) {
      console.log('Send.lk API key not configured, message would be:', message);
      // Update log status to sent (demo mode)
      if (logId) {
        await this.updateSMSStatus(logId, 'sent');
      }
      return { success: true, message: 'SMS sent (demo mode - Send.lk)' };
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
        // Update log status to sent
        if (logId) {
          await this.updateSMSStatus(logId, 'sent');
        }
        return { success: true, message: 'SMS sent successfully via Send.lk', data };
      } else {
        // Update log status to failed
        if (logId) {
          await this.updateSMSStatus(logId, 'failed');
        }
        return { success: false, message: data.message || 'Failed to send SMS via Send.lk' };
      }
    } catch (error) {
      console.error('Send.lk SMS Service Error:', error);
      // Update log status to failed
      if (logId) {
        await this.updateSMSStatus(logId, 'failed');
      }
      return { success: false, message: 'Send.lk SMS service unavailable' };
    }
  }

  private async logSMS(phoneNumber: string, message: string, orderId?: string, status: string = 'pending'): Promise<{ id?: string }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('sms_logs')
        .insert({
          phone_number: phoneNumber,
          message: message,
          status: status,
          order_id: orderId,
          sent_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('SMS logging error:', error);
        return {};
      }

      return { id: data.id };
    } catch (error) {
      console.error('SMS logging failed:', error);
      return {};
    }
  }

  private async updateSMSStatus(logId: string, status: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('sms_logs')
        .update({ status: status })
        .eq('id', logId);
    } catch (error) {
      console.error('SMS status update failed:', error);
    }
  }

  async sendOrderConfirmation(phoneNumber: string, orderNumber: string, totalAmount: number, orderId?: string): Promise<SMSResponse> {
    const message = `Order confirmed! Order #${orderNumber} for LKR ${totalAmount.toFixed(2)}. Thank you for choosing DineEasy! Track your order status online.`;
    return this.sendSMS(phoneNumber, message, orderId);
  }

  async sendOrderStatusUpdate(phoneNumber: string, orderNumber: string, status: string, orderId?: string): Promise<SMSResponse> {
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
    
    return this.sendSMS(phoneNumber, message, orderId);
  }

  async sendPaymentConfirmation(phoneNumber: string, orderNumber: string, amount: number, paymentId: string, orderId?: string): Promise<SMSResponse> {
    const message = `Payment confirmed for order #${orderNumber}. Amount: LKR ${amount.toFixed(2)}. Payment ID: ${paymentId}. Thank you! - DineEasy`;
    return this.sendSMS(phoneNumber, message, orderId);
  }
}

export const smsService = new SMSService();