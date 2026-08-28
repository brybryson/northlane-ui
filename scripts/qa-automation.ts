import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { CATALOG_PRODUCTS } from "../src/lib/products.data";

const BASE_URL = "http://localhost:5173";
const API_URL = "http://localhost:3005";
const QA_ROOT = path.resolve(process.cwd(), "qa-artifacts");

async function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generates formatted timestamp: e.g. Aug-28-2026-21-55-30 (24-hour format)
function getFormattedTimestamp(): string {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => n.toString().padStart(2, "0");
  const monthName = months[now.getMonth()];
  const day = pad(now.getDate());
  const year = now.getFullYear();
  const hours = pad(now.getHours()); // 24-hour format
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${monthName}-${day}-${year}-${hours}-${minutes}-${seconds}`;
}

async function runFullQAAutomation() {
  const runTimestamp = getFormattedTimestamp();

  console.log("=========================================================================");
  console.log(`🚀 Starting Northlane QA Automation Suite [Run: ${runTimestamp}]`);
  console.log("=========================================================================");

  // Exact folder structure requested:
  // qa-artifacts
  // > storefront
  // > Cart-drawer
  // > favorite-wishlist
  // > checkout-demo
  // > account-orders-tracking
  // > auth-and-google
  // > email-confirmation-preview
  const featureDirs = {
    storefront: path.join(QA_ROOT, "storefront", runTimestamp),
    cartDrawer: path.join(QA_ROOT, "Cart-drawer", runTimestamp),
    favoriteWishlist: path.join(QA_ROOT, "favorite-wishlist", runTimestamp),
    checkoutDemo: path.join(QA_ROOT, "checkout-demo", runTimestamp),
    accountOrdersTracking: path.join(QA_ROOT, "account-orders-tracking", runTimestamp),
    authAndGoogle: path.join(QA_ROOT, "auth-and-google", runTimestamp),
    emailConfirmationPreview: path.join(QA_ROOT, "email-confirmation-preview", runTimestamp),
  };

  for (const dir of Object.values(featureDirs)) {
    await ensureDir(dir);
  }

  // -----------------------------------------------------------------
  // 1. PRODUCT CATALOG & IMAGE AUDIT
  // -----------------------------------------------------------------
  console.log(`\n🔍 [AUDIT] Auditing ${CATALOG_PRODUCTS.length} catalog products & image media...`);
  let validImagesCount = 0;
  for (const p of CATALOG_PRODUCTS) {
    if (p.img && (p.img.startsWith("http") || p.img.startsWith("/"))) {
      validImagesCount++;
    }
  }
  console.log(`✅ Product Catalog Audit: ${validImagesCount}/${CATALOG_PRODUCTS.length} products have active image assets.`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI Retina
  });
  const page = await context.newPage();

  try {
    // -----------------------------------------------------------------
    // 1. STOREFRONT
    // -----------------------------------------------------------------
    console.log("\n📸 [1/7] Testing storefront...");
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(featureDirs.storefront, "01_landing_hero.png"), fullPage: false });

    await page.goto(`${BASE_URL}/shop`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(featureDirs.storefront, "02_shop_catalog_grid.png"), fullPage: false });

    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(featureDirs.storefront, "03_product_details_specs_gallery.png"), fullPage: false });
    }

    // -----------------------------------------------------------------
    // 2. CART-DRAWER
    // -----------------------------------------------------------------
    console.log("\n📸 [2/7] Testing Cart-drawer...");
    await page.evaluate(() => {
      const sampleItem = {
        id: "prod-flow75",
        name: "Northlane Flow 75 Pro Keyboard",
        price: 220,
        originalPrice: 260,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        category: "Keyboards",
        sku: "NL-KB-F75",
        quantity: 1,
        stockCount: 12,
      };
      localStorage.setItem("northlane_cart_v1", JSON.stringify([sampleItem]));
    });

    await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    const couponInput = page.locator('input[placeholder*="Code" i], input[placeholder*="promo" i], input[placeholder*="coupon" i]').first();
    if (await couponInput.isVisible()) {
      await couponInput.fill("STUDIO20");
      const applyBtn = page.getByRole("button", { name: /Apply/i }).first();
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    await page.screenshot({ path: path.join(featureDirs.cartDrawer, "01_cart_page_with_studio20_discount.png"), fullPage: false });

    // -----------------------------------------------------------------
    // 3. FAVORITE-WISHLIST
    // -----------------------------------------------------------------
    console.log("\n📸 [3/7] Testing favorite-wishlist...");
    await page.evaluate(() => {
      localStorage.setItem("northlane_wishlist_ids", JSON.stringify(["kb-01", "mat-01", "lamp-01"]));
    });

    await page.goto(`${BASE_URL}/wishlist`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(featureDirs.favoriteWishlist, "01_wishlist_page_saved_items_and_ai_recs.png"), fullPage: false });

    // -----------------------------------------------------------------
    // 4. AUTH-AND-GOOGLE
    // -----------------------------------------------------------------
    console.log("\n📸 [4/7] Testing auth-and-google (Google OAuth Click & Session Login)...");
    await page.goto(`${BASE_URL}/auth`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(featureDirs.authAndGoogle, "01_signin_screen_with_google_oauth.png"), fullPage: false });

    // Click 'Continue with Google' to initiate real Google OAuth redirection
    const googleBtn = page.getByRole("button", { name: /Continue with Google/i }).first();
    if (await googleBtn.isVisible()) {
      console.log("  👉 Clicking 'Continue with Google' button...");
      try {
        await Promise.all([
          page.waitForNavigation({ timeout: 6000 }).catch(() => null),
          googleBtn.click(),
        ]);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(featureDirs.authAndGoogle, "02_google_oauth_redirect_screen.png"), fullPage: false });
        console.log("  ✅ Captured Google OAuth redirect screenshot.");
      } catch (err) {
        console.warn("  Google OAuth redirect capture notice:", err);
      }
    }

    // Navigate back to Northlane and authenticate session with real client identity
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate((email) => {
      const mockSession = {
        access_token: "demo-jwt-token-northlane",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "demo-refresh-token",
        user: {
          id: "usr-demo-bryant-melliza",
          aud: "authenticated",
          role: "authenticated",
          email: email,
          user_metadata: { full_name: "Bryant Melliza" },
          created_at: new Date().toISOString(),
        },
      };
      localStorage.setItem("sb-girovycgklqlnzasswtj-auth-token", JSON.stringify(mockSession));
    }, "vrsnmllz03@gmail.com");

    await page.goto(`${BASE_URL}/account`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(featureDirs.authAndGoogle, "03_authenticated_account_overview.png"), fullPage: false });

    // -----------------------------------------------------------------
    // 5. CHECKOUT-DEMO
    // -----------------------------------------------------------------
    console.log("\n📸 [5/7] Testing checkout-demo...");
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    const clientEmail = "vrsnmllz03@gmail.com";
    await page.fill('#firstName', 'Bryant');
    await page.fill('#lastName', 'Melliza');
    await page.fill('#email', clientEmail);
    await page.fill('#address', '124 Copenhagen Way, Studio #4B');
    await page.fill('#city', 'San Francisco');
    await page.fill('#zip', '94107');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(featureDirs.checkoutDemo, "01_checkout_shipping_address.png"), fullPage: false });

    const step1Submit = page.getByRole("button", { name: /Continue to Delivery Option|Continue to Shipping/i });
    if (await step1Submit.isVisible()) {
      await step1Submit.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(featureDirs.checkoutDemo, "02_checkout_delivery_option_selected.png"), fullPage: false });

    const step2Submit = page.getByRole("button", { name: /Continue to Payment/i });
    if (await step2Submit.isVisible()) {
      await step2Submit.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(featureDirs.checkoutDemo, "03_checkout_demo_environment_active_banner.png"), fullPage: false });

    const cardName = page.locator('#cardName');
    if (await cardName.isVisible()) {
      await cardName.fill("Bryant Melliza Demo");
    }
    const cardNumber = page.locator('#cardNumber');
    if (await cardNumber.isVisible()) {
      await cardNumber.fill("9999 8888 7777 6666");
    }
    const expDate = page.locator('#expDate');
    if (await expDate.isVisible()) {
      await expDate.fill("11/29");
    }
    const cvc = page.locator('#cvc');
    if (await cvc.isVisible()) {
      await cvc.fill("888");
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(featureDirs.checkoutDemo, "04_checkout_arbitrary_card_entered.png"), fullPage: false });

    const generatedOrderId = `NL-${Math.floor(100000 + Math.random() * 900000)}`;
    const placeOrderBtn = page.getByRole("button", { name: /Pay & Authorize|Place Order|Complete Order/i }).last();
    if (await placeOrderBtn.isVisible()) {
      await placeOrderBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(featureDirs.checkoutDemo, "05_order_placed_confirmation_toast.png"), fullPage: false });
    }

    // -----------------------------------------------------------------
    // 6. EMAIL-CONFIRMATION-PREVIEW & LIVE SMTP DISPATCH
    // -----------------------------------------------------------------
    console.log("\n📸 [6/7] Dispatching Live Confirmation Email via NorthlaneStudioPH@gmail.com...");
    try {
      const emailPayload = {
        orderId: generatedOrderId,
        customerEmail: clientEmail,
        customerName: "Bryant Melliza",
        items: [
          {
            id: "prod-flow75",
            name: "Northlane Flow 75 Pro Keyboard",
            price: 220,
            qty: 1,
            image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
            sku: "NL-KB-F75",
          },
        ],
        subtotal: 220,
        discount: 44,
        shipping: 25,
        grandTotal: 201,
        shippingAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107, United States",
        trackingNumber: "DHL-9842109482",
        carrier: "DHL Express",
        estimatedDelivery: "3-4 Business Days",
      };

      // Call live backend endpoint to send real email via Gmail SMTP
      console.log(`  📧 Sending live email via API to ${clientEmail} from NorthlaneStudioPH@gmail.com...`);
      const emailRes = await fetch(`${API_URL}/api/automation/send-order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
      const emailResult = await emailRes.json();
      console.log("  ✅ Backend Email Dispatch Result:", emailResult);

      const { buildOrderReceiptHtml } = await import("../../northlane-api/src/integrations/email-service.js");
      const receiptHtml = buildOrderReceiptHtml(emailPayload);
      await page.setContent(receiptHtml, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(featureDirs.emailConfirmationPreview, "01_luxury_copenhagen_email_receipt.png"), fullPage: true });
      console.log(`  📸 Screenshot of HTML receipt saved to email-confirmation-preview/${runTimestamp}`);
    } catch (e) {
      console.error("Email dispatch notice:", e);
    }

    // -----------------------------------------------------------------
    // 7. ACCOUNT-ORDERS-TRACKING
    // -----------------------------------------------------------------
    console.log("\n📸 [7/7] Testing account-orders-tracking...");
    await page.evaluate((email) => {
      const mockSession = {
        access_token: "demo-jwt-token-northlane",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "demo-refresh-token",
        user: {
          id: "usr-demo-bryant-melliza",
          aud: "authenticated",
          role: "authenticated",
          email: email,
          user_metadata: { full_name: "Bryant Melliza" },
          created_at: new Date().toISOString(),
        },
      };
      localStorage.setItem("sb-girovycgklqlnzasswtj-auth-token", JSON.stringify(mockSession));
    }, clientEmail);

    await page.goto(`${BASE_URL}/account/orders`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(featureDirs.accountOrdersTracking, "01_orders_list_tracking_timeline.png"), fullPage: false });

    const viewItemsBtn = page.getByRole("button", { name: /Items/i }).first();
    if (await viewItemsBtn.isVisible()) {
      await viewItemsBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(featureDirs.accountOrdersTracking, "02_order_expanded_items.png"), fullPage: false });

    console.log("\n=========================================================================");
    console.log(`🎉 QA Suite Finished! Screenshots saved in qa-artifacts/ under [${runTimestamp}]`);
    console.log("=========================================================================");
  } catch (err) {
    console.error("❌ QA Automation Error:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

runFullQAAutomation();
