// What the home page says, as plain data (no React, no DOM), so `npm test` reads it directly.
// Every claim here is one the site already makes elsewhere (Features list, pricing.js); nothing new.
import { pricing, findPlan, money } from './pricing.js';

/**
 * Quotes from real customers, with their OK to publish. Empty until Sri confirms some: the
 * testimonials section is hidden while this is empty.
 * TODO(Sri): each entry is { q: 'the quote', n: 'first name', r: 'role · company' }.
 */
export const VERIFIED_QUOTES = [];

/** The proof strip under the hero: facts from our own product and price list, no customer numbers. */
export function proofFacts() {
  const free = findPlan('free');
  return [
    { k: 'Up to 40', d: 'devices tested at once on one station', tag: 'New' },
    { k: 'Every IMEI', d: 'tracked from the moment it is plugged in until it ships' },
    { k: 'A certificate', d: 'for every erased device, ready to attach to the invoice' },
    { k: `${pricing.plans.length} plans`, d: `from ${money(free.price)} a month, prepaid and overage plans available` }
  ];
}

/** "How it works": three steps of the walkthrough, each with a still from its 3D stage. */
export const HOW_STEPS = [
  { n: '01', t: 'Plug it in', d: 'The device fills its own record: identity, storage, carrier, locks, battery and parts. No typing.', img: 'assets/home/how-plug-in.jpg', alt: 'A phone on the bench with its device record filled in' },
  { n: '02', t: 'Test, erase and grade', d: 'A dozen at a time, side by side. Each device gets a card with its result and a label to print.', img: 'assets/home/how-test-grade.jpg', alt: 'A station screen testing twelve phones at once' },
  { n: '03', t: 'Sell and ship', d: 'Results pick the next lane: repair, stock or an order. Orders are packed by scan and shipped.', img: 'assets/home/how-ship.jpg', alt: 'A packed order on the conveyor with its shipping card' }
];

/** How many "after the sale" cards a phone shows before "See every feature". */
export const CAPS_ON_PHONE = 4;
