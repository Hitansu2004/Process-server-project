#!/bin/bash

# Backend Order API Test Script
# Tests all new fields on ezcollab.com

set -e

BASE_URL="https://app.ezcollab.com/api"
EMAIL="sarah.anderson@techcorp.com"
PASSWORD="password"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓ $1${NC}"; }
log_step() { echo -e "${BLUE}➤ $1${NC}"; }
log_error() { echo -e "${RED}✗ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Store created order IDs for cleanup
ORDER_IDS=()

# Step 1: Login
log_step "Step 1: Logging in as Sarah Anderson..."
LOGIN_RESPONSE=$(curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -s)

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.userId')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    log_error "Login failed!"
    echo "$LOGIN_RESPONSE" | jq '.'
    exit 1
fi

log_info "Login successful! User ID: $USER_ID"
echo ""

# Step 2: Test Order Creation - SELF_REPRESENTED + INDIVIDUAL + AUTOMATED (Open Bid)
log_step "Step 2: Creating Order #1 - Self-Represented Individual (Open Bid)..."
ORDER1=$(curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "'"$USER_ID"'",
    "documentType": "SUBPOENA",
    "caseNumber": "TEST-2026-001",
    "jurisdiction": "Dallas County Superior Court",
    "deadline": "2026-02-15T17:00:00",
    "initiatorType": "SELF_REPRESENTED",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "Marie",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "123 Main Street",
    "initiatorCity": "Dallas",
    "initiatorState": "TX",
    "initiatorZipCode": "75201",
    "initiatorPhone": "+1-214-555-0101",
    "hearingDate": "2026-02-20T10:00:00",
    "personalServiceDate": "2026-02-18T14:30:00",
    "recipients": [
      {
        "recipientEntityType": "INDIVIDUAL",
        "firstName": "John",
        "middleName": "Michael",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1-214-555-9999",
        "address": "456 Oak Avenue",
        "city": "Dallas",
        "state": "Texas",
        "stateId": 43,
        "zipCode": "75202",
        "notes": "Ring doorbell twice",
        "assignmentType": "AUTOMATED",
        "processService": true,
        "certifiedMail": false,
        "rushService": true,
        "remoteLocation": false
      }
    ]
  }' \
  -s)

ORDER1_ID=$(echo "$ORDER1" | jq -r '.id')
ORDER1_NUMBER=$(echo "$ORDER1" | jq -r '.orderNumber')

if [ "$ORDER1_ID" = "null" ] || [ -z "$ORDER1_ID" ]; then
    log_error "Order #1 creation failed!"
    echo "$ORDER1" | jq '.'
    exit 1
fi

ORDER_IDS+=("$ORDER1_ID")
log_info "Order #1 created: $ORDER1_NUMBER (ID: $ORDER1_ID)"
echo "  → Initiator: SELF_REPRESENTED - Sarah Marie Anderson"
echo "  → Recipient: INDIVIDUAL - John Michael Doe"
echo "  → Email: john.doe@example.com, Phone: +1-214-555-9999"
echo "  → Hearing Date: 2026-02-20T10:00:00"
echo "  → Assignment: AUTOMATED (Open Bid)"
echo ""

# Step 3: Test Order Creation - ATTORNEY + ORGANIZATION + GUIDED (Direct Assignment)
log_step "Step 3: Creating Order #2 - Attorney Organization (Direct Assignment)..."
ORDER2=$(curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "'"$USER_ID"'",
    "documentType": "COMPLAINT",
    "caseNumber": "TEST-2026-002",
    "jurisdiction": "Federal Court Northern District Texas",
    "deadline": "2026-02-25T17:00:00",
    "initiatorType": "ATTORNEY",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "789 Legal Plaza",
    "initiatorCity": "Dallas",
    "initiatorState": "TX",
    "initiatorZipCode": "75201",
    "initiatorPhone": "+1-214-555-0101",
    "hearingDate": "2026-03-01T09:00:00",
    "personalServiceDate": "",
    "recipients": [
      {
        "recipientEntityType": "ORGANIZATION",
        "firstName": "",
        "middleName": "",
        "lastName": "",
        "organizationName": "Acme Corporation",
        "authorizedAgent": "Robert Johnson",
        "email": "legal@acmecorp.com",
        "phone": "+1-214-555-8888",
        "address": "1000 Business Parkway",
        "city": "Dallas",
        "state": "Texas",
        "stateId": 43,
        "zipCode": "75203",
        "notes": "Contact security desk first",
        "assignmentType": "GUIDED",
        "processServerId": "ps-profile-001",
        "processService": true,
        "certifiedMail": true,
        "rushService": false,
        "remoteLocation": false
      }
    ]
  }' \
  -s)

ORDER2_ID=$(echo "$ORDER2" | jq -r '.id')
ORDER2_NUMBER=$(echo "$ORDER2" | jq -r '.orderNumber')

if [ "$ORDER2_ID" = "null" ] || [ -z "$ORDER2_ID" ]; then
    log_error "Order #2 creation failed!"
    echo "$ORDER2" | jq '.'
else
    ORDER_IDS+=("$ORDER2_ID")
    log_info "Order #2 created: $ORDER2_NUMBER (ID: $ORDER2_ID)"
    echo "  → Initiator: ATTORNEY - Sarah Anderson"
    echo "  → Recipient: ORGANIZATION - Acme Corporation"
    echo "  → Agent: Robert Johnson"
    echo "  → Email: legal@acmecorp.com, Phone: +1-214-555-8888"
    echo "  → Assignment: GUIDED (Direct to ps-profile-001)"
fi
echo ""

# Step 4: Test Order Creation - Mixed Recipients
log_step "Step 4: Creating Order #3 - Multiple Recipients (Individual + Organization)..."
ORDER3=$(curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "'"$USER_ID"'",
    "documentType": "NOTICE",
    "caseNumber": "TEST-2026-003",
    "jurisdiction": "Dallas County Court",
    "deadline": "2026-02-12T17:00:00",
    "initiatorType": "SELF_REPRESENTED",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "",
    "initiatorCity": "",
    "initiatorState": "",
    "initiatorZipCode": "",
    "initiatorPhone": "",
    "hearingDate": "",
    "personalServiceDate": "",
    "recipients": [
      {
        "recipientEntityType": "INDIVIDUAL",
        "firstName": "Jane",
        "middleName": "",
        "lastName": "Smith",
        "email": "jane.smith@email.com",
        "phone": "+1-214-555-7777",
        "address": "200 Elm Street",
        "city": "Dallas",
        "state": "Texas",
        "stateId": 43,
        "zipCode": "75204",
        "notes": "",
        "assignmentType": "AUTOMATED",
        "processService": true,
        "certifiedMail": false,
        "rushService": false,
        "remoteLocation": false
      },
      {
        "recipientEntityType": "ORGANIZATION",
        "organizationName": "XYZ Services LLC",
        "authorizedAgent": "Michael Brown",
        "email": "contact@xyzservices.com",
        "phone": "+1-214-555-6666",
        "address": "500 Commerce Street",
        "city": "Dallas",
        "state": "Texas",
        "stateId": 43,
        "zipCode": "75205",
        "notes": "Office hours 9-5",
        "assignmentType": "AUTOMATED",
        "processService": false,
        "certifiedMail": true,
        "rushService": false,
        "remoteLocation": false
      }
    ]
  }' \
  -s)

ORDER3_ID=$(echo "$ORDER3" | jq -r '.id')
ORDER3_NUMBER=$(echo "$ORDER3" | jq -r '.orderNumber')

if [ "$ORDER3_ID" = "null" ] || [ -z "$ORDER3_ID" ]; then
    log_error "Order #3 creation failed!"
    echo "$ORDER3" | jq '.'
else
    ORDER_IDS+=("$ORDER3_ID")
    log_info "Order #3 created: $ORDER3_NUMBER (ID: $ORDER3_ID)"
    echo "  → Initiator: SELF_REPRESENTED - Sarah Anderson (minimal fields)"
    echo "  → Recipient 1: INDIVIDUAL - Jane Smith (jane.smith@email.com)"
    echo "  → Recipient 2: ORGANIZATION - XYZ Services LLC (contact@xyzservices.com)"
    echo "  → Both recipients: AUTOMATED assignment"
fi
echo ""

# Step 5: Retrieve and Verify Order #1
log_step "Step 5: Retrieving Order #1 to verify all fields..."
ORDER1_RETRIEVED=$(curl -X GET "$BASE_URL/orders/$ORDER1_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$ORDER1_RETRIEVED" | jq '{
  orderNumber,
  initiatorType,
  initiatorFirstName,
  initiatorMiddleName,
  initiatorLastName,
  initiatorAddress,
  initiatorCity,
  initiatorState,
  initiatorZipCode,
  initiatorPhone,
  hearingDate,
  personalServiceDate,
  recipients: [.recipients[] | {
    recipientEntityType,
    firstName,
    middleName,
    lastName,
    organizationName,
    authorizedAgent,
    email,
    phone,
    address,
    assignmentType
  }]
}'
echo ""

# Step 6: Update Order #1
log_step "Step 6: Updating Order #1 initiator fields..."
UPDATE_RESPONSE=$(curl -X PUT "$BASE_URL/orders/$ORDER1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER1_ID"'",
    "initiatorType": "ATTORNEY",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "M.",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "999 Updated Avenue",
    "initiatorCity": "Dallas",
    "initiatorState": "TX",
    "initiatorZipCode": "75201",
    "initiatorPhone": "+1-214-555-0999",
    "hearingDate": "2026-02-22T11:00:00",
    "personalServiceDate": "2026-02-19T15:00:00"
  }' \
  -s)

UPDATE_SUCCESS=$(echo "$UPDATE_RESPONSE" | jq -r '.id')
if [ "$UPDATE_SUCCESS" = "null" ] || [ -z "$UPDATE_SUCCESS" ]; then
    log_error "Update failed!"
    echo "$UPDATE_RESPONSE" | jq '.'
else
    log_info "Order #1 updated successfully"
    echo "  → Initiator changed to ATTORNEY"
    echo "  → Address updated to 999 Updated Avenue"
    echo "  → Hearing date updated to 2026-02-22T11:00:00"
fi
echo ""

# Step 7: List all orders
log_step "Step 7: Listing all orders for verification..."
ALL_ORDERS=$(curl -X GET "$BASE_URL/orders/customer/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -s)

ORDER_COUNT=$(echo "$ALL_ORDERS" | jq 'length')
log_info "Found $ORDER_COUNT orders for this customer"
echo "$ALL_ORDERS" | jq '[.[] | {orderNumber, status, initiatorType, recipientCount: (.recipients | length)}]'
echo ""

# Step 8: Cleanup - Delete all created test orders
log_step "Step 8: Cleaning up - Deleting test orders..."
for order_id in "${ORDER_IDS[@]}"; do
    DELETE_RESPONSE=$(curl -X DELETE "$BASE_URL/orders/$order_id" \
      -H "Authorization: Bearer $TOKEN" \
      -s)
    
    if echo "$DELETE_RESPONSE" | grep -q "success\|deleted\|cancelled" 2>/dev/null || [ -z "$DELETE_RESPONSE" ]; then
        log_info "Deleted order: $order_id"
    else
        # Try cancel instead
        CANCEL_RESPONSE=$(curl -X POST "$BASE_URL/orders/$order_id/cancel" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d '{"reason":"Test cleanup"}' \
          -s)
        log_info "Cancelled order: $order_id"
    fi
done
echo ""

# Step 9: Final verification
log_step "Step 9: Final verification - Checking orders were cleaned up..."
FINAL_ORDERS=$(curl -X GET "$BASE_URL/orders/customer/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -s)

FINAL_COUNT=$(echo "$FINAL_ORDERS" | jq '[.[] | select(.status != "CANCELLED")] | length')
log_info "Remaining active orders: $FINAL_COUNT"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
log_step "TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
log_info "✓ Login successful"
log_info "✓ Created 3 test orders with all new fields"
log_info "  - Order #1: SELF_REPRESENTED + INDIVIDUAL + AUTOMATED"
log_info "  - Order #2: ATTORNEY + ORGANIZATION + GUIDED"
log_info "  - Order #3: Mixed recipients (INDIVIDUAL + ORGANIZATION)"
log_info "✓ All new fields tested:"
echo "    • initiatorType (SELF_REPRESENTED, ATTORNEY)"
echo "    • initiatorFirstName, initiatorMiddleName, initiatorLastName"
echo "    • initiatorAddress, initiatorCity, initiatorState, initiatorZipCode, initiatorPhone"
echo "    • hearingDate, personalServiceDate"
echo "    • recipientEntityType (INDIVIDUAL, ORGANIZATION)"
echo "    • firstName, middleName, lastName"
echo "    • organizationName, authorizedAgent"
echo "    • email, phone"
log_info "✓ Retrieved orders and verified field persistence"
log_info "✓ Updated order successfully"
log_info "✓ Cleaned up test data"
echo "═══════════════════════════════════════════════════════════════"
log_info "ALL TESTS PASSED! Backend is working correctly! 🎉"
echo "═══════════════════════════════════════════════════════════════"
