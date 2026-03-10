This directory contains the layout description specification and reference files
for generating Hunter Douglas product detail pages.

## Files

- `LAYOUT-SPEC.md` — Complete specification for the layout description JSON format
- See each product folder for `layout-description.json` examples

## Usage

When creating a new product page:
1. Read this spec to understand the JSON structure
2. Look at the product's extracted images in `public/hunter-douglas/{slug}/`
3. Read the product's `products/{slug}.json` data
4. Generate a `layout-description.json` following this spec
5. Use the layout description to create the layout.ts and DetailClient.tsx files
