#!/bin/bash

# Complete Backend API Test Script
# Tests all endpoints across 6 microservices via API Gateway

set -e

BASE_URL="http://localhost:8080"
TENANT_ID="tenant-1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "ProcessServe Backend API Test Suite"
echo "========================================"
echo ""

# Test counter
TOTAL=0
PASSED=0
FAILED=0

test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local token="$5"
    
    TOTAL=$((TOTAL + 1))
    echo -e "${YELLOW}Testing:${NC} $name"
    
    if [ -z "$token" ]; then
        headers=(-H "Content-Type: application/json")
    else
        headers=(-H "Content-Type: application/json" -H "Authorization: Bearer $token")
    fi
    
    if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${headers[@]}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${headers[@]}" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" =~ ^2 ]]; then
        echo -e "${GREEN}✓ PASS${NC} [$http_code] $name"
        PASSED=$((PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAIL${NC} [$http_code] $name"
        FAILED=$((FAILED + 1))
        echo "$body"
    fi
    echo ""
}

echo "========================================="
echo "FLOW 1: Authentication"
echo "========================================="

# 1.1 Login as Customer
echo "Logging in as customer..."
CUSTOMER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"password"}')

CUSTOMER_TOKEN=$(echo "$CUSTOMER_LOGIN_RESPONSE" | jq -r '.token')
CUSTOMER_USER_ID=$(echo "$CUSTOMER_LOGIN_RESPONSE" | jq -r '.userId')

if [ -z "$CUSTOMER_TOKEN" ] || [ "$CUSTOMER_TOKEN" = "null" ]; then
    echo -e "${RED}✗ FAIL${NC} Customer login failed"
    exit 1
fi
echo -e "${GREEN}✓ PASS${NC} Customer logged in successfully"
echo "Customer User ID: $CUSTOMER_USER_ID"
echo ""

# 1.2 Login as Process Server
echo "Logging in as process server..."
SERVER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"server1@example.com","password":"password"}')

SERVER_TOKEN=$(echo "$SERVER_LOGIN_RESPONSE" | jq -r '.token')
SERVER_USER_ID=$(echo "$SERVER_LOGIN_RESPONSE" | jq -r '.userId')

if [ -z "$SERVER_TOKEN" ] || [ "$SERVER_TOKEN" = "null" ]; then
    echo -e "${RED}✗ FAIL${NC} Server login failed"
    exit 1
fi
echo -e "${GREEN}✓ PASS${NC} Process Server logged in successfully"

echo "Server User ID: $SERVER_USER_ID"
echo ""

# 1.3 Get current user profile
test_api "Get Current User Profile (Customer)" "GET" "/api/auth/me" "" "$CUSTOMER_TOKEN"
test_api "Get Current User Profile (Server)" "GET" "/api/auth/me" "" "$SERVER_TOKEN"

echo "========================================="
echo "FLOW 2: Tenant & User Services"
echo "========================================="

test_api "Get All Tenants" "GET" "/api/tenants" "" ""
test_api "Get Customers by Tenant" "GET" "/api/customers/tenant/$TENANT_ID" "" ""
test_api "Get Process Servers by Tenant" "GET" "/api/process-servers/tenant/$TENANT_ID" "" ""

echo "========================================"
echo "FLOW 3: Order Creation"
echo "========================================="

# 3.1 Create order with single dropoff
CREATE_ORDER_DATA='{
  "tenantId": "tenant-1",
  "customerId": "prof-cust-0001-0000-0000-000000000000",
  "pickupAddress": "123 Test St, New York, NY",
  "pickupZipCode": "10001",
  "specialInstructions": "Ring doorbell twice",
  "deadline": "2025-12-31T17:00:00",
  "dropoffs": [{
    "recipientName": "John Doe",
    "dropoffAddress": "456 Park Ave, New York, NY",
    "dropoffZipCode": "10003"
  }]
}'

echo "Creating test order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "$CREATE_ORDER_DATA")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
DROPOFF_ID=$(echo "$ORDER_RESPONSE" | jq -r '.dropoffs[0].id')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${RED}✗ FAIL${NC} Order creation failed"
    echo "$ORDER_RESPONSE" | jq '.'
else
    echo -e "${GREEN}✓ PASS${NC} Order created successfully"
    echo "Order ID: $ORDER_ID"
    echo "Dropoff ID: $DROPOFF_ID"
fi
echo ""

# 3.2 Get order details
if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
    test_api "Get Order by ID" "GET" "/api/orders/$ORDER_ID" "" "$CUSTOMER_TOKEN"
fi

echo "========================================="
echo "FLOW 4: Bidding System"
echo "========================================="

if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
    # 4.1 Place bid
    BID_DATA="{
      \"orderId\": \"$ORDER_ID\",
      \"processServerId\": \"prof-ps-0001-0000-0000-000000000000\",
      \"bidAmount\": 150.00,
      \"comment\": \"Can deliver within 24 hours\"
    }"
    
    echo "Placing bid on order..."
    BID_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bids" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SERVER_TOKEN" \
      -d "$BID_DATA")
    
    BID_ID=$(echo "$BID_RESPONSE" | jq -r '.id')
    
    if [ -z "$BID_ID" ] || [ "$BID_ID" = "null" ]; then
        echo -e "${RED}✗ FAIL${NC} Bid placement failed"
        echo "$BID_RESPONSE" | jq '.'
    else
        echo -e "${GREEN}✓ PASS${NC} Bid placed successfully"
        echo "Bid ID: $BID_ID"
    fi
    echo ""
    
    # 4.2 Get bids for order
    test_api "Get Bids for Order" "GET" "/api/bids/order/$ORDER_ID" "" "$CUSTOMER_TOKEN"
   
    # 4.3 Accept bid (if bid was created)
    if [ -n "$BID_ID" ] && [ "$BID_ID" != "null" ]; then
        test_api "Accept Bid" "PUT" "/api/bids/$BID_ID/accept" "" "$CUSTOMER_TOKEN"
    fi
fi

echo "========================================="
echo "FLOW 5: Delivery  Attempts"
echo "========================================="

if [ -n "$DROPOFF_ID" ] && [ "$DROPOFF_ID" != "null" ]; then
    # 5.1 Record failed attempt
    ATTEMPT_1_DATA="{
      \"dropoffId\": \"$DROPOFF_ID\",
      \"processServerId\": \"prof-ps-0001-0000-0000-000000000000\",
      \"wasSuccessful\": false,
      \"outcomeNotes\": \"Recipient not home\",
      \"gpsLatitude\": 40.7580,
      \"gpsLongitude\": -73.9855,
      \"photoProofUrl\": \"https://example.com/attempt1.jpg\"
    }"
    
    test_api "Record Failed Delivery Attempt" "POST" "/api/orders/delivery-attempts" "$ATTEMPT_1_DATA" "$SERVER_TOKEN"
    
    # 5.2 Record successful attempt
    ATTEMPT_2_DATA="{
      \"dropoffId\": \"$DROPOFF_ID\",
      \"processServerId\": \"prof-ps-0001-0000-0000-000000000000\",
      \"wasSuccessful\": true,
      \"outcomeNotes\": \"Delivered successfully\",
      \"gpsLatitude\": 40.7580,
      \"gpsLongitude\": -73.9855,
      \"photoProofUrl\": \"https://example.com/delivered.jpg\",
      \"signatureUrl\": \"https://example.com/signature.jpg\"
    }"
    
    test_api "Record Successful Delivery" "POST" "/api/orders/delivery-attempts" "$ATTEMPT_2_DATA" "$SERVER_TOKEN"
fi

echo "========================================="
echo "FLOW 6: Ratings & Reviews"
echo "========================================="

if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
    RATING_DATA="{
      \"orderId\": \"$ORDER_ID\",
      \"customerId\": \"prof-cust-0001-0000-0000-000000000000\",
      \"processServerId\": \"prof-ps-0001-0000-0000-000000000000\",
      \"ratingValue\": 5,
      \"reviewText\": \"Excellent service!\"
    }"
    
    test_api "Add Rating for Process Server" "POST" "/api/process-servers/ratings" "$RATING_DATA" "$CUSTOMER_TOKEN"
fi

echo "========================================="
echo "FLOW 7: Contact Book"
echo "========================================="

test_api "Search Contact Book (Manual)" "GET" "/api/contact-book/search?ownerUserId=$CUSTOMER_USER_ID&type=MANUAL" "" "$CUSTOMER_TOKEN"

# Add contact
ADD_CONTACT_DATA='{
  "ownerUserRoleId": "role-cust-0001-0000-0000-000000000000",
  "processServerId": "prof-ps-0010-0000-0000-000000000000",
  "entryType": "MANUAL",
  "nickname": "Test Favorite Server"
}'

CONTACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/contact-book" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "$ADD_CONTACT_DATA")

CONTACT_ID=$(echo "$CONTACT_RESPONSE" | jq -r '.id')

if [ -z "$CONTACT_ID" ] || [ "$CONTACT_ID" = "null" ]; then
    echo -e "${RED}✗ FAIL${NC} Contact add failed"
else
    echo -e "${GREEN}✓ PASS${NC} Contact added successfully"
    echo "Contact ID: $CONTACT_ID"
fi
echo ""

echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi
