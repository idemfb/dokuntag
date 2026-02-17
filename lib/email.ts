/**
 * Email Notification Service
 * Handles sending transactional emails for loyalty events
 * 
 * Supports: SendGrid, Resend, or console logging for development
 */

import { logInfo, logWarn, logError } from './logger';

export interface EmailTemplate {
  type: 'points_added' | 'reward_claimed' | 'reward_refunded' | 'promotion' | 'alert';
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface SendEmailOptions {
  to: string;
  userId: string;
  template: EmailTemplate;
}

/**
 * Email notification events
 */
export class EmailNotificationService {
  private static enabled = process.env.EMAIL_ENABLED === 'true';
  private static provider = process.env.EMAIL_PROVIDER || 'console'; // 'sendgrid', 'resend', 'console'

  /**
   * Send email notification
   */
  static async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    if (!this.enabled) {
      logInfo('EMAIL_DISABLED', { to: options.to });
      return { success: true };
    }

    try {
      const result = await this.sendViaProvider(options);
      
      logInfo('EMAIL_SENT', { to: options.to, userId: options.userId, template: options.template.type, messageId: result.messageId });

      return result;
    } catch (error) {
      logError('EMAIL_SEND_ERROR', { to: options.to, userId: options.userId, error });
      // Don't throw - email failures shouldn't break the main flow
      return { success: false };
    }
  }

  /**
   * Send via configured provider
   */
  private static async sendViaProvider(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    switch (this.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(options);
      case 'resend':
        return this.sendViaResend(options);
      case 'console':
      default:
        return this.sendViaConsole(options);
    }
  }

  /**
   * SendGrid implementation
   */
  private static async sendViaSendGrid(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const message = {
        to: options.to,
        from: process.env.EMAIL_FROM || 'noreply@dokuntag.com',
        subject: options.template.subject,
        text: options.template.textBody,
        html: options.template.htmlBody,
      };

      const response = await sgMail.send(message);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      throw new Error(`SendGrid hatası: ${String(error)}`);
    }
  }

  /**
   * Resend implementation
   */
  private static async sendViaResend(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@dokuntag.com',
        to: options.to,
        subject: options.template.subject,
        html: options.template.htmlBody,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return { success: true, messageId: response.data?.id };
    } catch (error) {
      throw new Error(`Resend hatası: ${String(error)}`);
    }
  }

  /**
   * Console implementation (for development)
   */
  private static async sendViaConsole(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const messageId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('\n📧 ==================== EMAIL ====================');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.template.subject}`);
    console.log('---');
    console.log(options.template.htmlBody);
    console.log('=============================================\n');

    return { success: true, messageId };
  }

  /**
   * Generate template: Points Added
   */
  static generatePointsAddedTemplate(userId: string, points: number, totalPoints: number): EmailTemplate {
    return {
      type: 'points_added',
      subject: `✨ ${points} Puan Eklendi!`,
      htmlBody: `
        <h2>Puanlarınız Güncellendi!</h2>
        <p>Merhaba,</p>
        <p>Hesabınıza <strong>${points} puan</strong> eklenmiştir.</p>
        <p>Toplam Puanlarınız: <strong>${totalPoints}</strong></p>
        <p>Bu puanları ödülleri satın almak için kullanabilirsiniz.</p>
        <p>Teşekkürler,<br>Dokuntag Takımı</p>
      `,
      textBody: `
        Puanlarınız Güncellendi!
        Merhaba,
        Hesabınıza ${points} puan eklenmiştir.
        Toplam Puanlarınız: ${totalPoints}
        Teşekkürler,
        Dokuntag Takımı
      `,
    };
  }

  /**
   * Generate template: Reward Claimed
   */
  static generateRewardClaimedTemplate(
    userId: string,
    rewardTitle: string,
    pointsSpent: number,
    remainingPoints: number
  ): EmailTemplate {
    return {
      type: 'reward_claimed',
      subject: `🎁 ${rewardTitle} Ödülü Talebiniz Alındı!`,
      htmlBody: `
        <h2>Ödül Talebiniz Başarılı!</h2>
        <p>Merhaba,</p>
        <p><strong>${rewardTitle}</strong> ödülünü talep ettiniz.</p>
        <p>Kullanılan Puan: <strong>${pointsSpent}</strong></p>
        <p>Kalan Puanlarınız: <strong>${remainingPoints}</strong></p>
        <p>Ödülünüz yakında teslim edilecektir.</p>
        <p>Teşekkürler,<br>Dokuntag Takımı</p>
      `,
      textBody: `
        Ödül Talebiniz Başarılı!
        Merhaba,
        ${rewardTitle} ödülünü talep ettiniz.
        Kullanılan Puan: ${pointsSpent}
        Kalan Puanlarınız: ${remainingPoints}
        Teşekkürler,
        Dokuntag Takımı
      `,
    };
  }

  /**
   * Generate template: Reward Refunded
   */
  static generateRewardRefundedTemplate(
    userId: string,
    rewardTitle: string,
    refundedPoints: number,
    totalPoints: number
  ): EmailTemplate {
    return {
      type: 'reward_refunded',
      subject: `✅ ${rewardTitle} Ödülü İade Edildi`,
      htmlBody: `
        <h2>Ödülünüz İade Edildi</h2>
        <p>Merhaba,</p>
        <p><strong>${rewardTitle}</strong> ödülü başarıyla iade edilmiştir.</p>
        <p>Geri Yatırılan Puan: <strong>${refundedPoints}</strong></p>
        <p>Toplam Puanlarınız: <strong>${totalPoints}</strong></p>
        <p>İadeden kaynaklanan herhangi bir sorunuz varsa lütfen bize ulaşın.</p>
        <p>Teşekkürler,<br>Dokuntag Takımı</p>
      `,
      textBody: `
        Ödülünüz İade Edildi
        Merhaba,
        ${rewardTitle} ödülü başarıyla iade edilmiştir.
        Geri Yatırılan Puan: ${refundedPoints}
        Toplam Puanlarınız: ${totalPoints}
        Teşekkürler,
        Dokuntag Takımı
      `,
    };
  }

  /**
   * Generate template: Promotion
   */
  static generatePromotionTemplate(userId: string, promotionTitle: string, bonusPoints: number): EmailTemplate {
    return {
      type: 'promotion',
      subject: `🎉 ${promotionTitle} - Bonus Puan Kazanın!`,
      htmlBody: `
        <h2>Özel Promosyon!</h2>
        <p>Merhaba,</p>
        <p><strong>${promotionTitle}</strong></p>
        <p>Bu kampanyada <strong>${bonusPoints} bonus puan</strong> kazanabilirsiniz!</p>
        <p>Fırsatı kaçırmayın!</p>
        <p>Teşekkürler,<br>Dokuntag Takımı</p>
      `,
      textBody: `
        Özel Promosyon!
        Merhaba,
        ${promotionTitle}
        Bu kampanyada ${bonusPoints} bonus puan kazanabilirsiniz!
        Teşekkürler,
        Dokuntag Takımı
      `,
    };
  }

  /**
   * Send templated email
   */
  static async sendTemplated(
    to: string,
    userId: string,
    templateType: EmailTemplate['type'],
    data: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string }> {
    let template: EmailTemplate;

    switch (templateType) {
      case 'points_added':
        template = this.generatePointsAddedTemplate(userId, data.points, data.totalPoints);
        break;
      case 'reward_claimed':
        template = this.generateRewardClaimedTemplate(userId, data.rewardTitle, data.pointsSpent, data.remainingPoints);
        break;
      case 'reward_refunded':
        template = this.generateRewardRefundedTemplate(userId, data.rewardTitle, data.refundedPoints, data.totalPoints);
        break;
      case 'promotion':
        template = this.generatePromotionTemplate(userId, data.promotionTitle, data.bonusPoints);
        break;
      default:
        throw new Error(`Bilinmeyen template türü: ${templateType}`);
    }

    return this.send({ to, userId, template });
  }
}

// Export singleton instance
export const emailService = EmailNotificationService;
