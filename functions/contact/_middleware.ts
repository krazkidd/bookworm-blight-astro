import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";
import type { PagesFunction } from "@cloudflare/workers-types";

// environment variables to be set in the Cloudflare Dashboard
interface Environment {
  DKIM_PRIVATE_KEY: string;
}

// class ValidationError extends Error {
//   constructor(message: string) {
//     super(message);
//   }
// }

// NOTE: This is Cloudflare middleware and requires DNS configuration.
//       See https://developers.cloudflare.com/pages/functions/plugins/mailchannels/

//TODO reenable the inspector
// async function mailChannelsInspector(context) {
//   try {
//     const mailChannelsResponse: Response = await context.next();

//     ERROR we need to gate this some other condition or else we get infinite redirect
//     if (mailChannelsResponse.ok) {
//       //console.log('MailChannels Inspector: OK');

//       return new Response(null, {
//         status: 302,
//         headers: { Location: "/thank-you/" },
//       });
//     } else if (mailChannelsResponse.status === 405 ) {
//       console.log('MailChannels Inspector: REJECTED', {
//         status: mailChannelsResponse.status,
//         statusText: mailChannelsResponse.statusText,
//       });

//       return new Response('Message not sent: Your message was rejected by the mail service. They use an aggressive spam filter. You can go back and try editing your message or use another means to contact me. Sorry!', { status: 500 });
//     } else {
//       console.log('MailChannels Inspector: ERROR', {
//         status: mailChannelsResponse.status,
//         statusText: mailChannelsResponse.statusText,
//       });

//       return new Response(`Message not sent: Mail service error (${mailChannelsResponse.status})`, { status: 500 });
//     }
//   } catch (err: any) {
//     if (err instanceof ValidationError) {
//       console.log('MailChannels Inspector: VALIDATION FAILED');

//       return new Response(`Message not sent: Missing form data '${err.message}'`, { status: 500 });
//     } else {
//       console.log('MailChannels Inspector: UNKNOWN ERROR');

//       return new Response('Message not sent: Unknown error', { status: 500 });
//     }
//   }
// }

const mailChannelsMiddleware: PagesFunction<Environment> = async (context) => {
  return mailChannelsPlugin({
    personalizations: ({ formData, name }) => {
      const userName = formData.get('name')?.toString();
      const userEmail = formData.get('email')?.toString();

      if (!userName) {
        //throw new ValidationError('name');
        throw new Error('Missing name');
      } else if (!userEmail) {
        //throw new ValidationError('email');
        throw new Error('Missing email');
      }

      return [
        {
          to: [
            {
              email: `${name}-form-submission@bookworm.org`
            }
          ],
          dkim_domain: 'bookworm.org',
          dkim_selector: 'mailchannels',
          dkim_private_key: context.env.DKIM_PRIVATE_KEY,
          reply_to: {
            name: userName,
            email: userEmail
          },
        },
      ];
    },
    from: ({ name }) => ({
      email: `${name}-form-submission@bookworm.org`,
    }),
    subject: ({ formData, name }) => formData.get('subject')?.toString() || `${name} form submission`,
    content: ({ formData }) => {
      const userMessage = formData.get('message')?.toString();

      if (!userMessage) {
        //throw new ValidationError('message');
        throw new Error('Missing message');
      }

      return [
        {
          type: 'text/plain',
          value: userMessage,
        },
      ];
    },
    respondWith: () => new Response(null, {
      status: 302,
      headers: { Location: "/thank-you/" },
    })
  })(context);
}

//TODO reenable the inspector
//export const onRequest = [mailChannelsInspector, mailChannelsMiddleware];
export const onRequest = [mailChannelsMiddleware];
