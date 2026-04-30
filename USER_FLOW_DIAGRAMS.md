# FoodZero - User Flow Diagrams

## Overview
This document contains Mermaid diagrams for all user flows in the FoodZero platform.
You can render these diagrams using Mermaid Live Editor (https://mermaid.live) or any Mermaid-compatible tool.

---

## 1. Overall System Flow

```mermaid
graph TB
    Start([User Visits FoodZero]) --> Landing[Landing Page]
    Landing --> CheckAuth{Logged In?}
    CheckAuth -->|Yes| RoleCheck{User Role?}
    CheckAuth -->|No| Choice{Action?}
    
    Choice -->|Register| Register[Registration Page]
    Choice -->|Login| Login[Login Page]
    
    Register --> RoleSelect{Select Role}
    RoleSelect -->|Donor| DonorReg[Donor Registration]
    RoleSelect -->|NGO| NGOReg[NGO Registration]
    RoleSelect -->|Admin| AdminReg[Admin Registration]
    
    DonorReg --> Login
    NGOReg --> Login
    AdminReg --> Login
    
    Login --> RoleCheck
    
    RoleCheck -->|Donor| DonorDash[Donor Dashboard]
    RoleCheck -->|NGO| NGODash[NGO Dashboard]
    RoleCheck -->|Admin| AdminDash[Admin Dashboard]
    
    style Start fill:#e1f5e1
    style DonorDash fill:#a8d5ba
    style NGODash fill:#7fb3d5
    style AdminDash fill:#c9a0dc
```

---

## 2. Donor Complete Flow

```mermaid
graph TB
    DonorStart([Donor Logs In]) --> DonorDash[Donor Dashboard]
    DonorDash --> CheckVerif{Verified?}
    
    CheckVerif -->|No| VerifBanner[Verification Banner Shown]
    VerifBanner --> StartVerif[Start Verification]

    
    StartVerif --> Step1[Step 1: Basic Details]
    Step1 --> Phone[Enter Phone & Address]
    Phone --> Step2[Step 2: Phone Verification]
    Step2 --> OTP[Send & Verify OTP]
    OTP --> Step3[Step 3: Email Verification]
    Step3 --> EmailToken[Send & Verify Email]
    EmailToken --> Step4[Step 4: Location]
    Step4 --> GPS[Allow GPS Access]
    GPS --> Level1Done[Level 1 Complete]
    
    Level1Done --> OptionalL2{Upload Documents?}
    OptionalL2 -->|Yes| Level2[Level 2 Verification]
    OptionalL2 -->|No| VerifiedDonor[Verified Donor]
    Level2 --> AdminReview[Admin Reviews Docs]
    AdminReview --> VerifiedDonor
    
    CheckVerif -->|Yes| VerifiedDonor
    VerifiedDonor --> DonorActions{Choose Action}
    
    DonorActions -->|Donate| DonatePage[Donate Food Page]
    DonorActions -->|Track| TrackPage[Tracking Page]
    DonorActions -->|View Stats| ViewStats[View Impact Stats]
    
    DonatePage --> FillForm[Fill Donation Form]
    FillForm --> FormDetails[Food Type, Quantity, Location, etc.]
    FormDetails --> Submit[Submit Donation]
    Submit --> NotifyNGOs[Notify All NGOs via Socket.io]
    NotifyNGOs --> WaitAccept[Wait for NGO to Accept]
    
    WaitAccept --> TrackPage
    TrackPage --> ViewStatus[View Status Timeline]
    ViewStatus --> StatusCheck{Status?}
    StatusCheck -->|Pending| Pending[Waiting for NGO]
    StatusCheck -->|Accepted| Accepted[NGO Accepted]
    StatusCheck -->|Picked Up| PickedUp[Food Collected]
    StatusCheck -->|In Transit| Transit[On the Way]
    StatusCheck -->|Delivered| Delivered[Successfully Delivered]
    
    Delivered --> ViewImpact[View Impact Metrics]
    ViewImpact --> MealsServed[Meals Served Count]
    ViewImpact --> WasteDiverted[Waste Diverted in kg]
    
    style DonorStart fill:#e1f5e1
    style VerifiedDonor fill:#a8d5ba
    style Delivered fill:#4caf50
```

---

## 3. NGO Complete Flow

```mermaid
graph TB
    NGOStart([NGO Logs In]) --> NGODash[NGO Dashboard]
    NGODash --> CheckNGOVerif{Verified?}
    
    CheckNGOVerif -->|No| VerifForm[Verification Form Shown]
    VerifForm --> FillDetails[Fill NGO Details]
    FillDetails --> RegDetails[Registration Number, Type, Address]
    RegDetails --> ContactInfo[Contact Person, Phone]
    ContactInfo --> OptionalDocs[GST, PAN, Website]
    OptionalDocs --> SubmitNGO[Submit for Verification]
    SubmitNGO --> AdminQueue[Admin Review Queue]
    AdminQueue --> AdminDecision{Admin Decision}
    
    AdminDecision -->|Approved| VerifiedNGO[Verified NGO]
    AdminDecision -->|Rejected| Rejected[Rejected - Resubmit]
    Rejected --> VerifForm
    
    CheckNGOVerif -->|Yes| VerifiedNGO
    VerifiedNGO --> NGOActions{Choose Action}
    
    NGOActions -->|View Requests| RequestsPage[Requests Page]
    NGOActions -->|Dashboard| ViewNearby[View Nearby Donations]
    NGOActions -->|My Accepted| MyAccepted[My Accepted Donations]
    
    RequestsPage --> Tabs{Select Tab}
    Tabs -->|Available| AvailableTab[Available Requests]
    Tabs -->|Accepted| AcceptedTab[My Accepted]
    
    AvailableTab --> BrowseDonations[Browse Available Donations]
    BrowseDonations --> ViewDetails[View Donation Details]
    ViewDetails --> DonationInfo[Food Type, Quantity, Distance]
    DonationInfo --> DonorInfo[Donor Contact & Address]
    DonorInfo --> AcceptBtn[Click Accept Donation]
    AcceptBtn --> DonationAccepted[Donation Accepted]
    
    DonationAccepted --> AcceptedTab
    AcceptedTab --> ManageDonation[Manage Accepted Donation]
    ManageDonation --> ViewMap[View Pickup Location on Map]
    ViewMap --> UpdateStatus{Update Status}
    
    UpdateStatus -->|Picked Up| MarkPickedUp[Mark as Picked Up]
    UpdateStatus -->|In Transit| MarkTransit[Mark In Transit]
    UpdateStatus -->|Delivered| MarkDelivered[Mark as Delivered]
    
    MarkPickedUp --> CaptureLocation1[Capture GPS Location]
    MarkTransit --> CaptureLocation2[Capture GPS Location]
    MarkDelivered --> CaptureLocation3[Capture GPS Location]
    
    CaptureLocation3 --> FeedbackPrompt[Feedback Prompt]
    FeedbackPrompt --> SubmitFeedback[Submit Feedback]
    SubmitFeedback --> UploadPhotos[Upload Food Photos]
    UploadPhotos --> Rating[Rate Donation 1-5 Stars]
    Rating --> Comments[Add Comments]
    Comments --> RecipientCount[Enter Recipient Count]
    RecipientCount --> FeedbackComplete[Feedback Submitted]
    
    FeedbackComplete --> ImpactMetrics[View Impact Metrics]
    ImpactMetrics --> TotalMeals[Total Meals Saved]
    ImpactMetrics --> TotalWaste[Total Waste Diverted]
    
    style NGOStart fill:#e3f2fd
    style VerifiedNGO fill:#7fb3d5
    style FeedbackComplete fill:#2196f3
```


---

## 4. Admin Complete Flow

```mermaid
graph TB
    AdminStart([Admin Logs In]) --> AdminDash[Admin Dashboard]
    AdminDash --> ViewOverview[View System Overview]
    ViewOverview --> SystemStats[System Statistics]
    SystemStats --> TotalUsers[Total Users]
    SystemStats --> TotalDonations[Total Donations]
    SystemStats --> TotalNGOs[Total NGOs]
    SystemStats --> ActivePickups[Active Pickups]
    
    AdminDash --> ImpactSection[Impact Metrics Section]
    ImpactSection --> MealsSaved[Meals Saved Calculation]
    ImpactSection --> WasteDiverted[Waste Diverted in kg]
    ImpactSection --> CO2Saved[CO₂ Emissions Saved]
    
    AdminDash --> Charts[Analytics Charts]
    Charts --> DonationsChart[Donations Per Day Chart]
    Charts --> NGOPerformance[NGO Performance Chart]
    
    AdminDash --> AdminActions{Choose Action}
    
    AdminActions -->|Users| UsersPage[Users Management]
    AdminActions -->|Donations| DonationsPage[Donations Management]
    AdminActions -->|Verify Donors| VerifyDonors[Verify Donors Page]
    AdminActions -->|Verify NGOs| VerifyNGOs[Verify NGOs Page]
    
    UsersPage --> UserList[View All Users]
    UserList --> FilterRole[Filter by Role]
    FilterRole --> UserActions{User Action}
    UserActions -->|View| ViewUser[View User Details]
    UserActions -->|Delete| DeleteUser[Delete User]
    
    DonationsPage --> DonationList[View All Donations]
    DonationList --> FilterStatus[Filter by Status]
    FilterStatus --> DonationActions{Donation Action}
    DonationActions -->|View| ViewDonation[View Details]
    DonationActions -->|Update| UpdateDonation[Update Status]
    
    VerifyDonors --> DonorQueue[Donor Verification Queue]
    DonorQueue --> ReviewDonor[Review Donor Documents]
    ReviewDonor --> DonorDocs[View Uploaded Documents]
    DonorDocs --> DonorDecision{Decision}
    DonorDecision -->|Approve| ApproveDonor[Approve Donor]
    DonorDecision -->|Reject| RejectDonor[Reject with Reason]
    
    VerifyNGOs --> NGOQueue[NGO Verification Queue]
    NGOQueue --> ReviewNGO[Review NGO Details]
    ReviewNGO --> NGODetails[Registration Number, Type, Address]
    NGODetails --> VerifyDocs[Verify Documents]
    VerifyDocs --> NGODecision{Decision}
    NGODecision -->|Approve| ApproveNGO[Approve NGO]
    NGODecision -->|Reject| RejectNGO[Reject with Reason]
    
    ApproveNGO --> NotifyNGO[Notify NGO via Email]
    RejectNGO --> NotifyRejection[Notify with Reason]
    ApproveDonor --> NotifyDonor[Notify Donor]
    RejectDonor --> NotifyDonorRej[Notify Donor]
    
    AdminDash --> LiveFeed[Live Activity Feed]
    LiveFeed --> RealtimeUpdates[Real-time System Updates]
    
    style AdminStart fill:#f3e5f5
    style AdminDash fill:#c9a0dc
    style ApproveNGO fill:#9c27b0
    style ApproveDonor fill:#9c27b0
```

---

## 5. Donation Lifecycle Flow

```mermaid
graph LR
    Create([Donor Creates Donation]) --> Pending[Status: PENDING]
    Pending --> Notify[Notify All NGOs]
    Notify --> NGOSees[NGOs See Donation]
    NGOSees --> NGOAccepts{NGO Accepts?}
    
    NGOAccepts -->|Yes| Accepted[Status: ACCEPTED]
    NGOAccepts -->|No| Pending
    
    Accepted --> NGOPickup[NGO Goes to Pickup]
    NGOPickup --> PickedUp[Status: PICKED_UP]
    PickedUp --> InTransit[Status: IN_TRANSIT]
    InTransit --> Delivered[Status: DELIVERED]
    
    Delivered --> Feedback[NGO Submits Feedback]
    Feedback --> Complete([Donation Complete])
    
    style Create fill:#e1f5e1
    style Pending fill:#fff9c4
    style Accepted fill:#b3e5fc
    style PickedUp fill:#ce93d8
    style InTransit fill:#90caf9
    style Delivered fill:#a5d6a7
    style Complete fill:#4caf50
```

---

## 6. Verification Flow - Donors

```mermaid
graph TB
    Start([Donor Registers]) --> Dashboard[Login to Dashboard]
    Dashboard --> VerifCheck{Verified?}
    
    VerifCheck -->|No| ShowBanner[Show Verification Banner]
    ShowBanner --> VerifProgress[Show Progress: 0/4]
    
    VerifProgress --> Step1Start[Step 1: Basic Details]
    Step1Start --> EnterPhone[Enter Phone Number]
    EnterPhone --> EnterAddress[Enter Full Address]
    EnterAddress --> SelectType[Select Donor Type]
    SelectType --> RequestLocation[Request GPS Location]
    RequestLocation --> LocationGranted{Location Granted?}
    
    LocationGranted -->|Yes| SaveDetails[Save Details]
    LocationGranted -->|No| LocationError[Show Error]
    LocationError --> RequestLocation
    
    SaveDetails --> Progress1[Progress: 1/4]
    Progress1 --> Step2Start[Step 2: Phone Verification]
    
    Step2Start --> SendOTP[Send OTP to Phone]
    SendOTP --> EnterOTP[User Enters OTP]
    EnterOTP --> VerifyOTP{OTP Valid?}
    
    VerifyOTP -->|Yes| PhoneVerified[Phone Verified ✓]
    VerifyOTP -->|No| OTPError[Invalid OTP]
    OTPError --> EnterOTP
    
    PhoneVerified --> Progress2[Progress: 2/4]
    Progress2 --> Step3Start[Step 3: Email Verification]
    
    Step3Start --> SendEmail[Send Verification Email]
    SendEmail --> ClickLink[User Clicks Link/Enters Token]
    ClickLink --> VerifyEmail{Token Valid?}
    
    VerifyEmail -->|Yes| EmailVerified[Email Verified ✓]
    VerifyEmail -->|No| EmailError[Invalid Token]
    EmailError --> SendEmail
    
    EmailVerified --> Progress3[Progress: 3/4]
    Progress3 --> Step4Start[Step 4: Location Verification]
    
    Step4Start --> RequestGPS[Request GPS Access]
    RequestGPS --> CaptureGPS{GPS Captured?}
    
    CaptureGPS -->|Yes| LocationVerified[Location Verified ✓]
    CaptureGPS -->|No| GPSError[GPS Error]
    GPSError --> RequestGPS
    
    LocationVerified --> Progress4[Progress: 4/4]
    Progress4 --> Level1Complete[Level 1 Complete]
    
    Level1Complete --> OptionalL2{Upload Documents?}
    OptionalL2 -->|Yes| UploadDocs[Upload Govt ID]
    OptionalL2 -->|No| BasicVerified[Basic Verification Complete]
    
    UploadDocs --> AdminReview[Admin Reviews]
    AdminReview --> AdminApproves{Approved?}
    AdminApproves -->|Yes| FullyVerified[Fully Verified ✓✓]
    AdminApproves -->|No| DocsRejected[Documents Rejected]
    DocsRejected --> UploadDocs
    
    VerifCheck -->|Yes| CanDonate[Can Create Donations]
    BasicVerified --> CanDonate
    FullyVerified --> PremiumFeatures[Access Premium Features]
    
    style Start fill:#e1f5e1
    style Level1Complete fill:#a8d5ba
    style FullyVerified fill:#4caf50
```


---

## 7. Verification Flow - NGOs

```mermaid
graph TB
    NGOStart([NGO Registers]) --> NGOLogin[Login to Dashboard]
    NGOLogin --> NGOVerifCheck{Verified?}
    
    NGOVerifCheck -->|No| ShowForm[Show Verification Form]
    ShowForm --> FillForm[Fill NGO Details]
    
    FillForm --> RegNumber[Registration Number]
    RegNumber --> RegType[Registration Type]
    RegType --> RegAddress[Registered Address]
    RegAddress --> CityState[City & State]
    CityState --> ContactPerson[Contact Person Name]
    ContactPerson --> ContactPhone[Contact Phone]
    ContactPhone --> OptionalFields[Optional: GST, PAN, Website]
    
    OptionalFields --> SubmitForm[Submit for Verification]
    SubmitForm --> PendingStatus[Status: PENDING]
    PendingStatus --> AdminQueue[Admin Review Queue]
    
    AdminQueue --> AdminReviews[Admin Reviews Details]
    AdminReviews --> VerifyReg[Verify Registration Number]
    VerifyReg --> CheckDocs[Check Documents]
    CheckDocs --> AdminDecision{Admin Decision}
    
    AdminDecision -->|Approve| ApproveNGO[Approve NGO]
    AdminDecision -->|Reject| RejectNGO[Reject with Reason]
    
    ApproveNGO --> VerifiedStatus[Status: VERIFIED]
    RejectNGO --> RejectedStatus[Status: REJECTED]
    
    VerifiedStatus --> NotifyApproval[Email Notification Sent]
    RejectedStatus --> NotifyRejection[Email with Reason Sent]
    
    NotifyApproval --> NGOVerified[NGO Verified ✓]
    NotifyRejection --> CanResubmit[Can Resubmit]
    CanResubmit --> ShowForm
    
    NGOVerifCheck -->|Yes| NGOVerified
    NGOVerified --> UnlockFeatures[Unlock All Features]
    UnlockFeatures --> CanAccept[Can Accept Donations]
    UnlockFeatures --> CanTrack[Can Track Pickups]
    UnlockFeatures --> CanFeedback[Can Submit Feedback]
    
    PendingStatus --> CannotAccept[Cannot Accept Donations]
    RejectedStatus --> CannotAccept
    
    style NGOStart fill:#e3f2fd
    style NGOVerified fill:#2196f3
    style CannotAccept fill:#ffcdd2
```

---

## 8. Real-Time Notification Flow

```mermaid
sequenceDiagram
    participant Donor
    participant Backend
    participant SocketIO
    participant NGO1
    participant NGO2
    participant NGO3
    
    Donor->>Backend: Create Donation
    Backend->>Backend: Save to Database
    Backend->>SocketIO: Emit 'newDonation' Event
    
    SocketIO->>NGO1: Notify New Donation
    SocketIO->>NGO2: Notify New Donation
    SocketIO->>NGO3: Notify New Donation
    
    Backend->>Donor: Success Response
    Donor->>Donor: Redirect to Tracking
    
    NGO1->>NGO1: See Notification Bell
    NGO2->>NGO2: See Notification Bell
    
    NGO1->>Backend: Accept Donation
    Backend->>Backend: Update Status
    Backend->>SocketIO: Emit 'donationAccepted'
    
    SocketIO->>Donor: Notify Acceptance
    SocketIO->>NGO2: Donation No Longer Available
    SocketIO->>NGO3: Donation No Longer Available
    
    Donor->>Donor: See NGO Details
    
    NGO1->>Backend: Update Status: Picked Up
    Backend->>SocketIO: Emit 'statusUpdate'
    SocketIO->>Donor: Notify Status Change
    
    NGO1->>Backend: Update Status: In Transit
    Backend->>SocketIO: Emit 'statusUpdate'
    SocketIO->>Donor: Notify Status Change
    
    NGO1->>Backend: Update Status: Delivered
    Backend->>SocketIO: Emit 'statusUpdate'
    SocketIO->>Donor: Notify Delivery Complete
    
    NGO1->>Backend: Submit Feedback
    Backend->>Donor: Feedback Available
```

---

## 9. Impact Metrics Calculation Flow

```mermaid
graph TB
    Start([Donation Delivered]) --> GetQuantity[Get Quantity & Unit]
    GetQuantity --> ParseUnit{Parse Unit}
    
    ParseUnit -->|kg| CalcKg1[Quantity in kg]
    ParseUnit -->|grams| CalcKg2[Quantity ÷ 1000]
    ParseUnit -->|plates| CalcKg3[Quantity × 0.4 kg]
    ParseUnit -->|servings| CalcKg4[Quantity × 0.4 kg]
    ParseUnit -->|liters| CalcKg5[Quantity × 1 kg]
    ParseUnit -->|pieces| CalcKg6[Quantity × 0.15 kg]
    ParseUnit -->|boxes| CalcKg7[Quantity × 2 kg]
    ParseUnit -->|bags| CalcKg8[Quantity × 1.5 kg]
    
    CalcKg1 --> TotalKg[Total Weight in kg]
    CalcKg2 --> TotalKg
    CalcKg3 --> TotalKg
    CalcKg4 --> TotalKg
    CalcKg5 --> TotalKg
    CalcKg6 --> TotalKg
    CalcKg7 --> TotalKg
    CalcKg8 --> TotalKg
    
    TotalKg --> WasteDiverted[Waste Diverted Metric]
    
    ParseUnit -->|kg| Meals1[Quantity ÷ 0.1 = Meals]
    ParseUnit -->|grams| Meals2[Quantity ÷ 100 = Meals]
    ParseUnit -->|plates| Meals3[Quantity = Meals]
    ParseUnit -->|servings| Meals4[Quantity = Meals]
    ParseUnit -->|liters| Meals5[Quantity × 4 = Meals]
    ParseUnit -->|pieces| Meals6[Quantity × 0.5 = Meals]
    ParseUnit -->|boxes| Meals7[Quantity × 5 = Meals]
    ParseUnit -->|bags| Meals8[Quantity × 3 = Meals]
    
    Meals1 --> TotalMeals[Total Meals Saved]
    Meals2 --> TotalMeals
    Meals3 --> TotalMeals
    Meals4 --> TotalMeals
    Meals5 --> TotalMeals
    Meals6 --> TotalMeals
    Meals7 --> TotalMeals
    Meals8 --> TotalMeals
    
    TotalKg --> CO2Calc[kg × 0.342 = CO₂ Saved]
    CO2Calc --> CO2Metric[CO₂ Emissions Saved]
    
    TotalMeals --> PeopleServed[Meals ÷ 3 = People Served]
    
    WasteDiverted --> Dashboard[Display on Dashboard]
    TotalMeals --> Dashboard
    CO2Metric --> Dashboard
    PeopleServed --> Dashboard
    
    style Start fill:#e1f5e1
    style Dashboard fill:#4caf50
```

---

## 10. Authentication & Authorization Flow

```mermaid
graph TB
    UserAccess([User Accesses Page]) --> CheckToken{Token Exists?}
    
    CheckToken -->|No| RedirectLogin[Redirect to Login]
    CheckToken -->|Yes| ValidateToken[Validate JWT Token]
    
    ValidateToken --> TokenValid{Token Valid?}
    TokenValid -->|No| RedirectLogin
    TokenValid -->|Yes| GetUserRole[Get User Role from Token]
    
    GetUserRole --> RoleCheck{User Role?}
    
    RoleCheck -->|Donor| CheckDonorPage{Accessing Donor Page?}
    RoleCheck -->|NGO| CheckNGOPage{Accessing NGO Page?}
    RoleCheck -->|Admin| CheckAdminPage{Accessing Admin Page?}
    
    CheckDonorPage -->|Yes| AllowAccess[Allow Access]
    CheckDonorPage -->|No| Forbidden[403 Forbidden]
    
    CheckNGOPage -->|Yes| CheckNGOVerif{NGO Verified?}
    CheckNGOPage -->|No| Forbidden
    
    CheckNGOVerif -->|Yes| AllowAccess
    CheckNGOVerif -->|No & Accepting| BlockAction[Block: Not Verified]
    CheckNGOVerif -->|No & Viewing| AllowAccess
    
    CheckAdminPage -->|Yes| AllowAccess
    CheckAdminPage -->|No| Forbidden
    
    AllowAccess --> LoadPage[Load Page Content]
    Forbidden --> Show403[Show 403 Error]
    BlockAction --> ShowMessage[Show Verification Required]
    
    RedirectLogin --> LoginPage[Login Page]
    LoginPage --> EnterCreds[Enter Credentials]
    EnterCreds --> Authenticate[Authenticate User]
    Authenticate --> AuthSuccess{Success?}
    
    AuthSuccess -->|Yes| GenerateToken[Generate JWT Token]
    AuthSuccess -->|No| ShowError[Show Error Message]
    
    GenerateToken --> StoreToken[Store in localStorage]
    StoreToken --> RoleRedirect[Redirect to Role Dashboard]
    
    ShowError --> LoginPage
    
    style AllowAccess fill:#a5d6a7
    style Forbidden fill:#ef5350
    style BlockAction fill:#ffa726
```


---

## 11. Simplified User Journey - Donor

```mermaid
journey
    title Donor Journey - From Registration to Impact
    section Registration
      Visit Website: 5: Donor
      Click Register: 5: Donor
      Fill Details: 4: Donor
      Select Role Donor: 5: Donor
    section Verification
      Login to Dashboard: 5: Donor
      See Verification Banner: 3: Donor
      Complete Phone Verification: 4: Donor
      Complete Email Verification: 4: Donor
      Allow Location Access: 4: Donor
      Verification Complete: 5: Donor
    section Donation
      Click Donate Food: 5: Donor
      Fill Donation Form: 4: Donor
      Enter Food Details: 4: Donor
      Submit Donation: 5: Donor
      NGOs Notified: 5: Donor, NGO
    section Tracking
      View Tracking Page: 5: Donor
      See Status Updates: 4: Donor
      NGO Accepts: 5: Donor, NGO
      Food Picked Up: 5: NGO
      Food Delivered: 5: NGO
    section Impact
      View Impact Metrics: 5: Donor
      See Meals Saved: 5: Donor
      See Waste Diverted: 5: Donor
      Feel Satisfied: 5: Donor
```

---

## 12. Simplified User Journey - NGO

```mermaid
journey
    title NGO Journey - From Registration to Feedback
    section Registration
      Visit Website: 5: NGO
      Click Join as NGO: 5: NGO
      Fill Registration: 4: NGO
      Submit Details: 4: NGO
    section Verification
      Login to Dashboard: 5: NGO
      See Pending Status: 3: NGO
      Fill Verification Form: 4: NGO
      Submit to Admin: 4: NGO
      Wait for Approval: 2: NGO
      Get Approved: 5: NGO, Admin
    section Accept Donation
      Receive Notification: 5: NGO
      View Available Donations: 5: NGO
      Check Distance: 4: NGO
      Accept Donation: 5: NGO
      Donor Notified: 5: NGO, Donor
    section Pickup & Delivery
      View Pickup Address: 5: NGO
      Navigate to Location: 4: NGO
      Mark as Picked Up: 5: NGO
      Transport Food: 4: NGO
      Mark In Transit: 4: NGO
      Deliver to Beneficiaries: 5: NGO
      Mark as Delivered: 5: NGO
    section Feedback
      Upload Photos: 4: NGO
      Rate Donation: 5: NGO
      Add Comments: 4: NGO
      Enter Recipient Count: 4: NGO
      Submit Feedback: 5: NGO
      View Impact: 5: NGO
```

---

## 13. Simplified User Journey - Admin

```mermaid
journey
    title Admin Journey - System Management
    section Login
      Access Admin Portal: 5: Admin
      Login with Credentials: 5: Admin
      View Dashboard: 5: Admin
    section Monitor System
      Check Total Users: 5: Admin
      Check Total Donations: 5: Admin
      View Active Pickups: 4: Admin
      Review Analytics Charts: 5: Admin
      Check Impact Metrics: 5: Admin
    section Verify NGOs
      Go to Verify NGOs: 5: Admin
      See Pending NGOs: 4: Admin
      Review NGO Details: 4: Admin
      Verify Registration: 4: Admin
      Approve NGO: 5: Admin
      NGO Notified: 5: Admin, NGO
    section Verify Donors
      Go to Verify Donors: 5: Admin
      See Pending Donors: 4: Admin
      Review Documents: 4: Admin
      Verify Identity: 4: Admin
      Approve Donor: 5: Admin
      Donor Notified: 5: Admin, Donor
    section Manage System
      View All Users: 5: Admin
      Manage Donations: 4: Admin
      Monitor Live Feed: 5: Admin
      Generate Reports: 4: Admin
```

---

## 14. Data Flow Architecture

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        Landing[Landing Page]
        DonorUI[Donor Interface]
        NGOUI[NGO Interface]
        AdminUI[Admin Interface]
    end
    
    subgraph "Backend - Node.js/Express"
        AuthAPI[Auth API]
        DonorAPI[Donor API]
        NGOAPI[NGO API]
        AdminAPI[Admin API]
        DonationAPI[Donation API]
    end
    
    subgraph "Real-Time Layer"
        SocketIO[Socket.IO Server]
        Events[Event Emitters]
    end
    
    subgraph "Database - MongoDB"
        Users[(Users Collection)]
        Donations[(Donations Collection)]
        Feedback[(Feedback Collection)]
        Tracking[(Tracking Collection)]
    end
    
    subgraph "External Services"
        Email[Email Service]
        SMS[SMS Service]
        Maps[Maps API]
    end
    
    Landing --> AuthAPI
    DonorUI --> DonorAPI
    DonorUI --> DonationAPI
    NGOUI --> NGOAPI
    NGOUI --> DonationAPI
    AdminUI --> AdminAPI
    
    AuthAPI --> Users
    DonorAPI --> Users
    DonorAPI --> Donations
    NGOAPI --> Users
    NGOAPI --> Donations
    NGOAPI --> Feedback
    AdminAPI --> Users
    AdminAPI --> Donations
    DonationAPI --> Donations
    DonationAPI --> Tracking
    
    DonationAPI --> SocketIO
    NGOAPI --> SocketIO
    SocketIO --> Events
    Events --> DonorUI
    Events --> NGOUI
    
    AuthAPI --> Email
    DonorAPI --> SMS
    DonorAPI --> Email
    NGOAPI --> Email
    AdminAPI --> Email
    
    DonorUI --> Maps
    NGOUI --> Maps
    
    style Frontend fill:#e1f5e1
    style Backend fill:#fff9c4
    style Database fill:#b3e5fc
    style External fill:#ffccbc
```

---

## 15. Status Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending: Donor Creates Donation
    
    Pending --> Accepted: NGO Accepts
    Pending --> Cancelled: Donor Cancels
    
    Accepted --> PickedUp: NGO Picks Up Food
    Accepted --> Cancelled: NGO Cancels
    
    PickedUp --> InTransit: NGO Starts Transport
    PickedUp --> Cancelled: Issue Occurred
    
    InTransit --> Delivered: NGO Delivers Food
    InTransit --> Cancelled: Issue Occurred
    
    Delivered --> FeedbackSubmitted: NGO Submits Feedback
    
    FeedbackSubmitted --> [*]: Complete
    Cancelled --> [*]: Ended
    
    note right of Pending
        All NGOs notified
        Visible to all verified NGOs
    end note
    
    note right of Accepted
        Assigned to specific NGO
        Donor can see NGO details
    end note
    
    note right of Delivered
        Impact metrics calculated
        Feedback requested
    end note
```

---

## How to Use These Diagrams

### For PowerPoint/Presentations:
1. Copy any diagram code
2. Go to https://mermaid.live
3. Paste the code
4. Export as PNG/SVG
5. Insert into your PPT

### For Documentation:
- These diagrams render automatically in GitHub, GitLab, and many markdown viewers
- Use in README files, documentation sites, or wikis

### Customization:
- Modify colors using `style` commands
- Add/remove nodes as needed
- Adjust flow direction (TB=top-bottom, LR=left-right)

---

## Summary of Diagrams

1. **Overall System Flow** - High-level system overview
2. **Donor Complete Flow** - Full donor journey with verification
3. **NGO Complete Flow** - Full NGO journey with verification
4. **Admin Complete Flow** - Admin management workflows
5. **Donation Lifecycle** - Status progression of donations
6. **Donor Verification Flow** - Detailed verification steps
7. **NGO Verification Flow** - NGO approval process
8. **Real-Time Notifications** - Socket.IO sequence diagram
9. **Impact Metrics Calculation** - How metrics are computed
10. **Authentication & Authorization** - Security flow
11. **Donor Journey** - User journey map
12. **NGO Journey** - User journey map
13. **Admin Journey** - User journey map
14. **Data Flow Architecture** - System architecture
15. **Status Transition** - State machine diagram

---

**Total Diagrams**: 15
**Diagram Types**: Flowcharts, Sequence Diagrams, Journey Maps, State Diagrams, Architecture Diagrams
**Ready for**: PowerPoint, Documentation, Presentations, Technical Specs
