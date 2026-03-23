import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function to aggregate public stats
 * Runs every 5 minutes to update the public_stats/global document
 * This allows the frontend to display real stats without violating security rules
 */
export const aggregateStats = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
        const db = admin.firestore();

        try {
            console.log('📊 Starting stats aggregation...');

            // Count receipts (using admin SDK to bypass security rules)
            const receiptsSnapshot = await db.collection('receipts').count().get();
            const receiptsCount = receiptsSnapshot.data().count;

            // Count verified businesses
            const businessesSnapshot = await db.collection('businesses').count().get();
            const businessesCount = businessesSnapshot.data().count;

            // Calculate total fraud prevented
            const fraudSnapshot = await db.collection('fraud_reports').get();
            let totalFraudPrevented = 0;
            fraudSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.amount_lost) {
                    totalFraudPrevented += Number(data.amount_lost);
                }
            });

            // Update public stats document
            await db.collection('public_stats').doc('global').set({
                receiptsVerified: receiptsCount,
                businessesProtected: businessesCount,
                fraudPrevented: totalFraudPrevented,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log('✅ Stats aggregated:', {
                receiptsCount,
                businessesCount,
                totalFraudPrevented,
            });

            return null;
        } catch (error) {
            console.error('❌ Stats aggregation failed:', error);
            throw error;
        }
    });
