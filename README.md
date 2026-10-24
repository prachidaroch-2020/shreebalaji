# Shree Balaji Fruits and Vegetable: Order & Pickup Demo

A clickable demo of the order management system proposed for Shree Balaji's three stores (Vegetable Store, Fruit Store and Juice Junction).

Customers order from all three stores in one basket and get a pickup token. Each store packs its own items. The customer is notified when the whole order is ready, then pays and collects at the Main Counter.

## What's in the demo

| Screen | What it shows |
|---|---|
| **Customer app** | Browse and search products, basket, place order, token, live tracking, approve a weight change, ready message, receipt |
| **Store staff** | One queue per store (Vegetables, Fruits, Juice). Start weighing, enter the scale reading, mark packed. Edit today's prices and mark items sold out |
| **Pickup counter** | Orders ready for handover, with the final bill and Paid by UPI / Paid by cash |
| **Owner dashboard** | Orders, sales booked, collections (UPI / cash), live orders, needs attention, sales by store, activity log |

## Run it

No build step and no install. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

On screens 1280 px and wider, the three views sit side by side. On smaller screens they switch to tabs.

## Demo walkthrough

1. **Customer app:** add items from Vegetables, Fruits and Juices, then place the order (the token will be A108).
2. **Vegetable Store:** Start weighing, enter a slightly higher weight, then tap Packed.
3. **Customer app:** approve the updated bill.
4. **Fruit Store** and **Juice Junction:** start and pack. The customer gets the ready message automatically.
5. **Pickup counter:** Paid by UPI.
6. **Owner:** check the updated totals and the activity log.

**Reset demo** (top right, tap twice) restores the sample data.

## Notes

- This is a demo with sample products, prices and orders. There is no real login, payment or SMS.
- Data is saved in the browser's local storage, so it is shared between tabs on the same browser but not between devices.
- Plain HTML, CSS and JavaScript in a single file. Fonts are from Google Fonts (Young Serif, Figtree).
