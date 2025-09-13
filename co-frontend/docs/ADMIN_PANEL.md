# Admin Panel Documentation

## Overview
The Admin Panel provides comprehensive management capabilities for the voting system, including voter verification, candidate approval, election creation and monitoring, and system administration.

## Features

### 1. Dashboard
- **System Overview**: Real-time statistics of voters, candidates, and elections
- **Quick Actions**: Shortcuts to common administrative tasks
- **Recent Elections**: Overview of recently created elections
- **Navigation**: Easy access to all admin functions

### 2. Voter Management
- **View All Voters**: Paginated list of all registered voters
- **Search & Filter**: Find voters by name, email, or voter ID
- **Verification**: Approve or reject voter registrations
- **Status Tracking**: Monitor verification status (pending, verified, rejected)
- **Profile Details**: View complete voter information including wallet address

### 3. Candidate Management
- **View All Candidates**: Paginated list of all registered candidates
- **Search & Filter**: Find candidates by name, party, or candidate ID
- **Verification**: Approve or reject candidate registrations
- **Profile Details**: View manifesto, party affiliation, and contact information
- **Election History**: Track candidate participation across elections

### 4. Election Management
- **Create Elections**: Deploy new election contracts on blockchain
- **Monitor Elections**: Track all elections with real-time status
- **Election Analytics**: Detailed voting statistics and demographics
- **Emergency Controls**: Emergency stop functionality for active elections
- **Results Management**: Announce and finalize election results
- **Filter & Search**: Find elections by status, type, or title

### 5. System Status
- **Blockchain Status**: Monitor network connectivity and block height
- **System Health**: Overall system statistics and performance
- **Network Information**: RPC endpoints and network details

## User Flow

### Admin Login
1. Navigate to `/admin/login`
2. Enter admin credentials (email/password)
3. Receive JWT token for authenticated requests
4. Redirect to admin dashboard

### Voter Verification Process
1. Go to "Voters" tab
2. Review pending voter applications
3. Check voter documents and information
4. Click "Verify" to approve or "Reject" to deny
5. Voter receives verification status update

### Candidate Verification Process
1. Go to "Candidates" tab
2. Review candidate applications
3. Check manifesto, party affiliation, and background
4. Click "Verify" to approve or "Reject" to deny
5. Candidate can now register for elections

### Election Creation
1. Go to "Elections" tab
2. Click "Create New Election"
3. Fill out election details:
   - Title and description
   - Election type (presidential, parliamentary, etc.)
   - Timing (registration and voting periods)
   - Maximum candidates allowed
   - Admin private key for deployment
4. Deploy smart contract to blockchain
5. Election becomes available for candidate registration

### Election Monitoring
1. View all elections in the Elections tab
2. Click "View" to see detailed analytics
3. Monitor vote counts and turnout in real-time
4. Use "Emergency Stop" if issues detected
5. Announce results when voting period ends

## API Integration

### Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints Used
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/voters` - List voters with pagination
- `PUT /admin/voters/:id/verify` - Verify/reject voter
- `GET /admin/candidates` - List candidates
- `PUT /admin/candidates/:id/verify` - Verify/reject candidate
- `POST /election/create` - Create new election
- `GET /election` - List all elections
- `GET /admin/elections/:address/analytics` - Election analytics
- `POST /election/:address/emergency-stop` - Emergency stop
- `POST /election/:address/announce-results` - Announce results

### Error Handling
- Network errors are caught and displayed to user
- Validation errors show specific field issues
- Loading states prevent duplicate submissions
- Success messages confirm completed actions

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (super_admin, election_admin)
- Automatic token refresh

### Blockchain Security
- Private key validation before contract deployment
- Transaction confirmation before state updates
- Emergency stop functionality for critical issues

### Data Protection
- Sensitive data (private keys) not stored
- Input validation on all forms
- XSS protection through proper escaping

## Technical Implementation

### Frontend Framework
- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Axios for API communication

### Component Architecture
- Modular components for each admin function
- Reusable UI components (modals, forms, tables)
- Responsive design for mobile/desktop

### State Management
- Global auth state with Zustand
- Local component state for forms and data
- API response caching where appropriate

## Troubleshooting

### Common Issues
1. **Token Expired**: Re-login to get new token
2. **Network Errors**: Check backend connectivity
3. **Transaction Failures**: Verify private key and gas fees
4. **Verification Errors**: Check required fields and validation

### Support Features
- Detailed error messages
- Loading indicators for async operations
- Confirmation dialogs for destructive actions
- Breadcrumb navigation for context

## Future Enhancements
- Bulk operations for voter/candidate verification
- Advanced analytics and reporting
- Email notifications for status changes
- Audit trail for all admin actions
- Multi-signature support for critical operations
