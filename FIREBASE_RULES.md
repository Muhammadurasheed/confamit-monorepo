# Firebase Firestore Security Rules

Copy and paste these rules into your Firebase Console > Firestore Database > Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Receipts collection - users can read their own receipts
    match /receipts/{receiptId} {
      allow read: if request.auth != null && 
                     (resource.data.user_id == request.auth.uid || 
                      resource.data.user_id == 'anonymous');
      allow write: if request.auth != null && 
                      request.resource.data.user_id == request.auth.uid;
      
      // Allow anonymous users to read their own receipts
      allow read: if resource.data.user_id == 'anonymous';
    }
    
    // Account Checks collection
    match /account_checks/{checkId} {
      allow read: if request.auth != null && 
                     (resource.data.user_id == request.auth.uid || 
                      resource.data.user_id == 'anonymous');
      allow write: if request.auth != null && 
                      request.resource.data.user_id == request.auth.uid;
      
      // Allow anonymous users to read their own checks
      allow read: if resource.data.user_id == 'anonymous';
    }
    
    // Fraud Reports - PUBLIC READ for stats (backend aggregates these)
    match /fraud_reports/{reportId} {
      allow read: if true;  // ✅ Public read for fraud stats
      allow create: if request.auth != null;
    }
    
    match /demo_fraud_reports/{reportId} {
      allow read: if true;  // ✅ Public read for fraud stats
      allow create: if request.auth != null;
    }
    
    // Businesses collection - PUBLIC READ for marketplace
    match /businesses/{businessId} {
      allow read: if true;  // ✅ Public read for marketplace discovery
      allow create: if request.auth != null && 
                       request.resource.data.created_by == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.created_by == request.auth.uid;
    }
    
    // Demo Businesses - PUBLIC READ
    match /demo_businesses/{businessId} {
      allow read: if true;
    }
    
    // Reviews collection - PUBLIC READ
    match /reviews/{reviewId} {
      allow read: if true;  // ✅ Public read for business ratings
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               resource.data.user_id == request.auth.uid;
    }
    
    // Demo Reviews - PUBLIC READ
    match /demo_reviews/{reviewId} {
      allow read: if true;
    }
    
    // Accounts collection - users can read any account (for checking)
    match /accounts/{accountId} {
      allow read: if true;  // ✅ Public read for account verification
      allow write: if false;  // Only backend can write
    }
    
    // Demo Accounts - PUBLIC READ
    match /demo_accounts/{accountId} {
      allow read: if true;
    }
    
    // User profiles - private
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## How to Update Firebase Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **confirmit-5f8c7**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Copy the rules above and paste them
6. Click **Publish** to save the changes

## Important Notes

⚠️ **Security Considerations:**
- `fraud_reports` and `demo_fraud_reports` have public read access for fraud stats aggregation
- `businesses` have public read access for marketplace discovery
- `accounts` have public read access for account verification checks
- Only authenticated users can create fraud reports and businesses
- Backend uses Firebase Admin SDK which bypasses all these rules
