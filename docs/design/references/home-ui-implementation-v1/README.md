# Home UI implementation pack v1

This directory preserves the untouched source masters selected from
`otakumori-home-ui-implementation-pack-v1`. The package SHA256 manifest was
verified before ingestion. These files are design authority; runtime code uses
the corresponding optimized WebP derivatives under `public/assets/home/ui/runtime/`.

| Runtime role                 | Locked source master                                     | Runtime derivative                                                                 |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Petal Wallet feature surface | `sakura_blossom_drawstring_pouch.png`                    | `runtime/petal-wallet-satchel.webp`                                                |
| Cart                         | `a_detailed_high_quality_stylized_illustration_on.png`   | `runtime/cart-japanese-merchant.webp`                                              |
| Blog                         | `ornate_sakura_leather_journal_icon.png`                 | `runtime/blog-journal.webp`                                                        |
| Wishlist                     | `ornate_sakura_heart_charm.png`                          | `runtime/wishlist-heart-charm.webp`                                                |
| Profile                      | `ornate_sakura_bronze_avatar_frame.png`                  | `runtime/profile-avatar-frame.webp`                                                |
| Soapstone/community message  | `ornate_sakura_sealed_letter.png`                        | `runtime/messages-sealed-letter.webp`                                              |
| Home search                  | `ornate_sakura_magnifying_glass.png`                     | `runtime/search-magnifier.webp`                                                    |
| Forward CTA                  | `a_clean_high_detail_isolated_object_on_a_transpa.png`   | `runtime/arrow-forward.webp`                                                       |
| Desktop cursor               | `a_clean_isolated_digital_illustration_asset_on_a_t.png` | `runtime/cursor-body-helper.webp`, `runtime/cursor-tassel-helper.webp`            |
| Home Soapstone plaque        | `sakura_bronze_stone_ui_plaque.png`                      | `runtime/soapstone-plaque-embedded.webp`                                          |

The derivatives preserve alpha and composition at their documented active display
scales. The largest interactive use is the 432px Soapstone panel; it retains a
1024px derivative for high-density screens. The original PNG copies were removed
from `public/` after all runtime references moved to WebP; masters above remain
the only source authority.

The archive grimoire, global settings cog, music controls, order, notification,
and reference-only destination assets were intentionally not mounted on Home:
this checkpoint does not create navigation or settings surfaces solely to host
art. Their authority remains in the approved package until an owned surface
exists.
