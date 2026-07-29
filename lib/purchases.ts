import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const ENTITLEMENT_ID = 'pro';

export function usePurchases() {
  const [isPro, setIsPro] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProStatus();
    loadOfferings();
  }, []);

  async function checkProStatus() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPro(ENTITLEMENT_ID in customerInfo.entitlements.active);
    } catch (e) {
      console.error('Error checking pro status:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (current?.availablePackages) {
        setPackages(current.availablePackages);
      }
    } catch (e) {
      console.error('Error loading offerings:', e);
    }
  }

  async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const hasPro = ENTITLEMENT_ID in customerInfo.entitlements.active;
      setIsPro(hasPro);
      return hasPro;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error:', e);
      }
      return false;
    }
  }

  async function restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPro = ENTITLEMENT_ID in customerInfo.entitlements.active;
      setIsPro(hasPro);
      return hasPro;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }

  return { isPro, packages, loading, purchasePackage, restorePurchases };
}
