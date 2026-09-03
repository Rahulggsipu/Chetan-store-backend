import axios from 'axios';

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface WhatsAppOrderData {
    phone: string;
    customerName: string;
    orderId: string;
    items: OrderItem[];
    totalAmount: number;
}

export const sendOrderWhatsAppMessage = async ({
    phone,
    customerName,
    orderId,
    items,
    totalAmount,
}: WhatsAppOrderData): Promise<void> => {
    const itemLines = items
        .map(
            (item, index) =>
                `${index + 1}. ${item.name} - Qty: ${item.quantity} - ₹${item.subtotal.toFixed(2)}`
        )
        .join('\n');

    const url = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // WhatsApp expects the phone number in international format
    // Example: +91 9876543210 -> 919876543210
    const recipientPhone = phone.replace(/\D/g, '');

    try {
        // const response = await axios.post(
        //   url,
        //   {
        //     messaging_product: 'whatsapp',
        //     to: `91${recipientPhone}`,
        //     type: 'template',
        //     template: {
        //       name: 'order_confirmation',
        //       language: {
        //         code: 'en_US',
        //       },
        //       components: [
        //         {
        //           type: 'body',
        //           parameters: [
        //             {
        //               type: 'text',
        //               text: customerName,
        //             },
        //             {
        //               type: 'text',
        //               text: orderId,
        //             },
        //             {
        //               type: 'text',
        //               text: itemLines,
        //             },
        //             {
        //               type: 'text',
        //               text: `₹${totalAmount.toFixed(2)}`,
        //             },
        //           ],
        //         },
        //       ],
        //     },
        //   },
        //   {
        //     headers: {
        //       Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        //       'Content-Type': 'application/json',
        //     },
        //   }
        // );
        const response = await axios.post(
            url,
            {
                messaging_product: 'whatsapp',
                to: `91${recipientPhone}`,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: {
                        code: 'en_US',
                    },
                    components: [
                    ],
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('WhatsApp order confirmation sent:', {
            phone: recipientPhone,
            orderId,
            response: response.data,
        });
    } catch (error: any) {
        console.error(
            'Failed to send WhatsApp order confirmation:',
            error.response?.data || error.message
        );

        throw error;
    }
};
