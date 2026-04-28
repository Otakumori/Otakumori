import { CommerceCoreShell } from './CommerceCoreShell';

export function CommerceCoreHome() {
  return <CommerceCoreShell mode="shop" />;
}

export function CommerceCoreCart() {
  return <CommerceCoreShell mode="cart" />;
}

export function CommerceCoreAccount() {
  return <CommerceCoreShell mode="account" />;
}

export function CommerceCoreCheckout() {
  return <CommerceCoreShell mode="checkout" />;
}

export function CommerceCoreOrders() {
  return <CommerceCoreShell mode="orders" />;
}

export function CommerceCoreSuccess() {
  return <CommerceCoreShell mode="success" />;
}
