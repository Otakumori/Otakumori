# Vercel Blob Integration Setup Guide

## 1. Install Dependencies
```bash
npm i @vercel/blob
```

## 2. Get Vercel Blob Token
1. Go to your Vercel project dashboard
2. Navigate to Storage → Blobs
3. Click "Create token"
4. Copy the generated token

## 3. Environment Variables
Add to your `.env.local` file:
```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

Add to Vercel project settings:
1. Go to Project Settings → Environment Variables
2. Add key: `BLOB_READ_WRITE_TOKEN`
3. Add value: your token from step 2

## 4. Admin User Setup
Ensure your Clerk user has admin role:
1. Go to Clerk Dashboard → Users
2. Find your user
3. Edit public metadata
4. Add: `{ "role": "admin" }`

## 5. Database Migration
The ProductReview table has been added to your schema. Run:
```bash
npx prisma generate
npx prisma migrate dev -n "add_product_reviews"
```

## 6. Access Points
- **Admin Media Manager**: `/admin/media`
- **Review Moderation**: `/admin/reviews`
- **Product Reviews**: Integrated into product pages

## 7. Features
- ✅ Admin media upload/list/delete
- ✅ Customer review submission with photos
- ✅ Review moderation queue
- ✅ Rate limiting (1 review per product per 24h, max 5 reviews per day)
- ✅ Image validation (JPG/PNG/WebP, max 3MB)
- ✅ Admin-only access control

## 8. Usage
1. **Upload Media**: Use `/admin/media` to upload blog headers, hero images, etc.
2. **Customer Reviews**: Users can submit reviews with photos on product pages
3. **Moderation**: Admins approve/reject reviews at `/admin/reviews`
4. **Integration**: Use returned Blob URLs in your content (blog posts, etc.)

## 9. Security Notes
- All admin routes require `publicMetadata.role === "admin"`
- Customer uploads are limited to 3MB per image, max 3 images
- Reviews require moderation before public display
- Rate limiting prevents spam
