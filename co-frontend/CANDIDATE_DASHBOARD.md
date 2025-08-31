# Candidate Dashboard Documentation

## Overview

The Candidate Dashboard is a comprehensive interface for political candidates to manage their profile, participate in elections, and analyze their performance. It provides all the functionalities implemented in the backend candidate API endpoints.

## Features

### 1. Dashboard Overview
- **Verification Status**: Shows current verification status (pending, verified, rejected)
- **Elections Participated**: Total number of elections the candidate has registered for
- **Total Votes Received**: Aggregate votes across all elections
- **Quick Actions**: Direct access to register for new elections

### 2. Profile Management
- **View Profile**: Complete candidate information including personal details, party affiliation, and manifesto
- **Verification Badge**: Visual indicator of verification status
- **Contact Information**: Email and phone display
- **Party Affiliation**: Political party information
- **Manifesto**: Detailed candidate platform and policies

### 3. My Elections
- **Election History**: All elections the candidate has participated in
- **Vote Counts**: Number of votes received per election
- **Election Status**: Current status of each election (registration open, voting active, results announced)
- **Election Details**: Comprehensive information about each election
- **Contract Addresses**: Blockchain contract information for each election

### 4. Election Registration
- **Available Elections**: List of open elections for registration
- **Registration Process**: Streamlined registration for verified candidates
- **Blockchain Integration**: Connects with smart contracts for on-chain registration
- **Status Tracking**: Real-time updates on registration status

### 5. Analytics Dashboard
- **Performance Overview**: 
  - Total elections participated
  - Total votes received across all elections
  - Average votes per election
  - Best vote share percentage
- **Best Performance**: Highlights the election with the highest vote count
- **Recent Performance**: Timeline of recent election participation
- **Detailed Statistics**: Vote percentages, turnout rates, candidate rankings
- **Interactive Charts**: Visual representation of performance data

## Technical Implementation

### Backend Integration
- **Authentication**: JWT-based authentication with wallet signature verification
- **API Endpoints**: Full integration with all candidate-related endpoints:
  - `GET /candidate/profile/:walletAddress` - Fetch candidate profile
  - `POST /candidate/register-election` - Register for elections
  - `GET /election/available` - Get available elections
  - `GET /election/:contractAddress` - Get election details

### State Management
- **Zustand Store**: Centralized authentication state management
- **Local State**: Component-level state for UI interactions
- **Real-time Updates**: Automatic data refresh and status updates

### Security Features
- **Wallet Verification**: Ensures only verified wallet owners can access their profiles
- **Role-based Access**: Candidate-specific functionality and data access
- **Secure Registration**: Blockchain-based election registration with private key validation

## User Workflows

### Initial Setup
1. Candidate registers through registration page
2. Profile undergoes admin verification
3. Upon verification, full dashboard access is granted

### Election Participation
1. View available elections in "Register for Elections" tab
2. Register for desired elections (requires verification)
3. Track registration status and election progress
4. Monitor vote counts during and after elections

### Performance Analysis
1. Access analytics dashboard for comprehensive performance data
2. Review historical election results
3. Analyze vote patterns and trends
4. Use insights for future campaign planning

## Navigation Structure
```
Candidate Dashboard
├── Dashboard (Overview & Quick Stats)
├── Profile (Personal Information & Verification)
├── My Elections (Election History & Results)
├── Analytics (Performance Data & Insights)
└── Register for Elections (Available Elections)
```

## Security Considerations
- All API calls use JWT authentication
- Sensitive operations require additional verification
- Blockchain transactions use secure private key handling
- Data encryption for sensitive candidate information

## Future Enhancements
- Real-time vote count updates during active elections
- Campaign finance tracking and reporting
- Social media integration for campaign management
- Advanced analytics with predictive modeling
- Mobile-responsive design optimizations

## API Dependencies
The candidate dashboard integrates with the following backend services:
- Candidate Management Service
- Election Management Service
- Blockchain Service
- Authentication Service
- Notification Service (for real-time updates)

## Error Handling
- Graceful handling of network failures
- User-friendly error messages
- Automatic retry mechanisms for critical operations
- Fallback data display for offline scenarios

This comprehensive candidate dashboard ensures candidates have full control over their political participation while maintaining security and transparency throughout the election process.
