import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your order #{orderNumber} has been confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="/brand/email-header.png"
            width="600"
            height="120"
            alt="Otaku-mori"
            style={logo}
          />
        </Section>

        <Heading style={h1}>Order Confirmed!</Heading>

        <Text style={text}>Hi {customerName},</Text>

        <Text style={text}>
          Thank you for your order! We've received your payment and are preparing your items for
          shipment.
        </Text>

        <Section style={orderDetails}>
          <Text style={orderNumberText}>Order #{orderNumber}</Text>

          <Section style={itemsSection}>
            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Section style={itemImage}>
                  {item.imageUrl && (
                    <Img
                      src={item.imageUrl}
                      width="80"
                      height="80"
                      alt={item.name}
                      style={itemImageStyle}
                    />
                  )}
                </Section>
                <Section style={itemDetails}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={itemPrice}>${(item.price / 100).toFixed(2)}</Text>
                </Section>
              </Section>
            ))}
          </Section>

          <Section style={totalsSection}>
            <Section style={totalRow}>
              <Text style={totalLabel}>Subtotal:</Text>
              <Text style={totalValue}>${(subtotal / 100).toFixed(2)}</Text>
            </Section>
            <Section style={totalRow}>
              <Text style={totalLabel}>Shipping:</Text>
              <Text style={totalValue}>${(shipping / 100).toFixed(2)}</Text>
            </Section>
            <Section style={totalRow}>
              <Text style={totalLabel}>Total:</Text>
              <Text style={totalValueBold}>${(total / 100).toFixed(2)}</Text>
            </Section>
          </Section>
        </Section>

        <Section style={shippingSection}>
          <Heading style={h2}>Shipping Address</Heading>
          <Text style={addressText}>
            {shippingAddress.name}
            <br />
            {shippingAddress.line1}
            <br />
            {shippingAddress.line2 && `${shippingAddress.line2}<br />`}
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            <br />
            {shippingAddress.country}
          </Text>
        </Section>

        <Text style={text}>
          We'll send you a tracking number once your order ships. You can also check your order
          status in your account.
        </Text>

        <Section style={footer}>
          <Link href="https://www.otaku-mori.com" style={link}>
            Visit Otaku-mori
          </Link>
          <Text style={footerText}>
            Questions? Reply to this email or contact our support team.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#ec4899',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
  padding: '0',
};

const text = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const orderDetails = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const orderNumberText = {
  color: '#ec4899',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const itemsSection = {
  margin: '24px 0',
};

const itemRow = {
  display: 'flex',
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #333',
};

const itemImage = {
  marginRight: '16px',
};

const itemImageStyle = {
  borderRadius: '4px',
};

const itemDetails = {
  flex: 1,
};

const itemName = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#cccccc',
  fontSize: '14px',
  margin: '0 0 4px',
};

const itemPrice = {
  color: '#ec4899',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const totalsSection = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #333',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const totalLabel = {
  color: '#cccccc',
  fontSize: '16px',
  margin: '0',
};

const totalValue = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
};

const totalValueBold = {
  color: '#ec4899',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const shippingSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const addressText = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '48px',
};

const link = {
  color: '#ec4899',
  fontSize: '16px',
  textDecoration: 'underline',
};

const footerText = {
  color: '#cccccc',
  fontSize: '14px',
  margin: '16px 0 0',
};

export default OrderConfirmationEmail;
