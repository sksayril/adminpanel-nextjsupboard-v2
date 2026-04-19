# Public API Documentation

This project provides a public, unauthenticated REST API endpoint for retrieving managed URLs. This API can be used by external applications (such as a Flutter mobile app) to dynamically fetch the latest URL configurations.

## Base URL
The API is available relative to your Next.js application domain (e.g., `https://your-domain.com`).

---

## 1. Get All Managed URLs

Retrieves a list of all managed URLs from the database, sorted by the most recently created first.

**Endpoint:**
`GET /api/public/urls`

**(Optional) Filter by Category:**
You can fetch URLs for a specific category by adding the `category` query parameter.
`GET /api/public/urls?category=Class%2010`

**Authentication:** None required

### Headers
No specific headers are required. The endpoint automatically supports CORS for Cross-Origin Resource Sharing if called from a web browser.

### Response

**Success (200 OK)**

```json
[
  {
    "_id": "60d0fe4f5311236168a109ca",
    "title": "UP Board 10th Result",
    "url": "https://upmsp.edu.in",
    "category": "Class 10",
    "createdAt": "2024-05-19T10:00:00.000Z",
    "__v": 0
  },
  {
    "_id": "60d0fe4f5311236168a109cb",
    "title": "UP Board 12th Result",
    "url": "https://upresults.nic.in",
    "category": "Class 12",
    "createdAt": "2024-05-18T14:30:00.000Z",
    "__v": 0
  }
]
```

**Error (500 Internal Server Error)**

```json
{
  "error": "Internal Server Error"
}
```

### Example Usage (JavaScript / fetch)

```javascript
fetch('https://your-domain.com/api/public/urls')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching URLs:', error));
```

### Example Usage (Dart / Flutter)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> fetchUrls() async {
  final response = await http.get(Uri.parse('https://your-domain.com/api/public/urls'));

  if (response.statusCode == 200) {
    List<dynamic> urls = jsonDecode(response.body);
    print(urls);
  } else {
    print('Failed to load URLs');
  }
}
```

---

## 2. Get App Banners (Images)

Retrieves the top promotional banners/images (Maximum 3) to be displayed on the app. The images are guaranteed to be 1280x720 (16:9) in resolution. 

**Endpoint:**
`GET /api/public/banners`

**Authentication:** None required

### Response 

**Success (200 OK)**
```json
[
  {
    "_id": "60d0fe4f5311236168a109cc",
    "title": "Welcome Offer",
    "imageUrl": "https://streaming-bucket-123.s3.us-east-1.amazonaws.com/banners/1715000000.jpg",
    "linkUrl": "https://your-redirect-link.com",
    "createdAt": "2024-05-20T10:00:00.000Z"
  }
]
```

---

## 3. Get Google Ads Configuration

Retrieves the global settings for Google AdMob units, including active statuses, ad unit IDs, and specialized counters.

**Endpoint:**
`GET /api/public/ads`

**Authentication:** None required

### Response 

**Success (200 OK)**
```json
{
  "_id": "60d0fe4f5311236168a109ce",
  "bannerAdId": "ca-app-pub-XXXXX/XXXXX",
  "isBannerActive": true,
  "interstitialAdId": "ca-app-pub-XXXXX/XXXXX",
  "isInterstitialActive": true,
  "interstitialTapCount": 3,
  "nativeAdId": "ca-app-pub-XXXXX/XXXXX",
  "isNativeActive": false,
  "videoAdId": "ca-app-pub-XXXXX/XXXXX",
  "isVideoActive": true,
  "updatedAt": "2024-05-20T11:00:00.000Z"
}
```
