# Commerce Core

`/commerce-core` is the stable commerce route family for Otaku-mori.

This branch keeps customer-critical commerce separate from the immersive homepage, petals, games, community surfaces, and heavier animation systems. The goal is to make the storefront boring in the best possible way first: products, cart, account/shipping profile, checkout handoff, order history, and audit export surfaces should work before advanced systems are layered back in.

## Routes

- `/commerce-core` - product grid and cart entry
- `/commerce-core/cart` - local cart review
- `/commerce-core/account` - customer/shipping profile shell
- `/commerce-core/checkout` - checkout payload preparation and audit summary
- `/commerce-core/orders` - safe order history surface
- `/commerce-core/success` - safe checkout success surface

## Current implementation

The first working skeleton is intentionally self-contained. It uses local storage for cart and customer profile state, avoids shared provider dependencies, avoids Edge runtime, avoids broken integration calls, and never displays a hardcoded shipping charge. Shipping and tax are explicitly shown as calculated at payment.

## Next backend patch

Wire the checkout payload into `/api/v1/checkout/session` after the route accepts commerce-core line items, returns safe JSON for every failure mode, and uses commerce-core success/cancel URLs. Then replace local order placeholders with database-backed order history and export surfaces.
