#!/bin/bash

# Simple test to debug recipient addition
BASE_URL="https://app.ezcollab.com/api"

# Login
echo "Logging in..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah.anderson@techcorp.com", "password": "password"}')

TOKEN=$(echo "$LOGIN" | jq -r '.token')
echo "Token: ${TOKEN:0:20}..."

# Create order with one recipient
echo -e "\nCreating order..."
ORDER=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "tenant-main-001",
    "customerId": "user-cust-001",
    "orderType": "PROCESS_SERVICE",
    "documentType": "SUMMONS",
    "caseNumber": "DEBUG-001",
    "jurisdiction": "Test Court",
    "deadline": "2026-02-20T17:00:00",
    "status": "DRAFT",
    "recipients": [{
      "recipientName": "First Recipient",
      "recipientAddress": "100 Test St",
      "recipientZipCode": "78701",
      "firstName": "First",
      "lastName": "Recipient",
      "recipientType": "AUTOMATED",
      "processService": true
    }]
  }')

ORDER_ID=$(echo "$ORDER" | jq -r '.id')
echo "Order created: $ORDER_ID"
echo "Initial recipients: $(echo "$ORDER" | jq -r '.totalRecipients')"

# Try to add second recipient with isNew flag
echo -e "\nAdding second recipient with isNew=true..."
UPDATE=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "recipientUpdates": [{
      "isNew": true,
      "recipientName": "Second Recipient",
      "recipientAddress": "200 Test Ave",
      "recipientZipCode": "78702",
      "recipientEntityType": "INDIVIDUAL",
      "firstName": "Second",
      "middleName": "Middle",
      "lastName": "Recipient",
      "email": "second@test.com",
      "phone": "+1-512-555-0000",
      "city": "Austin",
      "state": "Texas",
      "recipientType": "AUTOMATED",
      "processService": true
    }]
  }')

echo "Update response:"
echo "$UPDATE" | jq '.'

# Cleanup
echo -e "\nCleaning up..."
curl -s -X DELETE "$BASE_URL/orders/$ORDER_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
echo "Done"
