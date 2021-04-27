import sgMail from '@sendgrid/mail';
import AppError from '../common/appError';

import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } from '../common/constant';
import { FAILED_TO_SEND_EMAIL } from '../common/errorCodes';

export default class Email {
  constructor() {
    this.sgMail = sgMail;
    this.sgMail.setApiKey(SENDGRID_API_KEY);
  }

  sendUsingTemplate(emailTemplate, to, templateData) {
    try {
      const msg = {
        to,
        from: SENDGRID_FROM_EMAIL,
        templateId: emailTemplate,
        dynamicTemplateData: templateData,
      };

      return this.sgMail.send(msg);
    } catch (error) {
      throw new AppError(FAILED_TO_SEND_EMAIL, `Failed to send email. Reason: ${error.message}`);
    }
  }
}
