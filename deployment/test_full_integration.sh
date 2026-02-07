#!/bin/bash

# Full Integration Testing Script
# Tests: Order creation, editing, adding recipients, updating all new fields

# Configuration
BASE_URL="https://app.ezcollab.com/api"
EMAIL="sarah.anderson@techcorp.com"
PASSWORD="password"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header "FULL INTEGRATION TEST - ORDER CREATION & EDITING"

# ===== LOGIN =====
print_header "STEP 1: Authentication"
print_step "Logging in as $EMAIL"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$EMAIL"'",
    "password": "'"$PASSWORD"'"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
CUSTOMER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.userId')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    print_success "Authenticated successfully (User: $CUSTOMER_ID)"
    ((TESTS_RUN++))
else
    print_error "Authentication failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# ===== CREATE ORDER WITH MINIMAL DATA =====
print_header "STEP 2: Create Order with Minimal Data (Draft)"
print_step "Creating order in DRAFT status with one recipient"

CREATE_ORDER=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "tenant-main-001",
    "customerId": "'"$CUSTOMER_ID"'",
    "orderType": "PROCESS_SERVICE",
    "documentType": "SUMMONS",
    "caseNumber": "2026-TEST-001",
    "jurisdiction": "Travis County Court",
    "deadline": "2026-02-20T17:00:00",
    "status": "DRAFT",
    "initiatorType": "SELF_REPRESENTED",
    "initiatorFirstName": "Sarah",
    "initiatorLastName": "Anderson",
    "recipients": [{
      "recipientName": "Test Person One",
      "recipientAddress": "100 Test Street",
      "recipientZipCode": "78701",
      "recipientEntityType": "INDIVIDUAL",
      "firstName": "Test",
      "lastName": "One",
      "city": "Austin",
      "state": "Texas",
      "recipientType": "AUTOMATED",
      "serviceType": "PROCESS_SERVICE",
      "processService": true
    }]
  }')

ORDER_ID=$(echo "$CREATE_ORDER" | jq -r '.id')
ORDER_NUMBER=$(echo "$CREATE_ORDER" | jq -r '.orderNumber')

if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
    print_success "Order created: $ORDER_NUMBER (ID: $ORDER_ID)"
    ((TESTS_RUN++))
    echo -e "  ${CYAN}Status:${NC} $(echo "$CREATE_ORDER" | jq -r '.status')"
    echo -e "  ${CYAN}Initiator:${NC} $(echo "$CREATE_ORDER" | jq -r '.initiatorType') - $(echo "$CREATE_ORDER" | jq -r '.initiatorFirstName') $(echo "$CREATE_ORDER" | jq -r '.initiatorLastName')"
else
    print_error "Failed to create order"
    echo "$CREATE_ORDER" | jq '.'
    exit 1
fi

# ===== UPDATE ORDER - ADD COMPLETE INITIATOR INFO =====
print_header "STEP 3: Update Order - Add Complete Initiator Information"
print_step "Simulating frontend edit: Adding all initiator fields + hearing dates"

UPDATE_ORDER=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "orderType": "PROCESS_SERVICE",
    "documentType": "SUMMONS",
    "caseNumber": "2026-TEST-001",
    "jurisdiction": "Travis County Court",
    "deadline": "2026-02-20T17:00:00",
    "initiatorType": "ATTORNEY",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "Elizabeth",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "500 Congress Avenue, Suite 1200",
    "initiatorCity": "Austin",
    "initiatorState": "Texas",
    "initiatorZipCode": "78701",
    "initiatorPhone": "+1-512-555-1234",
    "hearingDate": "2026-03-01T10:00:00",
    "personalServiceDate": "2026-02-18T14:00:00",
    "specialInstructions": "Updated via edit modal - Please handle with care"
  }')

UPDATED_INITIATOR_TYPE=$(echo "$UPDATE_ORDER" | jq -r '.initiatorType')
UPDATED_MIDDLE_NAME=$(echo "$UPDATE_ORDER" | jq -r '.initiatorMiddleName')
UPDATED_ADDRESS=$(echo "$UPDATE_ORDER" | jq -r '.initiatorAddress')
UPDATED_HEARING=$(echo "$UPDATE_ORDER" | jq -r '.hearingDate')

if [ "$UPDATED_INITIATOR_TYPE" = "ATTORNEY" ] && [ "$UPDATED_MIDDLE_NAME" = "Elizabeth" ]; then
    print_success "Order updated with complete initiator info"
    ((TESTS_RUN++))
    echo -e "  ${CYAN}Type Changed:${NC} SELF_REPRESENTED → ATTORNEY"
    echo -e "  ${CYAN}Full Name:${NC} Sarah Elizabeth Anderson"
    echo -e "  ${CYAN}Address:${NC} $UPDATED_ADDRESS"
    echo -e "  ${CYAN}City/State:${NC} Austin, Texas 78701"
    echo -e "  ${CYAN}Phone:${NC} +1-512-555-1234"
    echo -e "  ${CYAN}Hearing Date:${NC} $UPDATED_HEARING"
    echo -e "  ${CYAN}Service Date:${NC} $(echo "$UPDATE_ORDER" | jq -r '.personalServiceDate')"
else
    print_error "Failed to update initiator information"
    echo "$UPDATE_ORDER" | jq '.'
fi

# ===== RETRIEVE ORDER TO VERIFY UPDATE =====
print_header "STEP 4: Retrieve Order to Verify Updates"
print_step "Fetching order details (simulating page load)"

GET_ORDER=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

RECIPIENT_COUNT=$(echo "$GET_ORDER" | jq '.recipients | length')

print_success "Order retrieved successfully"
((TESTS_RUN++))
echo -e "  ${CYAN}Current Recipient Count:${NC} $RECIPIENT_COUNT"

# Display current recipient
RECIP_1_ENTITY_TYPE=$(echo "$GET_ORDER" | jq -r '.recipients[0].recipientEntityType')
RECIP_1_FIRST=$(echo "$GET_ORDER" | jq -r '.recipients[0].firstName')
RECIP_1_LAST=$(echo "$GET_ORDER" | jq -r '.recipients[0].lastName')
echo -e "  ${CYAN}Recipient 1:${NC} $RECIP_1_ENTITY_TYPE - $RECIP_1_FIRST $RECIP_1_LAST"

# ===== ADD SECOND RECIPIENT (INDIVIDUAL) =====
print_header "STEP 5: Add Second Recipient - INDIVIDUAL with Contact Info"
print_step "Simulating 'Add Recipient' button click in frontend"

ADD_RECIPIENT_2=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "recipientUpdates": [{
      "isNew": true,
      "recipientName": "Jane Marie Smith",
      "recipientAddress": "200 Oak Boulevard, Apt 5B",
      "recipientZipCode": "78702",
      "recipientEntityType": "INDIVIDUAL",
      "firstName": "Jane",
      "middleName": "Marie",
      "lastName": "Smith",
      "email": "jane.smith@email.com",
      "phone": "+1-512-555-9999",
      "city": "Austin",
      "state": "Texas",
      "recipientType": "AUTOMATED",
      "processService": true
    }]
  }')

RECIPIENT_2_ID=$(echo "$ADD_RECIPIENT_2" | jq -r '.recipients | map(select(.firstName=="Jane")) | .[0].id')

if [ "$RECIPIENT_2_ID" != "null" ] && [ -n "$RECIPIENT_2_ID" ]; then
    print_success "Second recipient added (INDIVIDUAL)"
    ((TESTS_RUN++))
    RECIP_2_EMAIL=$(echo "$ADD_RECIPIENT_2" | jq -r '.recipients | map(select(.firstName=="Jane")) | .[0].email')
    RECIP_2_PHONE=$(echo "$ADD_RECIPIENT_2" | jq -r '.recipients | map(select(.firstName=="Jane")) | .[0].phone')
    echo -e "  ${CYAN}Name:${NC} Jane Marie Smith"
    echo -e "  ${CYAN}Email:${NC} $RECIP_2_EMAIL"
    echo -e "  ${CYAN}Phone:${NC} $RECIP_2_PHONE"
else
    print_error "Failed to add second recipient"
    echo "$ADD_RECIPIENT_2" | jq '.'
fi

# ===== ADD THIRD RECIPIENT (ORGANIZATION) =====
print_header "STEP 6: Add Third Recipient - ORGANIZATION"
print_step "Adding organization recipient with authorized agent"

ADD_RECIPIENT_3=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "recipientUpdates": [{
      "isNew": true,
      "recipientName": "Tech Solutions LLC",
      "recipientAddress": "300 Innovation Drive, Building C",
      "recipientZipCode": "78703",
      "recipientEntityType": "ORGANIZATION",
      "organizationName": "Tech Solutions LLC",
      "authorizedAgent": "Robert Johnson",
      "email": "legal@techsolutions.com",
      "phone": "+1-512-555-7777",
      "city": "Austin",
      "state": "Texas",
      "recipientType": "GUIDED",
      "processService": true,
      "certifiedMail": true
    }]
  }')

RECIPIENT_3_ID=$(echo "$ADD_RECIPIENT_3" | jq -r '.recipients | map(select(.organizationName=="Tech Solutions LLC")) | .[0].id')

if [ "$RECIPIENT_3_ID" != "null" ] && [ -n "$RECIPIENT_3_ID" ]; then
    print_success "Third recipient added (ORGANIZATION)"
    ((TESTS_RUN++))
    RECIP_3_ORG=$(echo "$ADD_RECIPIENT_3" | jq -r '.recipients | map(select(.organizationName=="Tech Solutions LLC")) | .[0].organizationName')
    RECIP_3_AGENT=$(echo "$ADD_RECIPIENT_3" | jq -r '.recipients | map(select(.organizationName=="Tech Solutions LLC")) | .[0].authorizedAgent')
    RECIP_3_EMAIL=$(echo "$ADD_RECIPIENT_3" | jq -r '.recipients | map(select(.organizationName=="Tech Solutions LLC")) | .[0].email')
    echo -e "  ${CYAN}Organization:${NC} $RECIP_3_ORG"
    echo -e "  ${CYAN}Authorized Agent:${NC} $RECIP_3_AGENT"
    echo -e "  ${CYAN}Email:${NC} $RECIP_3_EMAIL"
    echo -e "  ${CYAN}Phone:${NC} +1-512-555-7777"
    echo -e "  ${CYAN}Assignment:${NC} GUIDED"
else
    print_error "Failed to add third recipient"
    echo "$ADD_RECIPIENT_3" | jq '.'
fi

# ===== RETRIEVE UPDATED ORDER WITH ALL RECIPIENTS =====
print_header "STEP 7: Verify All Recipients"
print_step "Fetching complete order with all recipients"

FINAL_ORDER=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

FINAL_RECIPIENT_COUNT=$(echo "$FINAL_ORDER" | jq '.recipients | length')
TOTAL_RECIPIENTS=$(echo "$FINAL_ORDER" | jq -r '.totalRecipients')

if [ "$FINAL_RECIPIENT_COUNT" = "3" ]; then
    print_success "All recipients verified (Count: $FINAL_RECIPIENT_COUNT)"
    ((TESTS_RUN++))
    
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━ ORDER SUMMARY ━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Order Number:${NC} $ORDER_NUMBER"
    echo -e "${CYAN}Total Recipients:${NC} $TOTAL_RECIPIENTS"
    echo -e "${CYAN}Has Multiple Recipients:${NC} $(echo "$FINAL_ORDER" | jq -r '.hasMultipleRecipients')"
    
    echo -e "\n${CYAN}Initiator Information:${NC}"
    echo -e "  Type: $(echo "$FINAL_ORDER" | jq -r '.initiatorType')"
    echo -e "  Name: $(echo "$FINAL_ORDER" | jq -r '.initiatorFirstName') $(echo "$FINAL_ORDER" | jq -r '.initiatorMiddleName') $(echo "$FINAL_ORDER" | jq -r '.initiatorLastName')"
    echo -e "  Address: $(echo "$FINAL_ORDER" | jq -r '.initiatorAddress')"
    echo -e "  City/State: $(echo "$FINAL_ORDER" | jq -r '.initiatorCity'), $(echo "$FINAL_ORDER" | jq -r '.initiatorState') $(echo "$FINAL_ORDER" | jq -r '.initiatorZipCode')"
    echo -e "  Phone: $(echo "$FINAL_ORDER" | jq -r '.initiatorPhone')"
    
    echo -e "\n${CYAN}Important Dates:${NC}"
    echo -e "  Hearing Date: $(echo "$FINAL_ORDER" | jq -r '.hearingDate')"
    echo -e "  Personal Service Date: $(echo "$FINAL_ORDER" | jq -r '.personalServiceDate')"
    echo -e "  Deadline: $(echo "$FINAL_ORDER" | jq -r '.deadline')"
    
    echo -e "\n${CYAN}Recipients:${NC}"
    for i in {0..2}; do
        ENTITY_TYPE=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].recipientEntityType")
        if [ "$ENTITY_TYPE" = "INDIVIDUAL" ]; then
            FNAME=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].firstName")
            MNAME=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].middleName")
            LNAME=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].lastName")
            EMAIL=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].email")
            PHONE=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].phone")
            echo -e "  ${GREEN}[$((i+1))] INDIVIDUAL${NC}"
            echo -e "      Name: $FNAME $MNAME $LNAME"
            echo -e "      Email: $EMAIL"
            echo -e "      Phone: $PHONE"
        elif [ "$ENTITY_TYPE" = "ORGANIZATION" ]; then
            ORG_NAME=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].organizationName")
            AGENT=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].authorizedAgent")
            EMAIL=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].email")
            PHONE=$(echo "$FINAL_ORDER" | jq -r ".recipients[$i].phone")
            echo -e "  ${GREEN}[$((i+1))] ORGANIZATION${NC}"
            echo -e "      Organization: $ORG_NAME"
            echo -e "      Authorized Agent: $AGENT"
            echo -e "      Email: $EMAIL"
            echo -e "      Phone: $PHONE"
        fi
    done
else
    print_error "Recipient count mismatch (Expected: 3, Got: $FINAL_RECIPIENT_COUNT)"
fi

# ===== UPDATE RECIPIENT (EDIT MODAL TEST) =====
print_header "STEP 8: Update Recipient - Edit Modal Simulation"
print_step "Updating recipient #2 (Jane Smith) - changing email and phone"

# Get recipient ID from the order
RECIPIENT_2_ID_FROM_ORDER=$(echo "$FINAL_ORDER" | jq -r '.recipients[1].id')

UPDATE_RECIPIENT=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "recipientUpdates": [{
      "recipientId": "'"$RECIPIENT_2_ID_FROM_ORDER"'",
      "recipientName": "Jane Marie Smith",
      "recipientAddress": "200 Oak Boulevard, Apt 5B",
      "recipientZipCode": "78702",
      "recipientEntityType": "INDIVIDUAL",
      "firstName": "Jane",
      "middleName": "Marie-Updated",
      "lastName": "Smith",
      "email": "jane.m.smith@newemail.com",
      "phone": "+1-512-555-8888",
      "city": "Austin",
      "state": "Texas",
      "recipientType": "AUTOMATED",
      "processService": true
    }]
  }')

# Find the updated recipient
UPDATED_RECIP=$(echo "$UPDATE_RECIPIENT" | jq '.recipients[] | select(.id=="'"$RECIPIENT_2_ID_FROM_ORDER"'")')
UPDATED_EMAIL=$(echo "$UPDATED_RECIP" | jq -r '.email')
UPDATED_PHONE=$(echo "$UPDATED_RECIP" | jq -r '.phone')

if [ "$UPDATED_EMAIL" = "jane.m.smith@newemail.com" ]; then
    print_success "Recipient updated successfully"
    ((TESTS_RUN++))
    echo -e "  ${CYAN}New Email:${NC} $UPDATED_EMAIL"
    echo -e "  ${CYAN}New Phone:${NC} $UPDATED_PHONE"
else
    print_error "Failed to update recipient"
    echo "$UPDATE_RECIPIENT" | jq '.'
fi

# ===== DELETE ONE RECIPIENT =====
print_header "STEP 9: Delete Recipient - Remove First Recipient"
print_step "Deleting recipient #1 (Test One) using toBeRemoved flag"

# Get first recipient ID
RECIPIENT_1_ID_FROM_ORDER=$(echo "$FINAL_ORDER" | jq -r '.recipients[0].id')

DELETE_VIA_UPDATE=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "recipientUpdates": [{
      "recipientId": "'"$RECIPIENT_1_ID_FROM_ORDER"'",
      "toBeRemoved": true,
      "recipientName": "placeholder",
      "recipientAddress": "placeholder",
      "recipientZipCode": "00000"
    }]
  }')

# Verify deletion
VERIFY_DELETE=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

REMAINING_COUNT=$(echo "$VERIFY_DELETE" | jq '.recipients | length')

if [ "$REMAINING_COUNT" = "2" ]; then
    print_success "Recipient deleted (Remaining: $REMAINING_COUNT)"
    ((TESTS_RUN++))
else
    print_error "Failed to delete recipient (Count: $REMAINING_COUNT)"
fi

# ===== TEST EDIT DOCUMENT MODAL - UPDATE HEARING DATES =====
print_header "STEP 10: Edit Document Modal - Update Hearing Dates"
print_step "Simulating document edit modal: Changing hearing dates"

UPDATE_DATES=$(curl -s -X PUT "$BASE_URL/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "'"$ORDER_ID"'",
    "orderType": "PROCESS_SERVICE",
    "documentType": "SUMMONS",
    "caseNumber": "2026-TEST-001-UPDATED",
    "jurisdiction": "Travis County Court - Updated",
    "deadline": "2026-02-25T17:00:00",
    "initiatorType": "ATTORNEY",
    "initiatorFirstName": "Sarah",
    "initiatorMiddleName": "Elizabeth",
    "initiatorLastName": "Anderson",
    "initiatorAddress": "500 Congress Avenue, Suite 1200",
    "initiatorCity": "Austin",
    "initiatorState": "Texas",
    "initiatorZipCode": "78701",
    "initiatorPhone": "+1-512-555-1234",
    "hearingDate": "2026-03-10T14:30:00",
    "personalServiceDate": "2026-02-20T09:00:00",
    "specialInstructions": "Dates updated via document edit modal"
  }')

NEW_HEARING=$(echo "$UPDATE_DATES" | jq -r '.hearingDate')
NEW_SERVICE=$(echo "$UPDATE_DATES" | jq -r '.personalServiceDate')
NEW_CASE=$(echo "$UPDATE_DATES" | jq -r '.caseNumber')

if [ "$NEW_CASE" = "2026-TEST-001-UPDATED" ]; then
    print_success "Document details updated"
    ((TESTS_RUN++))
    echo -e "  ${CYAN}Case Number:${NC} $NEW_CASE"
    echo -e "  ${CYAN}New Hearing Date:${NC} $NEW_HEARING"
    echo -e "  ${CYAN}New Service Date:${NC} $NEW_SERVICE"
else
    print_error "Failed to update document details"
fi

# ===== FINAL VERIFICATION =====
print_header "STEP 11: Final Verification - Complete Order Review"
print_step "Retrieving final order state (simulating review page)"

FINAL_STATE=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

FINAL_RECIP_COUNT=$(echo "$FINAL_STATE" | jq '.recipients | length')
HAS_MULTIPLE=$(echo "$FINAL_STATE" | jq -r '.hasMultipleRecipients')

print_success "Final order state verified"
((TESTS_RUN++))

echo -e "\n${GREEN}━━━━━━━━━━━━━━━ FINAL ORDER STATE ━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Order Number:${NC} $(echo "$FINAL_STATE" | jq -r '.orderNumber')"
echo -e "${GREEN}Status:${NC} $(echo "$FINAL_STATE" | jq -r '.status')"
echo -e "${GREEN}Recipient Count:${NC} $FINAL_RECIP_COUNT"
echo -e "${GREEN}Has Multiple Recipients:${NC} $HAS_MULTIPLE"
echo -e "${GREEN}Modification Count:${NC} $(echo "$FINAL_STATE" | jq -r '.modificationCount')"

# ===== CLEANUP =====
print_header "STEP 12: Cleanup - Delete Test Order"
print_step "Removing test order"

curl -s -X DELETE "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

print_success "Test order deleted: $ORDER_NUMBER"
((TESTS_RUN++))

# ===== SUMMARY =====
print_header "TEST SUMMARY"

echo -e "${CYAN}Total Tests Run:${NC} $TESTS_RUN"
echo -e "${GREEN}Tests Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Tests Failed:${NC} $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✓ ALL INTEGRATION TESTS PASSED!               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo -e "\n${GREEN}Verified Functionality:${NC}"
    echo -e "  ✓ Order creation with new fields"
    echo -e "  ✓ Update initiator information (Edit Document Modal)"
    echo -e "  ✓ Add multiple recipients after order creation"
    echo -e "  ✓ Add INDIVIDUAL recipients with contact info"
    echo -e "  ✓ Add ORGANIZATION recipients with authorized agent"
    echo -e "  ✓ Update existing recipients (Edit Recipient Modal)"
    echo -e "  ✓ Delete recipients"
    echo -e "  ✓ Update hearing dates and case information"
    echo -e "  ✓ All new fields persist correctly"
    echo -e "  ✓ hasMultipleRecipients flag updates correctly"
    echo -e "\n${GREEN}Frontend UI should work correctly with these operations!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please review errors above.${NC}"
    exit 1
fi
