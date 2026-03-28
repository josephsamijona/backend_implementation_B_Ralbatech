# Order Create API - Error Handling Fix

## Issue
When users close the PayPal popup during checkout, the `/api/v1/user/orderCreate` API was crashing with:
```
ERROR: Cannot read properties of null (reading 'stock')
```

## Root Cause
The API was not validating:
1. **Cart existence** - Cart could be null or empty
2. **Billing address** - Address could be null
3. **Product records** - Products might not exist in database

When `prodRecord` was `null`, the code tried to access `prodRecord.stock`, causing the crash.

## Solution Applied

### 1. Cart Validation
```javascript
// Validate cart exists and has products
if (!cartProducts || !cartProducts.products || cartProducts.products.length === 0) {
    return res.status(400).send(response.generate(1, 'Cart is empty or not found', {}));
}
```

### 2. Billing Address Validation
```javascript
// Validate billing address exists
if (!billingAddress) {
    return res.status(400).send(response.generate(1, 'Billing address not found', {}));
}
```

### 3. Product Record Validation
```javascript
const prodRecord = await Product.findOne({ product_slug: od.pro_slug }).lean();

// Validate product exists
if (!prodRecord) {
    throw new Error(`Product not found: ${od.pro_name || od.pro_slug}`);
}

// Check stock availability
if (prodRecord.stock < od.qty) {
    throw new Error(`Product "${prodRecord.product_name}" is out of stock. Available: ${prodRecord.stock}, Requested: ${od.qty}`);
}
```

### 4. Improved Error Response
```javascript
catch (err) {
    console.error('Order Create Error:', err);
    res.status(410).send(response.generate(1, 'ERROR: ${err.message}', {}));
}
```

## API Response Examples

### ✅ Success
```json
{
  "error": 0,
  "message": "Order Successfully Placed",
  "data": { "order_id": "...", ... }
}
```

### ❌ Cart Empty
```json
{
  "error": 1,
  "message": "Cart is empty or not found",
  "data": {}
}
```

### ❌ Billing Address Missing
```json
{
  "error": 1,
  "message": "Billing address not found",
  "data": {}
}
```

### ❌ Product Not Found
```json
{
  "error": 1,
  "message": "ERROR: Product not found: Product Name",
  "data": {}
}
```

### ❌ Out of Stock
```json
{
  "error": 1,
  "message": "ERROR: Product \"Product Name\" is out of stock. Available: 5, Requested: 10",
  "data": {}
}
```

## Benefits
- ✅ No more crashes on null references
- ✅ Clear, actionable error messages
- ✅ Proper HTTP status codes (400 for validation, 410 for errors)
- ✅ Console logging for debugging
- ✅ Better user experience when PayPal is cancelled

## Testing
When user closes PayPal popup, the API now returns:
- Proper error message instead of crashing
- Frontend can display the error to user
- Server continues running without interruption
