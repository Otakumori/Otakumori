-- Check for duplicate products in the database
-- Run this in your Neon/PostgreSQL database console

-- 1. Check for duplicate printifyProductId (should be unique)
SELECT 
  "printifyProductId",
  COUNT(*) as count,
  array_agg(id) as product_ids,
  array_agg(name) as product_names
FROM "Product"
WHERE "printifyProductId" IS NOT NULL
GROUP BY "printifyProductId"
HAVING COUNT(*) > 1;

-- 2. Check for duplicate integrationRef (should be unique)
SELECT 
  "integrationRef",
  COUNT(*) as count,
  array_agg(id) as product_ids,
  array_agg(name) as product_names
FROM "Product"
WHERE "integrationRef" IS NOT NULL
GROUP BY "integrationRef"
HAVING COUNT(*) > 1;

-- 3. Check for products sharing blueprintId (not unique, but might indicate duplicates)
SELECT 
  "blueprintId",
  COUNT(*) as count,
  array_agg(id) as product_ids,
  array_agg(name) as product_names,
  array_agg("printifyProductId") as printify_ids
FROM "Product"
WHERE "blueprintId" IS NOT NULL
GROUP BY "blueprintId"
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- 4. Check for duplicate names (not unique, but might indicate duplicates)
SELECT 
  LOWER(TRIM(name)) as normalized_name,
  COUNT(*) as count,
  array_agg(id) as product_ids,
  array_agg(name) as product_names,
  array_agg("printifyProductId") as printify_ids
FROM "Product"
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- 5. Summary: Total products and status
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN active = true THEN 1 END) as active_products,
  COUNT(CASE WHEN visible = true THEN 1 END) as visible_products,
  COUNT(CASE WHEN "printifyProductId" IS NOT NULL THEN 1 END) as printify_products,
  COUNT(CASE WHEN "integrationRef" IS NOT NULL THEN 1 END) as integrated_products
FROM "Product";

