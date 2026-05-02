async function testPostOrder() {
  const result = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_email: "test@test.com",
      customer_name: "Test Name",
      customer_phone: "1234567890",
      shipping_address: {
        street: "123 Street",
        city: "City",
        state: "State",
        postal_code: "123456",
        country: "India"
      },
      product_details: {
        items: [],
        total: 100,
        subtotal: 100,
        currency: "INR"
      },
      payment_method: "COD",
      payment_status: "pending",
      notes: ""
    })
  });
  
  const json = await result.json();
  console.log("STATUS:", result.status);
  console.log("JSON:", json);
}

testPostOrder();
