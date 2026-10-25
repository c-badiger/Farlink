const BASE_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('======================================================');
  console.log('🌾 Running Full-Stack E2E Test Suite for Farmer\'s Online Granary');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('1. Testing Health Check & MySQL Connectivity:');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'healthy', 'Health check returns healthy');
    assert(healthData.database === 'connected', 'Database connection verified');

    // 2. Categories with Kannada translations
    console.log('\n2. Testing Agricultural Categories:');
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    assert(catData.success && catData.categories.length >= 7, '7 core agricultural categories returned');
    assert(catData.categories[0].name_kn === 'ಧಾನ್ಯಗಳು', 'Kannada category translation preserved (ಧಾನ್ಯಗಳು)');

    // 3. District discovery
    console.log('\n3. Testing Karnataka District Discovery:');
    const distRes = await fetch(`${BASE_URL}/products/districts`);
    const distData = await distRes.json();
    assert(distData.success && distData.districts.length > 0, 'Karnataka districts returned with counts');
    const mandya = distData.districts.find(d => d.district === 'Mandya');
    assert(mandya && mandya.count > 0, `Mandya district has active harvests (${mandya?.count} items)`);

    // 4. Products query and details
    console.log('\n4. Testing Product Details & Price History:');
    const prodRes = await fetch(`${BASE_URL}/products/1`);
    const prodData = await prodRes.json();
    assert(prodData.success && prodData.product.title_en === 'Organic Sona Masoori Raw Rice', 'Product 1 details returned');
    assert(Array.isArray(prodData.product.price_history), 'Price history array included');
    assert(prodData.product.price_history.length > 0, 'Initial recorded price adjustment found');

    // 5. Authentication (All Roles)
    console.log('\n5. Testing Authentication & Role Tokens:');
    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@farmersgranary.test', password: 'Password@123' })
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLogin.success && adminLogin.user.role === 'admin', 'Admin authenticated with admin role');
    const adminToken = adminLogin.token;

    // Farmer login
    const farmerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'ramesh.farmer@farmersgranary.test', password: 'Password@123' })
    });
    const farmerLogin = await farmerLoginRes.json();
    assert(farmerLogin.success && farmerLogin.user.role === 'farmer', 'Farmer authenticated with farm profile');
    const farmerToken = farmerLogin.token;

    // Buyer login
    const buyerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'anand.buyer@farmersgranary.test', password: 'Password@123' })
    });
    const buyerLogin = await buyerLoginRes.json();
    assert(buyerLogin.success && buyerLogin.user.role === 'buyer', 'Buyer authenticated with buyer profile');
    const buyerToken = buyerLogin.token;

    // 6. Farmer Produce Listing & Price Update with History
    console.log('\n6. Testing Farmer Produce Creation & Price History Logging:');
    const newProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        category_id: 2,
        title_en: 'Mandya Foxtail Little Millet Test',
        title_kn: 'ಮಂಡ್ಯ ಕಿರು ಸಿರಿಧಾನ್ಯ ಪರೀಕ್ಷೆ',
        description: 'Naturally harvested organic little millet cultivated along Cauvery canal.',
        unit: 'kg',
        price_per_unit: 85.00,
        available_quantity: 150.00,
        min_order_quantity: 5.00,
        quality_grade: 'Grade A (Premium)',
        farming_method: 'Seller-Declared Organic',
        harvest_date: '2026-10-18',
        location_district: 'Mandya',
        location_taluk: 'Srirangapatna',
        location_village: 'Ganjam'
      })
    });
    const newProdData = await newProdRes.json();
    assert(newProdData.success && newProdData.productId, `New produce created (ID: ${newProdData.productId})`);
    const testProdId = newProdData.productId;

    // Update price and verify price_history
    const updateRes = await fetch(`${BASE_URL}/products/${testProdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        price_per_unit: 90.00,
        price_change_reason: 'Seasonal yield adjustment test'
      })
    });
    const updateData = await updateRes.json();
    assert(updateData.success, 'Product updated with new price');

    const checkHistRes = await fetch(`${BASE_URL}/products/${testProdId}`);
    const checkHistData = await checkHistRes.json();
    assert(checkHistData.product.price_history.length === 1, 'Price change automatically logged to price_history table');
    assert(Number(checkHistData.product.price_history[0].new_price) === 90, 'Logged new price is 90.00');

    // 7. Buyer Order Checkout with Atomic Transaction & Stock Decrement
    console.log('\n7. Testing Atomic Order Placement & Inventory Deduction:');
    const initialStock = Number(checkHistData.product.available_quantity);
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        items: [
          { productId: testProdId, quantity: 10 }
        ],
        custom_address: {
          recipient_name: 'Anand Rao',
          recipient_phone: '+919800000005',
          address_line1: '#142, 4th Cross, Malleshwaram',
          village_or_town: 'Bengaluru Urban',
          taluk: 'Bengaluru North',
          district: 'Bengaluru Urban',
          pincode: '560003'
        },
        payment_method: 'cash_on_delivery',
        buyer_notes: 'Urgent harvest batch for testing'
      })
    });
    const orderData = await orderRes.json();
    assert(orderData.success && orderData.orders.length > 0, `Order placed atomically (Code: ${orderData.orders[0]?.orderCode})`);
    const testOrderId = orderData.orders[0]?.orderId;

    // Check inventory decrement
    const checkStockRes = await fetch(`${BASE_URL}/products/${testProdId}`);
    const checkStockData = await checkStockRes.json();
    const newStock = Number(checkStockData.product.available_quantity);
    assert(newStock === initialStock - 10, `Stock atomically decremented from ${initialStock} to ${newStock}`);

    // 8. Order Status Transition & Review Flow
    console.log('\n8. Testing Order Lifecycle & Buyer Review:');
    // Farmer marks order delivered
    const deliverRes = await fetch(`${BASE_URL}/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ order_status: 'delivered' })
    });
    const deliverData = await deliverRes.json();
    assert(deliverData.success, 'Order marked as delivered by farmer');

    // Buyer posts review
    const revRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        order_id: testOrderId,
        product_id: testProdId,
        rating: 5,
        comment: 'Outstanding organic millet, delivered directly from Srirangapatna farmer!'
      })
    });
    const revData = await revRes.json();
    assert(revData.success, 'Review submitted successfully by verified buyer');

    // 9. Admin Farmer Verification Approval & Live Metrics
    console.log('\n9. Testing Admin Verification Workflow & Real Database Metrics:');
    const verifsRes = await fetch(`${BASE_URL}/admin/verifications`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const verifsData = await verifsRes.json();
    assert(verifsData.success && verifsData.verifications.length > 0, 'Admin can list farmer landholding records');

    const pending = verifsData.verifications.find(v => v.status === 'pending');
    if (pending) {
      const approveRes = await fetch(`${BASE_URL}/admin/verifications/${pending.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          status: 'approved',
          admin_notes: 'Verified against Karnataka Bhoomi revenue RTC database.'
        })
      });
      const approveData = await approveRes.json();
      assert(approveData.success, `Pending verification #${pending.id} approved by admin`);
    }

    // Verify live stats
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsData.success, 'Admin stats retrieved');
    assert(Number(statsData.stats.orders.total_orders) >= 3, `Real database total orders recorded: ${statsData.stats.orders.total_orders}`);
    assert(Number(statsData.stats.products.total_listings) >= 9, `Real database listings recorded: ${statsData.stats.products.total_listings}`);

    console.log('\n======================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Unhandled test error:', err);
    process.exit(1);
  }
}

runE2ETests();
