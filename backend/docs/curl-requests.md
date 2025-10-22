# Comprehensive cURL Requests Reference

Set a base URL variable (adjust port if different):

```bash
BASE_URL="http://localhost:5000"
TOKEN="<JWT_TOKEN_AFTER_LOGIN>"
```

Use the token (if required) by adding: `-H "Authorization: Bearer $TOKEN"`

Placeholders you MUST replace:
- <JWT_TOKEN_AFTER_LOGIN>
- <ADMIN_WALLET_PRIVATE_KEY>
- <USER_WALLET_PRIVATE_KEY>
- <ADMIN_WALLET_ADDRESS>
- <VOTER_WALLET_ADDRESS>
- <CANDIDATE_WALLET_ADDRESS>
- <VOTER_ID>
- <CANDIDATE_ID>
- <CONTRACT_ADDRESS>
- <TX_HASH>
- <ELECTION_CONTRACT_ADDRESS>
- <CANDIDATE_ONCHAIN_NUM_ID>

---
## Health Check
GET /health
```bash
curl -X GET "$BASE_URL/health"
```

---
## Admin Endpoints (/api/admin)

### Register Admin
POST /api/admin/register
```bash
curl -X POST "$BASE_URL/api/admin/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Admin",
    "email": "admin@example.com",
    "walletAddress": "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "password": "StrongPass123!",
    "role": "super_admin"
  }'
```

### Login Admin
POST /api/admin/login
```bash
curl -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "StrongPass123!"
  }'
```

### Dashboard Stats (Auth)
GET /api/admin/dashboard
```bash
curl -X GET "$BASE_URL/api/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

### List Voters (Auth)
GET /api/admin/voters?status=verified&page=1&limit=20&search=
```bash
curl -X GET "$BASE_URL/api/admin/voters?status=verified&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Verify / Reject Voter (Auth)
PUT /api/admin/voters/:voterId/verify
```bash
curl -X PUT "$BASE_URL/api/admin/voters/<VOTER_ID>/verify" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "verified",
    "reason": "All documents valid"
  }'
```

### List Candidates (Auth)
GET /api/admin/candidates?status=verified&page=1&limit=20&search=
```bash
curl -X GET "$BASE_URL/api/admin/candidates?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Verify / Reject Candidate (Auth)
PUT /api/admin/candidates/:candidateId/verify
```bash
curl -X PUT "$BASE_URL/api/admin/candidates/<CANDIDATE_ID>/verify" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "verified",
    "reason": "Background check passed"
  }'
```

### Election Analytics (Auth)
GET /api/admin/elections/:contractAddress/analytics
```bash
curl -X GET "$BASE_URL/api/admin/elections/<CONTRACT_ADDRESS>/analytics" \
  -H "Authorization: Bearer $TOKEN"
```

### How to Manage Election Status in Future
### For Admins:
# Update specific election status
```
curl -X PATCH "http://localhost:5001/api/election/CONTRACT_ADDRESS/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "registration_open"}'
```
# Batch update all created elections
``` 
curl -X POST "http://localhost:5001/api/election/fix-status"
```

### Example to set election status to 'voting_active'
```
curl -X PATCH "http://localhost:5001/api/election/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512/status" -H "Content-Type: application/json" -d '{"status": "voting_active"}'
```

### Fix Candidate IDs for an Election
```
curl -X POST "http://localhost:5001/api/election/0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e/fix-candidate-ids" \
  -H "Content-Type: application/json" \
  -s | jq

```

---
## Voter Endpoints (/api/voter)

### Register Voter
POST /api/voter/register
```bash
curl -X POST "$BASE_URL/api/voter/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Victor Voter",
    "age": 30,
    "gender": "Male",
    "walletAddress": "0xVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
    "email": "voter@example.com"
  }'
```

### Voter Login (Signature-based)
POST /api/voter/login
```bash
curl -X POST "$BASE_URL/api/voter/login" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
    "signature": "<SIGNED_MESSAGE_SIGNATURE>",
    "message": "Login to Voting System at <timestamp>"
  }'
```

### Register Voter For Election (On-chain)
POST /api/voter/register-election
```bash
curl -X POST "$BASE_URL/api/voter/register-election" \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "<CONTRACT_ADDRESS>",
    "walletAddress": "0xVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
    "privateKey": "<USER_WALLET_PRIVATE_KEY>"
  }'
```

### Cast Vote
POST /api/voter/vote
```bash
curl -X POST "$BASE_URL/api/voter/vote" \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "<CONTRACT_ADDRESS>",
    "candidateId": 1,
    "privateKey": "<USER_WALLET_PRIVATE_KEY>"
  }'
```

### Get Voter Profile
GET /api/voter/profile/:walletAddress
```bash
curl -X GET "$BASE_URL/api/voter/profile/0xVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
```

### Get Elections For Voter
GET /api/voter/:walletAddress/elections
```bash
curl -X GET "$BASE_URL/api/voter/0xVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/elections"
```

---
## Candidate Endpoints (/api/candidate)

### Register Candidate
POST /api/candidate/register
```bash
curl -X POST "$BASE_URL/api/candidate/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carol Candidate",
    "party": "Unity",
    "manifesto": "Better future for all",
    "age": 45,
    "gender": "Female",
    "walletAddress": "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    "email": "candidate@example.com",
    "phone": "+1234567890"
  }'
```

### Candidate Login (Signature-based)
POST /api/candidate/login
```bash
curl -X POST "$BASE_URL/api/candidate/login" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    "signature": "<SIGNED_MESSAGE_SIGNATURE>",
    "message": "Login to Voting System at <timestamp>"
  }'
```

### Register Candidate For Election (On-chain)
POST /api/candidate/register-election
```bash
curl -X POST "$BASE_URL/api/candidate/register-election" \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "<CONTRACT_ADDRESS>",
    "walletAddress": "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    "privateKey": "<USER_WALLET_PRIVATE_KEY>"
  }'
```

### Get Candidate Profile
GET /api/candidate/profile/:walletAddress
```bash
curl -X GET "$BASE_URL/api/candidate/profile/0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"
```

### Get Candidates For Election
GET /api/candidate/election/:contractAddress
```bash
curl -X GET "$BASE_URL/api/candidate/election/<CONTRACT_ADDRESS>"
```

---
## Election Endpoints (/api/election)

### Create Election
POST /api/election/create
```bash
curl -X POST "$BASE_URL/api/election/create" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Election 2025",
    "description": "Nationwide general election",
    "electionType": "presidential",
    "adminPrivateKey": "<ADMIN_WALLET_PRIVATE_KEY>",
    "registrationStartTime": "2025-01-01T00:00:00Z",
    "registrationEndTime": "2025-01-05T00:00:00Z",
    "votingStartTime": "2025-01-06T00:00:00Z",
    "votingEndTime": "2025-01-07T00:00:00Z",
    "maxCandidates": 20
  }'
```

### Set Election Timing (also updates title/description optionally)
PUT /api/election/:contractAddress/timing
```bash
curl -X PUT "$BASE_URL/api/election/<CONTRACT_ADDRESS>/timing" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Election Title",
    "description": "Updated description",
    "startTimeFromNow": 600,
    "durationInSeconds": 3600,
    "adminPrivateKey": "<ADMIN_WALLET_PRIVATE_KEY>"
  }'
```

### Get Election Details
GET /api/election/:contractAddress
```bash
curl -X GET "$BASE_URL/api/election/<CONTRACT_ADDRESS>"
```

### List Elections (queryable)
GET /api/election/?status=created&electionType=presidential&search=
```bash
curl -X GET "$BASE_URL/api/election?status=created&limit=10&page=1"
```

### Emergency Stop Election
POST /api/election/:contractAddress/emergency-stop
```bash
curl -X POST "$BASE_URL/api/election/<CONTRACT_ADDRESS>/emergency-stop" \
  -H "Content-Type: application/json" \
  -d '{
    "adminPrivateKey": "<ADMIN_WALLET_PRIVATE_KEY>",
    "reason": "Detected anomaly"
  }'
```

### Announce Results
POST /api/election/:contractAddress/announce-results
```bash
curl -X POST "$BASE_URL/api/election/<CONTRACT_ADDRESS>/announce-results" \
  -H "Content-Type: application/json" \
  -d '{
    "adminPrivateKey": "<ADMIN_WALLET_PRIVATE_KEY>"
  }'
```

---
## Blockchain Utility Endpoints (/api/blockchain)

### Network Info
GET /api/blockchain/network-info
```bash
curl -X GET "$BASE_URL/api/blockchain/network-info"
```

### Transaction Receipt
GET /api/blockchain/transaction/:txHash
```bash
curl -X GET "$BASE_URL/api/blockchain/transaction/<TX_HASH>"
```

### Wallet Balance
GET /api/blockchain/balance/:address
```bash
curl -X GET "$BASE_URL/api/blockchain/balance/0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
```

### Contract Info
GET /api/blockchain/contract/:contractAddress
```bash
curl -X GET "$BASE_URL/api/blockchain/contract/<CONTRACT_ADDRESS>"
```

---
## Notes
1. JWT tokens are returned by admin /candidate /voter login endpoints. Store them in TOKEN for protected endpoints.
2. On-chain registration and actions require sufficient test ETH and correct private keys. NEVER commit real private keys.
3. candidateId in /vote refers to the numeric on-chain candidate index (as returned by contract), not the MongoDB _id.
4. Verification endpoints use the application-level voterId/candidateId (e.g., VOTER-ABC123) returned at registration.
5. Ensure your .env FRONTEND_URL and CORS settings allow your testing origin if testing from a browser.

End of file.
