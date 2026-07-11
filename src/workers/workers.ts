import type { Job } from 'bullmq';
import { logger } from '../config/logger';
import { QueueName, queueManager } from '../modules/queue/queue.manager';
import { whatsappService } from '../modules/whatsapp/whatsapp.service';
import { EmailService } from '../modules/email/email.service';
import { NotificationService } from '../modules/notification/notification.service';
import { LoggingService } from '../modules/logging/logging.service';

const whatsappService_worker = whatsappService;
const emailService = new EmailService();
const notificationService = new NotificationService();
const loggingService = new LoggingService();

export function registerAllWorkers() {
  queueManager.registerWorker(QueueName.WHATSAPP, async (job: Job) => {
    const { to, message, messageId } = job.data;
    try {
      await whatsappService_worker.sendMessage(to, message);
      await whatsappService_worker.updateMessageStatus(messageId, 'sent');
      loggingService.systemLog({ level: 'info', module: 'whatsapp_worker', message: `Message sent to ${to}` });
    } catch (err: any) {
      await whatsappService_worker.updateMessageStatus(messageId, 'failed', err.message);
      loggingService.systemLog({ level: 'error', module: 'whatsapp_worker', message: err.message });
      throw err;
    }
  });

  queueManager.registerWorker(QueueName.EMAIL, async (job: Job) => {
    const { to, subject, body, messageId } = job.data;
    try {
      await emailService.sendEmail(to, subject, body);
      await emailService.updateEmailStatus(messageId, 'sent');
      loggingService.systemLog({ level: 'info', module: 'email_worker', message: `Email sent to ${to}` });
    } catch (err: any) {
      await emailService.updateEmailStatus(messageId, 'failed', err.message);
      loggingService.systemLog({ level: 'error', module: 'email_worker', message: err.message });
      throw err;
    }
  });

  queueManager.registerWorker(QueueName.NOTIFICATION, async (job: Job) => {
    const { channel, recipient, title, body, notificationId } = job.data;
    try {
      await notificationService.dispatch(channel, { recipient, title, body });
      await notificationService.updateStatus(notificationId, 'sent');
      loggingService.systemLog({ level: 'info', module: 'notification_worker', message: `${channel} sent to ${recipient}` });
    } catch (err: any) {
      await notificationService.updateStatus(notificationId, 'failed');
      loggingService.systemLog({ level: 'error', module: 'notification_worker', message: err.message });
      throw err;
    }
  });

  queueManager.registerWorker(QueueName.AI, async (job: Job) => {
    const { type } = job.data;
    loggingService.systemLog({ level: 'info', module: 'ai_worker', message: `AI job type: ${type}` });
  });

  queueManager.registerWorker(QueueName.REPORT, async (job: Job) => {
    const { name } = job.data;
    loggingService.systemLog({ level: 'info', module: 'report_worker', message: `Report generation: ${name}` });
  });

  logger.info('All workers registered');
}
