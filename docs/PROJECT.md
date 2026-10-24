# Project details: Shree Balaji order & pickup system

**Client:** Shree Balaji Fruits and Vegetable
**Stores:** Vegetable Store, Fruit Store, Juice Junction (three stores, one owner)
**Goal:** "Your three stores. One connected business."

## 1. The problem today

| Typical daily task | Proposed system | Owner's benefit |
|---|---|---|
| Orders arrive by phone, in person and by message | One order queue with a pickup token | See what needs attention |
| Owner calls each store to check progress | Staff update preparation status in the app | Check progress remotely |
| Prices and availability repeated to every customer | Staff publish one shared catalogue every morning | Customers get a clear choice |
| Each store keeps separate daily totals | One report with store filters | Review performance in one place |

The value depends on staff updating orders, rates and stock consistently.

## 2. How an order works

One order can include items from all three stores. Example: token **A104** has vegetables, fruit and juice.

| Customer | Store staff | System |
|---|---|---|
| Builds a basket and places the order | Each store accepts its own items | Creates one token and a task for each store |
| Approves any increase after weighing | Weighs produce and enters the actual weight | Records final quantities and the final bill |
| Checks progress on their phone | Packs items; Juice Junction makes juice fresh | Tracks each store's readiness |
| Receives the "ready for pickup" message | The order is brought together at Main Counter | Notifies the customer only when every part is ready |
| Shows the token, pays by UPI or cash, collects | Confirms payment and hands over | Closes the order with an audit trail |

The common pickup point needs one staff member to bring each order together.

## 3. Users and logins

| Role | Can do |
|---|---|
| **Customer** | Browse today's rates, see what is out of stock, order from all three stores in one basket, approve weight changes, track the order, receive the ready message |
| **Store staff** | Publish daily rates, mark items in stock or out of stock, weigh and pack orders, mark juice ready, hand over and record payment at the counter |
| **Owner** | Live dashboard across all stores, orders list, sales and revenue report (today, 7 days, 30 days), payment details (UPI, cash, pending, daily settlement), rates and stock overview, approve exceptions |

### Daily rates and stock

Rates for fruits and vegetables change every day. Each morning a staff member:

1. Opens **Today's rates & stock**.
2. Updates the rate for each item (or copies yesterday's rates and changes only what moved).
3. Marks any item that is not available as **Out of stock**.
4. Taps **Publish rates**.

Customers see the new rates straight away. Out-of-stock items stay visible to customers, labelled *Out of stock*, and cannot be added to the basket.

## 4. Owner dashboard

- **Overview:** orders today, sales today, orders in preparation, orders ready for pickup, money collected (UPI and cash), money awaiting payment, average basket, live orders, items that need attention, sales by store, activity log.
- **Sales & revenue:** revenue, orders and average basket for today, last 7 days or last 30 days, compared with the previous period; sales by day or by hour; revenue by store; top products.
- **Payments:** today's payments by method, orders awaiting payment, daily settlement for the last 7 days.
- **Needs attention:** weight approvals, orders running late, orders not collected, out-of-stock items.

Revenue means the value of orders billed. Profit reporting needs purchase cost, wastage and expenses, which come in Phase 2.

## 5. Responsibilities for each shift

| Store teams | Owner or supervisor |
|---|---|
| Update rates and availability | Review delayed and changed orders |
| Accept, pack and mark orders ready | Approve exceptions and refunds |
| Record weights and collections | Review the daily close and plan stock |

Morning: availability and rates check. During service: exception review. Closing: reconcile collections.

## 6. Roadmap

| Phase 1: three-store pickup | Phase 2: stronger operations | Phase 3: town-wide network |
|---|---|---|
| Shared catalogue and basket | Home delivery zones and dispatch | Additional owned branches |
| Tokens and ready messages | Supplier purchasing and dues | Partner-store onboarding |
| Staff roles and owner overview | Stock movements and wastage | Commission and settlement rules |
| Daily rates and stock updates | Expense and margin reporting | Capacity, access and load review |
| Basic sales and collection reports | | |

Each phase has its own scope and acceptance checks.

### Expansion modules

- **Home delivery:** customer enters an eligible address and picks a slot; the dispatch team groups orders and assigns a rider; the owner sets delivery areas, fees, capacity and minimum order.
- **Supplier management:** purchase orders, delivered quantity and quality, invoices, returns and dues.
- **Partner stores:** approve each store and catalogue, assign order responsibility, track service quality and settlements.

## 7. Rollout plan

Five to seven weeks after scope and content approval.

| Stage | Work | Completion check |
|---|---|---|
| Week 1 | Confirm pickup counter, catalogue and staff roles | Owner approves workflow and screens |
| Weeks 2–4 | Build ordering, staff screens and dashboards | A mixed-store test order goes through end to end |
| Week 5 | Test on real devices and train staff | Weights, tokens and alerts work correctly |
| Weeks 6–7 | Run a small pilot, then expand usage | Owner accepts reporting and handover |

The owner supplies current rates, product photos, staff access and one operating contact.

## 8. How we measure success

| Pilot measures | Growth measures |
|---|---|
| Preparation and pickup waiting time | Repeat customers and basket value |
| Missed or incorrect orders | Store-level fulfilment reliability |
| Owner follow-up calls per day | Demand for home delivery |

## 9. Decisions needed from the owner

1. Where the common pickup counter is and who staffs it.
2. The product list, units and photos for each store.
3. How many staff logins are needed (one shared login or one per store).
4. Which number sends the "ready for pickup" message (WhatsApp Business or SMS).
5. Store opening hours and the last order time.
