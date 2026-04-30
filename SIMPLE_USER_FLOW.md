# FoodZero - Simple User Flow

## Block 1: Donor Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        DONOR FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. Register/Login
   └─> Create account as Donor
   
2. Complete Profile
   └─> Add contact details and address
   
3. Verification (Optional)
   └─> Submit verification documents
   └─> Wait for admin approval
   └─> Get verified badge
   
4. Create Donation
   └─> Enter food details (type, quantity, expiry)
   └─> Add pickup location
   └─> Submit donation
   
5. Track Donation
   └─> View donation status
   └─> See which NGO accepted
   └─> Get pickup confirmation
   └─> Receive completion notification

6. View Impact
   └─> See donation history
   └─> Track total impact metrics
```

---

## Block 2: Receiver Flow (NGO)

```
┌─────────────────────────────────────────────────────────────┐
│                      RECEIVER FLOW (NGO)                     │
└─────────────────────────────────────────────────────────────┘

1. Register/Login
   └─> Create account as NGO
   
2. Complete Profile
   └─> Add organization details
   └─> Add service areas
   
3. Verification (Required)
   └─> Submit NGO registration documents
   └─> Wait for admin verification
   └─> Get verified status
   
4. Browse Available Donations
   └─> View donations in service area
   └─> Filter by food type/quantity
   
5. Request Donation
   └─> Select donation
   └─> Submit request
   └─> Wait for donor confirmation
   
6. Pickup & Complete
   └─> Get pickup details
   └─> Collect food from donor
   └─> Mark as completed
   └─> Provide feedback (optional)

7. View Impact
   └─> See received donations history
   └─> Track beneficiaries served
```

---

## Block 3: Coordinating Flow (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATING FLOW (ADMIN)                 │
└─────────────────────────────────────────────────────────────┘

1. Login
   └─> Access admin dashboard
   
2. Monitor Platform
   └─> View real-time metrics
   └─> Track active donations
   └─> Monitor user activity
   
3. Verify Users
   ├─> Review donor verification requests
   │   └─> Approve/Reject with reason
   │
   └─> Review NGO verification requests
       └─> Approve/Reject with reason
   
4. Manage Donations
   └─> View all donations
   └─> Monitor donation status
   └─> Handle disputes (if any)
   
5. Manage Users
   └─> View all users (Donors/NGOs)
   └─> Suspend/Activate accounts
   └─> Handle user issues
   
6. Generate Reports
   └─> View impact metrics
   └─> Export donation data
   └─> Analyze platform performance
```

---

## Complete Flow Interaction

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  DONOR   │         │   ADMIN  │         │   NGO    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │ 1. Register        │                     │
     ├───────────────────>│                     │
     │                    │                     │
     │ 2. Verify (opt)    │                     │
     ├───────────────────>│                     │
     │                    │ 3. Approve          │
     │<───────────────────┤                     │
     │                    │                     │
     │                    │ 4. NGO Register     │
     │                    │<────────────────────┤
     │                    │                     │
     │                    │ 5. Verify NGO       │
     │                    │<────────────────────┤
     │                    │ 6. Approve          │
     │                    ├────────────────────>│
     │                    │                     │
     │ 7. Create Donation │                     │
     │────────────────────┼────────────────────>│
     │                    │                     │
     │                    │ 8. Request Donation │
     │<───────────────────┼─────────────────────┤
     │                    │                     │
     │ 9. Confirm         │                     │
     ├────────────────────┼────────────────────>│
     │                    │                     │
     │                    │ 10. Pickup & Complete│
     │<───────────────────┼─────────────────────┤
     │                    │                     │
     │ 11. Both see impact metrics             │
     │                    │                     │
     └────────────────────┴─────────────────────┘
```

---

## Key Touchpoints

1. **Donor → Admin**: Verification requests, issue reporting
2. **NGO → Admin**: Verification requests, issue reporting  
3. **Donor → NGO**: Donation offers, pickup coordination
4. **Admin → Both**: Verification approvals, account management, platform monitoring
