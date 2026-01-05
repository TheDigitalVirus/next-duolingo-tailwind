import { CreateEmailOptions, Resend } from 'resend';

export interface SendEmailContent {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  userName?: string;
  streakDays?: number;
  language?: string;
}

export interface SendEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  content?: SendEmailContent;
  template?: 'welcome' | 'verification' | 'generic';
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  content = {},
  template = 'generic',
}: SendEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const { title, subtitle, description, buttonLabel, buttonUrl, userName, streakDays, language } = content;

  // Gerar HTML baseado no template
  let emailHtml = html;
  
  if (!emailHtml) {
    if (template === 'verification') {
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>${subject}</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .button { display: block !important; width: 100% !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f6f6;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                  <!-- Logo Header -->
                  <tr>
                    <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #eee;">
                      <h1 style="margin: 0; font-size: 28px; color: #58cc02; font-weight: bold;">duolingo</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 20px; text-align: center;">
                      <h2 style="margin: 0 0 20px 0; font-size: 28px; color: #333; font-weight: 600;">Verify your email</h2>
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #666; max-width: 500px; margin-left: auto; margin-right: auto;">
                        Thanks for helping us keep your account secure!<br />
                        Click the button below to finish verifying your email address.
                      </p>
                      
                      <p style="text-align: center; margin: 40px 0;">
                        <a href="${buttonUrl}" style="display: inline-block; background-color: #58cc02; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-size: 16px; font-weight: bold; border: none; cursor: pointer; box-shadow: 0 4px 0 #3ca000; transition: all 0.1s ease;">
                          CONFIRM EMAIL
                        </a>
                      </p>
                      
                      <p style="margin: 40px 0 0 0; font-size: 14px; color: #999;">
                        Didn't create an account? <a href="#" style="color: #58cc02; text-decoration: none; font-weight: 500;">Click here</a> to remove this email address.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 20px; background-color: #f9f9f9; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
                      <p style="margin: 0 0 10px 0;">
                        5900 Penn Avenue, Pittsburgh PA 15206, USA
                      </p>
                      <p style="margin: 0;">
                        <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else if (template === 'welcome') {
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>${subject}</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .button { display: block !important; width: 100% !important; }
              .section { padding: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f6f6;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 30px 20px;">
                      <h1 style="margin: 0 0 10px 0; font-size: 28px; color: #58cc02; font-weight: bold;">Duolingo</h1>
                      <p style="margin: 0; color: #666; font-size: 14px;">${process.env.RESEND_FROM_EMAIL}</p>
                    </td>
                  </tr>
                  
                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 0 20px 20px 20px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                        Hi${userName ? ' ' + userName : ''}!
                      </p>
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #333;">
                        I'm Duo the owl! Welcome to Duolingo, the world's #1 language learning app.
                      </p>
                      
                      <p style="text-align: center; margin: 30px 0;">
                        <a href="${buttonUrl}" style="display: inline-block; background-color: #58cc02; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-size: 16px; font-weight: bold; border: none; cursor: pointer; box-shadow: 0 4px 0 #3ca000; transition: all 0.1s ease;">
                          LEARN NOW
                        </a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Streak Tip Section -->
                  <tr>
                    <td class="section" style="padding: 30px 20px; background-color: #f0f9ff; border-top: 1px solid #e0f0ff; border-bottom: 1px solid #e0f0ff;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333; font-weight: 600;">Top tip: get to a ${streakDays || 7} day streak</h3>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                        Start strong! Once you get a ${streakDays || 7} day streak, you're far more likely to develop a learning habit and reach your goals. Keep that streak going!
                      </p>
                      <p style="text-align: center; margin: 20px 0 0 0;">
                        <a href="${buttonUrl}" style="display: inline-block; background-color: #ffffff; color: #58cc02; padding: 12px 24px; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: bold; border: 2px solid #58cc02; cursor: pointer;">
                          PRACTICE NOW
                        </a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Learning Plan Section -->
                  <tr>
                    <td class="section" style="padding: 30px 20px;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333; font-weight: 600;">Your personalized learning plan</h3>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                        Spending 30 minutes a day practicing ${language || 'Spanish'} can get you to the same reading and listening level as 4 semesters of university language classes — and in just 8 months!
                      </p>
                      <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                        *Recent studies demonstrated that after 120 hours of using the app, Duolingo learners' scores on reading and listening tests match university students who completed four semesters, or roughly 240 hours, of language study.
                      </p>
                      <p style="text-align: center; margin: 20px 0 0 0;">
                        <a href="${buttonUrl}" style="display: inline-block; background-color: #58cc02; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-size: 16px; font-weight: bold; border: none; cursor: pointer; box-shadow: 0 4px 0 #3ca000; transition: all 0.1s ease;">
                          LEARN NOW
                        </a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 20px; background-color: #f9f9f9; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
                      <p style="margin: 0 0 10px 0;">
                        5000 Penn Avenue, Pittsburgh PA 15206, USA
                      </p>
                      <p style="margin: 0;">
                        <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else {
      // Template genérico (padrão atual)
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 20px 10px; background-color: #f6f6f6; font-family: Arial, sans-serif; color: #333;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f6f6;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="5" style="background-color: #ffffff;">
                    <tr>
                      <td align="center" style="background-color: #ffffff; color: #333; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 20px;">Duolingo Clone</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; color: #333;">
                        ${title ? `<h2 style="margin-top: 0; font-size: 20px;">${title}</h2>` : ''}
                        ${subtitle ? `<p style="margin: 10px 0; font-size: 16px;">${subtitle}</p>` : ''}
                        ${
                          buttonLabel && buttonUrl
                            ? `
                          <p style="text-align: center; margin: 30px 0;">
                            <a href="${buttonUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 9px;">
                              ${buttonLabel}
                            </a>
                          </p>`
                            : ''
                        }
                        ${description ? `<p style="margin: 20px 0; font-size: 16px;">${description}</p>` : ''}
                        <p style="margin: 10px 0; font-size: 16px;">
                          Thank you,<br />
                          Duolingo Clone Team
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
    }
  }

  const msg: CreateEmailOptions = {
    from: `Duolingo <${process.env.RESEND_FROM_EMAIL || 'hello@duolingo.com'}>`,
    to,
    subject,
    text: text || subject,
    html: emailHtml,
  };

  try {
    await resend.emails.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('response' in error) {
        const response = (error as { response: { body: unknown } }).response;
        console.error('RESEND response:', response.body);
      }
    }
    throw error;
  }
}