#!/bin/bash

# Debug backend order creation
BASE_URL="https://app.ezcollab.com/api"
TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6W3sicm9sZSI6IkNVU1RPTUVSIiwidGVuYW50SWQiOiJ0ZW5hbnQtbWFpbi0wMDEiLCJpZCI6InR1ci1jdXN0LTAwMSJ9XSwiaXNTdXBlckFkbWluIjpmYWxzZSwidXNlcklkIjoidXNlci1jdXN0LTAwMSIsImVtYWlsIjoic2FyYWguYW5kZXJzb25AdGVjaGNvcnAuY29tIiwic3ViIjoic2FyYWguYW5kZXJzb25AdGVjaGNvcnAuY29tIiwiaWF0IjoxNzcwMjA5MTU4LCJleHAiOjE3NzAyOTU1NTh9.6HU1p9TB8L4a6r-IUzZaHjoM1Anlb-_mOYfy78YzIY8"

echo "Testing simple order creation with new fields..."

curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "tenant-main-001",
    "customerId": "user-cust-001",
    "orderType": "PROCESS_SERVICE",
    "documentType": "SUBPOENA",
    "caseNumber": "TEST-001",
    "jurisdiction": "Dallas County",
    "deadline": "2026-02-15T17:00:00",
    "status": "DRAFT",
    "initiatorType": "SELF_REPRESENTED",
    "initiatorFirstName": "Sarah",
    "initiatorLastName": "Anderson",
    "recipients": [{
      "recipientName": "John Doe",
      "recipientAddress": "123 Main St",
      "recipientZipCode": "75201",
      "recipientEntityType": "INDIVIDUAL",
      "firstName": "John",
      "lastName": "Doe",
      "city": "Dallas",
      "state": "Texas",
      "recipientType": "AUTOMATED",
      "serviceType": "PROCESS_SERVICE",
      "processService": true
    }]
  }' | jq .
