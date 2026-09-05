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
    // -----------------------------
    // Create product list
    // -----------------------------
    //
    // IMPORTANT:
    // WhatsApp template parameters cannot contain
    // newline/tab characters.
    //
    // Therefore, don't use .join('\n').
    // Use " | " instead.
    //

    const itemLines = items
        .map(
            (item, index) =>
                `${index + 1}. ${item.name} - Qty: ${item.quantity} - ₹${item.subtotal.toFixed(2)}`
        )
        .join(' | ');

    // -----------------------------
    // Prepare customer phone
    // -----------------------------

    let recipientPhone = phone.replace(/\D/g, '');

    if (recipientPhone.length === 10) {
        recipientPhone = `91${recipientPhone}`;
    }

    if (!/^91\d{10}$/.test(recipientPhone)) {
        throw new Error(
            `Invalid customer WhatsApp phone number: ${phone}`
        );
    }

    // -----------------------------
    // Prepare owner phone numbers
    // -----------------------------

    const owner1Phone = (
        process.env.OWNER_1_WHATSAPP_NUMBER ?? ''
    ).replace(/\D/g, '');

    const owner2Phone = (
        process.env.OWNER_2_WHATSAPP_NUMBER ?? ''
    ).replace(/\D/g, '');

    if (!/^91\d{10}$/.test(owner1Phone)) {
        throw new Error(
            'OWNER_1_WHATSAPP_NUMBER is missing or invalid'
        );
    }

    if (!/^91\d{10}$/.test(owner2Phone)) {
        throw new Error(
            'OWNER_2_WHATSAPP_NUMBER is missing or invalid'
        );
    }

    // -----------------------------
    // WhatsApp API configuration
    // -----------------------------

    const phoneNumberId =
        process.env.WHATSAPP_PHONE_NUMBER_ID;

    const accessToken =
        process.env.WHATSAPP_TOKEN;

    if (!phoneNumberId) {
        throw new Error(
            'WHATSAPP_PHONE_NUMBER_ID is missing'
        );
    }

    if (!accessToken) {
        throw new Error(
            'WHATSAPP_TOKEN is missing'
        );
    }

    const url =
        `https://graph.facebook.com/v25.0/` +
        `${phoneNumberId}/messages`;

    // -----------------------------
    // Headers
    // -----------------------------

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    // -----------------------------
    // Send WhatsApp message
    // -----------------------------

    const sendMessage = async (recipient: string) => {
        return axios.post(
            url,
            {
                messaging_product: 'whatsapp',

                to: recipient,

                type: 'template',

                template: {
                    name: 'order_confirmation',

                    language: {
                        code: 'en',
                    },

                    components: [
                        {
                            type: 'body',

                            parameters: [
                                {
                                    type: 'text',
                                    parameter_name: 'customer_name',
                                    text: customerName,
                                },

                                {
                                    type: 'text',
                                    parameter_name: 'order_id',
                                    text: orderId,
                                },

                                {
                                    type: 'text',
                                    parameter_name: 'item_lines',
                                    text: itemLines,
                                },

                                {
                                    type: 'text',
                                    parameter_name: 'total_amount',
                                    text: `₹${totalAmount.toFixed(2)}`,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                headers,
            }
        );
    };

    // -----------------------------
    // Send to customer + owners
    // -----------------------------

    try {
        const [
            customerResponse,
            owner1Response,
            owner2Response,
        ] = await Promise.all([
            sendMessage(recipientPhone),
            sendMessage(owner1Phone),
            sendMessage(owner2Phone),
        ]);

        console.log(
            'WhatsApp order confirmations sent successfully:',
            {
                orderId,

                customer: {
                    phone: recipientPhone,
                    response: customerResponse.data,
                },

                owner1: {
                    phone: owner1Phone,
                    response: owner1Response.data,
                },

                owner2: {
                    phone: owner2Phone,
                    response: owner2Response.data,
                },
            }
        );
    } catch (error: any) {
        console.error(
            'Failed to send WhatsApp order confirmation:',
            error.response?.data ||
            error.message
        );

        throw error;
    }
};
