# Niché launch roadmap

- [x] Restore and verify the storefront; remove blocking shopper-selection UI.
- [x] Add stock-aware outfit suggestions, wear-it-with looks and packages.
- [x] Add editable product stories and contact-first pre-order handling.
- [x] Store consented newsletter subscriptions; expose owner export.
- [x] Add owner area for orders, sales, inventory, messages, quotes and settings.
- [x] Support owner access and customer profiles (user answered “both”).
- [x] Show reduced prices alongside crossed-out original prices; manage discounts in owner area.
- [x] Secure owner access to the verified email provided by the user.
- [x] Add delivery preferences without inventing fees or payment promises.
- [x] Verify shopping and owner flows across screen sizes.
- [x] Document launch information needed and future features.

## Waiting for owner information
- [ ] Owner account: nobody is signed up yet, so no one holds owner access. Owner must register with bfiahenoo300i@gmail.com, then be granted owner access.
- [ ] Launch: real product photos, confirmed stock/prices/sizes, payment contacts, delivery fees/times and English/German policies.
- [ ] Gift cards: amounts, redemption conditions and expiry policy must be supplied before selling them.
- [ ] Owner email notifications: verified owned sender domain is required; stored submissions work now.
- [ ] Newsletter campaigns: dedicated marketing service/account is required; consent collection works now.

## Changed from the mockups
- Fashion retailer first, with a distinct Thrift corner and no obstructing category chooser.
- GHS prices; English/German shopping; international requests go through a quote.
- Sample products are labelled, and checkout stays closed pending verified launch information.

## Added beyond the mockups
- Stock-aware outfit packages, wear-it-with matching and editable product stories.
- Saved customer profiles and a role-checked owner studio with orders, sales, inventory and inbox.
- Original-price discount editing, delivery preferences and consented newsletter export.

## Later additions
- Gift cards after commercial terms are confirmed; automated payment confirmation after choosing a provider.
- Product photo uploads, AI styling and French; current outfit matching uses stock/style rules, not AI.

## Verified
- Profile persisted after reload; owner edited an original price and the storefront showed it crossed out.
- Ordinary customer was denied owner access; outfit package read back in the bag.
- Contact message and newsletter consent submitted through the UI and confirmed in stored records; test records removed.
- Phone, tablet and desktop views had no page overflow; 11 focused tests passed.
- Back button appears on every page except the home page and returns to the previous page.
- Order page shows a receipt download in English and German, with payment reference and total.
- Contact page links (WhatsApp, Instagram, Snapchat, Email, Call) render with correct destinations.
- Owner area opens for an account with owner access and shows the full "Before opening checkout" checklist; a signed-in customer without owner access is refused.
- Contacts and quotes are stored in the owner Inbox (More → Database → contact_messages / shipping_quotes); owner email is not sending yet.
- Receipt line-item list not yet seen in a browser: the launch gate blocked adding a test item while checkout was closed.
## Reminders
- [ ] Connect Paystack (owner will connect account later; then build automatic MoMo/card checkout)
