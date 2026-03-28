# Recent Backend Changes - 2025-11-26

## 1. Redis Cluster Configuration

**File:** `src/middlewares/hash.js`

**Problem:** Single Redis instance was causing backend failures when it stopped.

**Solution:** Migrated from single Redis client to Redis Cluster with 3 nodes:
```javascript
const redis_client = redis.createCluster({
  rootNodes: [
    { url: 'redis://18.119.88.207:7001' },
    { url: 'redis://18.119.88.207:7002' },
    { url: 'redis://18.119.88.207:7003' }
  ]
});
```

**Benefits:**
- High availability - if one node fails, others continue serving
- Better fault tolerance
- No single point of failure

---

## 2. PDF Generation Library Migration

**File:** `src/libs/generatePDF.js`

**Problem:** OpenSSL 3.x compatibility error with `pdf-creator-node` and PhantomJS:
```
ERROR: html-pdf: Unknown Error
libproviders.so: cannot open shared object file: No such file or directory
```

**Root Cause:** 
- `pdf-creator-node` uses deprecated PhantomJS binary
- PhantomJS was compiled against OpenSSL 1.x
- Modern Linux systems use OpenSSL 3.x
- The library is no longer maintained

**Solution:** Replaced `pdf-creator-node` with modern **Puppeteer**:

**Before:**
```javascript
const pdf = require("pdf-creator-node");
// Uses deprecated PhantomJS
```

**After:**
```javascript
const puppeteer = require("puppeteer");
const { Readable } = require("stream");
```

**Changes Made:**
1. Installed Puppeteer: `npm install puppeteer`
2. Uninstalled deprecated packages: `npm uninstall pdf-creator-node phantomjs-prebuilt`
3. Rewrote `generatePDFStream()` function to use Puppeteer's headless Chrome

**Key Improvements:**
- ✅ Modern, actively maintained library
- ✅ Compatible with OpenSSL 3.x
- ✅ Better rendering (uses Chromium engine)
- ✅ Supports modern CSS/HTML features
- ✅ Same API interface (returns stream)
- ✅ Better error handling

**API Affected:** `/api/v1/user/orderPayment` - Now generates invoice PDFs without errors

---

## Testing

To test the order payment API:
```bash
curl 'http://localhost:5000/api/v1/user/orderPayment' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "order_id":"ORDER_ID",
    "total_order_amount":"150.00",
    "payment_method":"paypal",
    "paypal_status":"APPROVED",
    ...
  }'
```

Expected: PDF invoice generated and emailed successfully without OpenSSL errors.

---

## Notes

- Server needs to be restarted after these changes
- Puppeteer downloads Chromium on first install (~170MB)
- Redis cluster must have all 3 nodes running for optimal performance
