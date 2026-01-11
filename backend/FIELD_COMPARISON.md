# Field Comparison: Required Fields vs Provided List

## Required Fields for Sheet Import (from backend/src/api/admin/products/import/route.ts)

The following fields are defined in `REQUIRED_FIELDS`:

1. id
2. product_id
3. type
4. sku
5. gtin
6. name
7. subtitle
8. description
9. stock
10. weight
11. length
12. width
13. height
14. sale_price
15. regular_price
16. categories
17. tags
18. thumbnail
19. images
20. brand
21. model
22. color_code
23. gender
24. rim_style
25. shape
26. frame_material
27. size
28. lens_width
29. lens_height
30. leng_bridge
31. arm_length
32. department
33. condition
34. days_of_delivery
35. max_days_of_delivery
36. days_of_delivery_out_of_stock
37. max_days_of_delivery_out_of_stock
38. delivery_note
39. disabled_days
40. keywords
41. pattern
42. age_group
43. multipack
44. is_bundle
45. availablity_date
46. adult_content
47. published

---

## Your Provided List

- id
- product_id
- type
- sku
- name
- subtitle
- description
- stock
- purchase_cost
- sales_price
- regular_price
- categories
- images
- brand
- model
- gender
- rim_style
- shape
- frame_material
- size
- lens_width
- leng_bridge
- arm_length
- condition
- keywords
- age_group
- region_availability
- published

---

## Fields Missing from Your List (Removed Fields)

The following fields are in `REQUIRED_FIELDS` but **NOT** in your provided list:

### Core Product Fields:

- **gtin** - Global Trade Item Number
- **weight** - Product weight
- **length** - Product length
- **width** - Product width
- **height** - Product height
- **tags** - Product tags
- **thumbnail** - Thumbnail image URL

### Pricing Fields:

- **sale_price** - Note: Your list has "sales_price" but the code expects "sale_price" (without 's')

### Product Details:

- **color_code** - Color code
- **lens_height** - Lens height dimension
- **department** - Department/category

### Delivery/Shipping Fields:

- **days_of_delivery** - Standard delivery days
- **max_days_of_delivery** - Maximum delivery days
- **days_of_delivery_out_of_stock** - Delivery days when out of stock
- **max_days_of_delivery_out_of_stock** - Max delivery days when out of stock
- **delivery_note** - Delivery notes
- **disabled_days** - Disabled delivery days

### Additional Metadata:

- **pattern** - Product pattern
- **multipack** - Multipack indicator
- **is_bundle** - Bundle indicator
- **availablity_date** - Availability date
- **adult_content** - Adult content flag

---

## Fields in Your List but NOT in REQUIRED_FIELDS

These fields are in your list but are **NOT** part of `REQUIRED_FIELDS`:

- **purchase_cost** - Not in REQUIRED_FIELDS (may be handled elsewhere)
- **sales_price** - Note: Code uses "sale_price" (singular), not "sales_price" (plural)
- **region_availability** - This is in `MARKETPLACE_FIELDS` but not in `REQUIRED_FIELDS`

---

## Summary

**Total Required Fields:** 47 fields
**Fields in Your List:** 28 fields
**Fields Missing from Your List:** 19 fields

### Critical Missing Fields:

1. gtin
2. weight
3. length
4. width
5. height
6. tags
7. thumbnail
8. sale_price (you have "sales_price" - check spelling)
9. color_code
10. lens_height
11. department
12. days_of_delivery
13. max_days_of_delivery
14. days_of_delivery_out_of_stock
15. max_days_of_delivery_out_of_stock
16. delivery_note
17. disabled_days
18. pattern
19. multipack
20. is_bundle
21. availablity_date
22. adult_content

### Note on Field Name Differences:

- Your list has **"sales_price"** but the code expects **"sale_price"** (singular)
- Your list has **"region_availability"** which is in MARKETPLACE_FIELDS but not REQUIRED_FIELDS
