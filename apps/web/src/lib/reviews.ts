// Product reviews. Customers review a product they purchased (verified by order
// number + email). Reviews are moderated (pending → approved/rejected) before
// they show on the product page.

import { query } from '@/lib/db'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected']

let ready = false
export async function ensureReviewsTable(): Promise<void> {
  if (ready) return
  await query(`CREATE TABLE IF NOT EXISTS product_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    order_number varchar(32) NOT NULL,
    customer_name varchar(256) NOT NULL DEFAULT '',
    customer_email varchar(256) NOT NULL,
    rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title varchar(160) DEFAULT '',
    body text NOT NULL DEFAULT '',
    status varchar(16) NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON product_reviews(product_id, status)`).catch(() => {})
  // One review per (order, product, email) — prevents spam/duplicate reviews.
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique
    ON product_reviews(order_number, product_id, LOWER(customer_email))`).catch(() => {})
  ready = true
}
