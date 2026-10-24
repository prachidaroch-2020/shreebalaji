# Shree Balaji Fruits and Vegetable: order & pickup app

A working demo of the order management system for Shree Balaji's three stores: **Vegetable Store**, **Fruit Store** and **Juice Junction**.

Customers order from all three stores in one basket and get a pickup token. Each store packs its own items. The customer gets a ready message when the whole order is packed, then pays and collects at Main Counter.

**Live demo:** https://prachidaroch-2020.github.io/shreebalaji/

Works on phone, tablet and laptop.

## Logins (demo)

| Role | Username | Password | What you can do |
|---|---|---|---|
| Owner | `owner` | `Owner@123` | Dashboard, orders, sales & revenue report, payments, rates & stock overview |
| Store staff | `staff` | `Staff@123` | Publish daily rates, mark items out of stock, weigh and pack orders, take payment at the counter |
| Customer | no login | | Shop, place an order, approve weight changes, track, collect |

Direct links: [Customer](https://prachidaroch-2020.github.io/shreebalaji/#shop) · [Staff](https://prachidaroch-2020.github.io/shreebalaji/#staff) · [Owner](https://prachidaroch-2020.github.io/shreebalaji/#admin) · [Presentation mode](https://prachidaroch-2020.github.io/shreebalaji/#demo)

## What's in the app

| Screen | Features |
|---|---|
| **Customer** | Today's rates, search, categories, out-of-stock labels, basket across all stores, token, live tracking per store, approve a higher weight, ready message, receipt |
| **Staff → Orders** | One queue per store, weighing with scale reading, pack and mark ready, Main Counter handover with Paid by UPI / Paid by cash |
| **Staff → Today's rates & stock** | Edit every rate, copy yesterday's rates, publish, mark items in stock or out of stock |
| **Owner → Overview** | Orders, sales, in preparation, ready, collected (UPI / cash), awaiting payment, live orders, needs attention, stores, activity log |
| **Owner → Sales & revenue** | Today / last 7 days / last 30 days, change vs previous period, sales chart, revenue by store, top products |
| **Owner → Payments** | Today's payments with method filter, awaiting payment, 7-day settlement |
| **Owner → Rates & stock** | Read-only view of today's rates vs yesterday and stock status |
| **Presentation mode** | Customer phone, store screens and owner dashboard side by side |

## Demo walkthrough

1. **Customer:** add vegetables, fruit and a juice, then place the order. Note the token.
2. **Staff login → Vegetable Store:** Start weighing, enter a slightly higher weight, tap Packed.
3. **Customer:** approve the updated bill.
4. **Staff → Fruit Store and Juice Junction:** start and pack. The customer gets the ready message.
5. **Staff → Pickup counter:** Paid by UPI.
6. **Staff → Today's rates & stock:** change a rate, mark an item out of stock, Publish rates. Check the customer shop.
7. **Owner login:** see the order, sales, payments and the activity log.

**Reset demo data** is at the bottom of the home page.

## Run locally

No install needed. Serve the folder and open it in a browser:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Documentation

- [Project details](docs/PROJECT.md): problem, order flow, roles, dashboard, roadmap, rollout
- [Tech stack](docs/TECH-STACK.md): demo stack and the proposed stack for the live system

## Notes

- Sample products, rates and orders. No real payments or messages are sent.
- Data is saved in the browser (`localStorage`), so each device has its own copy.
