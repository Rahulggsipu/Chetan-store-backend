import { Router, Request, Response } from 'express';

const router = Router();

// ------------------------------------
// GET - Webhook verification
// ------------------------------------

router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (
    mode === 'subscribe' &&
    token === verifyToken
  ) {
    console.log('WhatsApp webhook verified');

    return res.status(200).send(challenge);
  }

  console.error('WhatsApp webhook verification failed');

  return res.sendStatus(403);
});

// ------------------------------------
// POST - Receive WhatsApp events
// ------------------------------------

router.post('/', (req: Request, res: Response) => {
  try {
    console.log(
      'WhatsApp Webhook:',
      JSON.stringify(req.body, null, 2)
    );

    const entries = req.body?.entry || [];

    for (const entry of entries) {
      const changes = entry?.changes || [];

      for (const change of changes) {
        const value = change?.value;

        // ------------------------------------
        // Message status
        // ------------------------------------

        const statuses = value?.statuses || [];

        for (const status of statuses) {
          console.log('--------------------------------');
          console.log('WhatsApp Message Status');
          console.log('Message ID:', status.id);
          console.log('Status:', status.status);
          console.log('Recipient:', status.recipient_id);

          if (status.timestamp) {
            console.log(
              'Timestamp:',
              new Date(
                Number(status.timestamp) * 1000
              ).toISOString()
            );
          }

          // ------------------------------------
          // Failed message
          // ------------------------------------

          if (status.status === 'failed') {
            console.error(
              'WhatsApp message FAILED'
            );

            console.error(
              'Errors:',
              JSON.stringify(
                status.errors,
                null,
                2
              )
            );
          }

          console.log('--------------------------------');
        }

        // ------------------------------------
        // Incoming customer messages
        // ------------------------------------

        const messages = value?.messages || [];

        for (const message of messages) {
          console.log('--------------------------------');
          console.log(
            'Incoming WhatsApp Message'
          );

          console.log(
            'From:',
            message.from
          );

          console.log(
            'Message ID:',
            message.id
          );

          console.log(
            'Message Type:',
            message.type
          );

          if (message.type === 'text') {
            console.log(
              'Message:',
              message.text?.body
            );
          }

          console.log('--------------------------------');
        }
      }
    }

    // IMPORTANT:
    // Always return 200 quickly to Meta.
    return res.sendStatus(200);

  } catch (error) {
    console.error(
      'WhatsApp webhook error:',
      error
    );

    return res.sendStatus(500);
  }
});

export default router;
