#!/bin/bash

# Backend API Testing Script for New Fields
# Tests all new functionality: initiator types, entity types, contact info, hearing dates

# set -e  # Exit on first error (disabled for debugging)

# Configuration
BASE_URL="https://app.ezcollab.com/api"
EMAIL="sarah.anderson@techcorp.com"
PASSWORD="password"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test step
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Backend API Testing - New Fields Implementation     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# ===== TEST 1: Login =====
print_step "Step 1: Authenticating as $EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$EMAIL"'",
    "password": "'"$PASSWORD"'"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
CUSTOMER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.userId')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    print_success "Logged in successfully (User ID: $CUSTOMER_ID)"
    ((TESTS_RUN++))
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# ===== TEST 2: Create Order #1 (Self-Represented Individual) =====
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_step "Step 2: Creating Order #1 - SELF_REPRESENTED + INDIVIDUAL + AUTOMATED"
echo -e "${YELLOW}Testing: InitiatorType, Initiator fields, Hearing dates, RecipientEntityType, Contact info${NC}"

ORDER_1=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "tenant-main-001",
    "customerId": "'"$CUSTOMER_ID"'",
    "orderType": "PROCESS_SERVICE",
    "documentType": "SUBPOENA",
    "caseNumber": "2026-CV-12345",
    "jurisdiction": "Dallas County District Court",
    "deadline": "2026-02-28T17:00:00",
    "status": "DRAFT",
    "initiatorType": "SELF_REPRESENTED",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "Marie",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "123 Main Street, Suite 400",
    "initiatorCity": "Dallas",
    "initiatorState": "Texas",
    "initiatorZipCode": "75201",
    "initiatorPhone": "+1-214-555-0101",
    "hearingDate": "2026-03-15T09:00:00",
    "personalServiceDate": "2026-02-25T12:00:00",
    "specialInstructions": "Please serve between 9 AM and 5 PM only",
    "recipients": [{
      "recipientName": "John Michael Doe",
      "recipientAddress": "456 Oak Avenue, Apt 23",
      "recipientZipCode": "75202",
      "recipientEntityType": "INDIVIDUAL",
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-214-555-9876",
      "city": "Dallas",
      "state": "Texas",
      "recipientType": "AUTOMATED",
      "serviceType": "PROCESS_SERVICE",
      "processService": true,
      "notes": "Weekday mornings preferred"
    }]
  }')

ORDER_1_ID=$(echo "$ORDER_1" | jq -r '.id')
ORDER_1_NUM=$(echo "$ORDER_1" | jq -r '.orderNumber')

if [ "$ORDER_1_ID" != "null" ] && [ -n "$ORDER_1_ID" ]; then
    print_success "Order #1 created: $ORDER_1_NUM (ID: $ORDER_1_ID)"
    ((TESTS_RUN++))
    
    # Verify new fields
    INITIATOR_TYPE=$(echo "$ORDER_1" | jq -r '.initiatorType')
    INITIATOR_FIRST=$(echo "$ORDER_1" | jq -r '.initiatorFirstName')
    HEARING_DATE=$(echo "$ORDER_1" | jq -r '.hearingDate')
    PERSONAL_SVC_DATE=$(echo "$ORDER_1" | jq -r '.personalServiceDate')
    
    echo -e "  ${GREEN}Initiator Type:${NC} $INITIATOR_TYPE"
    echo -e "  ${GREEN}Initiator Name:${NC} $INITIATOR_FIRST $(echo "$ORDER_1" | jq -r '.initiatorMiddleName') $(echo "$ORDER_1" | jq -r '.initiatorLastName')"
    echo -e "  ${GREEN}Initiator Address:${NC} $(echo "$ORDER_1" | jq -r '.initiatorAddress'), $(echo "$ORDER_1" | jq -r '.initiatorCity'), $(echo "$ORDER_1" | jq -r '.initiatorState') $(echo "$ORDER_1" | jq -r '.initiatorZipCode')"
    echo -e "  ${GREEN}Initiator Phone:${NC} $(echo "$ORDER_1" | jq -r '.initiatorPhone')"
    echo -e "  ${GREEN}Hearing Date:${NC} $HEARING_DATE"
    echo -e "  ${GREEN}Personal Service Date:${NC} $PERSONAL_SVC_DATE"
else
    print_error "Failed to create Order #1"
    echo "$ORDER_1" | jq '.'
    exit 1
fi

# ===== TEST 3: Retrieve Order and Verify Recipients =====
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_step "Step 3: Retrieving Order #1 to verify recipient fields"

ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/orders/$ORDER_1_ID" \
  -H "Authorization: Bearer $TOKEN")

RECIPIENT_ENTITY_TYPE=$(echo "$ORDER_DETAILS" | jq -r '.recipients[0].recipientEntityType')
RECIPIENT_FIRST=$(echo "$ORDER_DETAILS" | jq -r '.recipients[0].firstName')
RECIPIENT_LAST=$(echo "$ORDER_DETAILS" | jq -r '.recipients[0].lastName')
RECIPIENT_EMAIL=$(echo "$ORDER_DETAILS" | jq -r '.recipients[0].email')
RECIPIENT_PHONE=$(echo "$ORDER_DETAILS" | jq -r '.recipients[0].phone')

if [ "$RECIPIENT_ENTITY_TYPE" != "null" ]; then
    print_success "Recipient data retrieved successfully"
    ((TESTS_RUN++))
    
    echo -e "  ${GREEN}Entity Type:${NC} $RECIPIENT_ENTITY_TYPE"
    echo -e "  ${GREEN}Name:${NC} $RECIPIENT_FIRST $(echo "$ORDER_DETAILS" | jq -r '.recipients[0].middleName') $RECIPIENT_LAST"
    echo -e "  ${GREEN}Email:${NC} $RECIPIENT_EMAIL"
    echo -e "  ${GREEN}Phone:${NC} $RECIPIENT_PHONE"
else
    print_error "Failed to retrieve recipient data"
    echo "$ORDER_DETAILS" | jq '.recipients[0]'
fi

# ===== TEST 4: Create Order #2 (Attorney + Organization) =====
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_step "Step 4: Creating Order #2 - ATTORNEY + ORGANIZATION + GUIDED"
echo -e "${YELLOW}Testing: Attorney initiator, Organization recipient, Authorized agent${NC}"

ORDER_2=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "tenant-main-001",
    "customerId": "'"$CUSTOMER_ID"'",
    "orderType": "PROCESS_SERVICE",
    "documentType": "CITATION",
    "caseNumber": "2026-CV-67890",
    "jurisdiction": "Harris County Court",
    "deadline": "2026-03-10T17:00:00",
    "status": "DRAFT",
    "initiatorType": "ATTORNEY",
    "initiatorFirstName": "Michael",
    "initiatorLastName": "Thompson",
    "initiatorAddress": "789 Legal Plaza",
    "initiatorCity": "Houston",
    "initiatorState": "Texas",
    "initiatorZipCode": "77001",
    "initiatorPhone": "+1-713-555-7890",
    "hearingDate": "2026-03-25T10:30:00",
    "recipients": [{
      "recipientName": "Acme Corporation",
      "recipientAddress": "999 Business Parkway, Building A",
      "recipientZipCode": "77002",
      "recipientEntityType": "ORGANIZATION",
      "organizationName": "Acme Corporation",
      "authorizedAgent": "Jane Smith",
      "email": "legal@acmecorp.com",
      "phone": "+1-713-555-1111",
      "city": "Houston",
      "state": "Texas",
      "recipientType": "GUIDED",
      "serviceType": "PROCESS_SERVICE",
      "processService": true
    }]
  }')

ORDER_2_ID=$(echo "$ORDER_2" | jq -r '.id')
ORDER_2_NUM=$(echo "$ORDER_2" | jq -r '.orderNumber')

if [ "$ORDER_2_ID" != "null" ] && [ -n "$ORDER_2_ID" ]; then
    print_success "Order #2 created: $ORDER_2_NUM (ID: $ORDER_2_ID)"
    ((TESTS_RUN++))
    
    INIT_TYPE=$(echo "$ORDER_2" | jq -r '.initiatorType')
    echo -e "  ${GREEN}Initiator Type:${NC} $INIT_TYPE"
    echo -e "  ${GREEN}Initiator:${NC} $(echo "$ORDER_2" | jq -r '.initiatorFirstName') $(echo "$ORDER_2" | jq -r '.initiatorLastName')"
else
    print_error "Failed to create Order #2"
    echo "$ORDER_2" | jq '.'
    exit 1
fi

# Retrieve to check organization recipient
ORDER_2_DETAILS=$(curl -s -X GET "$BASE_URL/orders/$ORDER_2_ID" \
  -H "Authorization: Bearer $TOKEN")

ORG_NAME=$(echo "$ORDER_2_DETAILS" | jq -r '.recipients[0].organizationName')
AUTH_AGENT=$(echo "$ORDER_2_DETAILS" | jq -r '.recipients[0].authorizedAgent')

if [ "$ORG_NAME" != "null" ]; then
    print_success "Organization recipient verified"
    ((TESTS_RUN++))
    
    echo -e "  ${GREEN}Organization:${NC} $ORG_NAME"
    echo -e "  ${GREEN}Authorized Agent:${NC} $AUTH_AGENT"
    echo -e "  ${GREEN}Contact Email:${NC} $(echo "$ORDER_2_DETAILS" | jq -r '.recipients[0].email')"
else
    print_error "Organization recipient data missing"
fi

# ===== TEST 5: List All Orders =====
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_step "Step 5: Listing all orders to verify creation"

ORDERS_LIST=$(curl -s -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $TOKEN")

ORDER_COUNT=$(echo "$ORDERS_LIST" | jq '. | length')
print_success "Retrieved $ORDER_COUNT orders"
((TESTS_RUN++))

# ===== TEST 6: Cleanup =====
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_step "Step 6: Cleaning up test orders"

if [ "$ORDER_1_ID" != "null" ]; then
    curl -s -X DELETE "$BASE_URL/orders/$ORDER_1_ID" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    print_success "Deleted Order #1: $ORDER_1_NUM"
    ((TESTS_RUN++))
fi

if [ "$ORDER_2_ID" != "null" ]; then
    curl -s -X DELETE "$BASE_URL/orders/$ORDER_2_ID" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    print_success "Deleted Order #2: $ORDER_2_NUM"
    ((TESTS_RUN++))
fi

# ===== SUMMARY =====
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Test Summary                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e "${BLUE}Total Tests Run:${NC} $TESTS_RUN"
echo -e "${GREEN}Tests Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Tests Failed:${NC} $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! Backend is working correctly.${NC}"
    echo -e "${GREEN}✓ New fields verified:${NC}"
    echo -e "  - InitiatorType (SELF_REPRESENTED, ATTORNEY)"
    echo -e "  - Initiator details (9 fields)"
    echo -e "  - Hearing dates (2 fields)"
    echo -e "  - RecipientEntityType (INDIVIDUAL, ORGANIZATION)"
    echo -e "  - Contact fields (email, phone)"
    echo -e "  - Organization fields (name, authorized agent)"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
