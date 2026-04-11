import { TIME_MS } from '@/shared/constants/time';

export interface DocumentDetail {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Mock data for document details
export const MOCK_DOCUMENT_DETAILS: Record<string, DocumentDetail> = {
  '1-1-1': {
    id: '1-1-1',
    title: 'API Authentication Issue',
    content: `# API Authentication Issue

## Problem Description
The authentication token was expiring too quickly, causing users to be logged out unexpectedly.

## Root Cause
The JWT token expiration time was set to 15 minutes instead of 24 hours due to a configuration error.

## Solution
Updated the token expiration configuration in the backend:

\`\`\`javascript
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' } // Changed from '15m'
);
\`\`\`

## Testing
- Verified that users remain logged in for 24 hours
- Confirmed that refresh token mechanism works correctly
- Added monitoring for authentication failures

## References
- JWT Best Practices: https://jwt.io/introduction
- Team Wiki: Authentication Flow Documentation`,
    createdAt: new Date(2024, 0, 12),
    modifiedAt: new Date(Date.now() - TIME_MS.DAY),
  },
  '1-1-2': {
    id: '1-1-2',
    title: 'Database Schema Design',
    content: `# Database Schema Design

## Overview
Designing the database schema for the new user management system.

## Tables

### Users Table
- id (UUID, Primary Key)
- email (String, Unique)
- name (String)
- created_at (Timestamp)
- updated_at (Timestamp)

### Sessions Table
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → Users)
- token (String)
- expires_at (Timestamp)
- created_at (Timestamp)

## Relationships
- One User can have many Sessions (1:N)

## Indexes
- Users: email (unique index)
- Sessions: user_id, token

## Migration Strategy
1. Create new tables
2. Migrate existing user data
3. Update application code
4. Remove old tables`,
    createdAt: new Date(2024, 0, 14),
    modifiedAt: new Date(Date.now() - TIME_MS.HOUR * 2),
  },
  '1-2-1': {
    id: '1-2-1',
    title: 'React Best Practices 2024',
    content: `# React Best Practices 2024

## Component Organization
- Use functional components with hooks
- Keep components small and focused
- Extract custom hooks for reusable logic

## State Management
- Use Context API for global state
- Consider Zustand for simpler state management
- React Query for server state

## Performance
- Use React.memo for expensive components
- Implement code splitting with lazy loading
- Optimize re-renders with useMemo and useCallback

## TypeScript
- Always define prop types with interfaces
- Use strict mode
- Leverage type inference when possible

## Testing
- Write unit tests for utility functions
- Integration tests for components
- E2E tests for critical user flows`,
    createdAt: new Date(2024, 0, 10),
    modifiedAt: new Date(2024, 0, 15),
  },
  '2-1': {
    id: '2-1',
    title: 'TypeScript Migration Guide',
    content: `# TypeScript Migration Guide

## Overview
Step-by-step guide for migrating our codebase from JavaScript to TypeScript.

## Phase 1: Setup
1. Install TypeScript and type definitions
   \`\`\`bash
   npm install -D typescript @types/react @types/node
   \`\`\`
2. Create tsconfig.json
3. Rename files from .js to .ts/.tsx

## Phase 2: Basic Types
- Add type annotations to function parameters
- Define interfaces for props and state
- Use union types for complex scenarios

## Phase 3: Strict Mode
- Enable strict mode in tsconfig.json
- Fix all type errors
- Remove any usage of 'any' type

## Benefits
- Better IDE support and autocomplete
- Catch bugs at compile time
- Improved code documentation
- Easier refactoring

## Timeline
- Week 1-2: Setup and basic types
- Week 3-4: Convert all components
- Week 5: Enable strict mode
- Week 6: Code review and cleanup`,
    createdAt: new Date(2024, 0, 8),
    modifiedAt: new Date(Date.now() - TIME_MS.DAY * 3),
  },
  '2-2': {
    id: '2-2',
    title: 'Docker Deployment Steps',
    content: `# Docker Deployment Steps

## Prerequisites
- Docker installed
- Docker Compose installed
- Access to container registry

## Dockerfile
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## docker-compose.yml
\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
\`\`\`

## Deployment Steps
1. Build the image
   \`\`\`bash
   docker build -t myapp:latest .
   \`\`\`
2. Tag the image
3. Push to registry
4. Deploy to production
5. Verify deployment

## Troubleshooting
- Check logs: docker logs <container_id>
- Shell access: docker exec -it <container_id> sh
- Restart container: docker restart <container_id>`,
    createdAt: new Date(2024, 0, 5),
    modifiedAt: new Date(Date.now() - TIME_MS.WEEK),
  },
  '3-1': {
    id: '3-1',
    title: 'Git Rebase vs Merge',
    content: `# Git Rebase vs Merge

## Merge
Creates a merge commit that combines two branches.

### Pros
- Preserves complete history
- Non-destructive operation
- Safe for public branches

### Cons
- Can create complex history
- Many merge commits

### When to use
- Merging feature branches to main
- Public branches

## Rebase
Rewrites commit history by replaying commits on top of another branch.

### Pros
- Clean, linear history
- Easier to understand
- Better for code review

### Cons
- Rewrites history
- Can cause conflicts
- Dangerous for shared branches

### When to use
- Cleaning up local commits
- Before creating PR
- Updating feature branch with main

## Best Practices
1. Never rebase public branches
2. Use merge for main branch
3. Use rebase for feature branches
4. Always communicate with team

## Commands
\`\`\`bash
# Merge
git merge feature-branch

# Rebase
git rebase main
\`\`\``,
    createdAt: new Date(2024, 0, 1),
    modifiedAt: new Date(Date.now() - TIME_MS.WEEK * 2),
  },
  '3-2': {
    id: '3-2',
    title: 'Performance Optimization Checklist',
    content: `# Performance Optimization Checklist

## Frontend Optimization

### Images
- [ ] Use WebP format
- [ ] Implement lazy loading
- [ ] Add responsive images
- [ ] Compress images

### JavaScript
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Minification
- [ ] Remove unused code

### CSS
- [ ] Remove unused CSS
- [ ] Critical CSS inline
- [ ] Use CSS modules
- [ ] Minify CSS

## Backend Optimization

### Database
- [ ] Add proper indexes
- [ ] Query optimization
- [ ] Connection pooling
- [ ] Caching layer

### API
- [ ] Response compression
- [ ] API rate limiting
- [ ] Pagination
- [ ] Field filtering

## Monitoring
- [ ] Setup performance monitoring
- [ ] Track Core Web Vitals
- [ ] Monitor API response times
- [ ] Set up alerts

## Tools
- Lighthouse
- WebPageTest
- Chrome DevTools
- New Relic`,
    createdAt: new Date(2024, 0, 6),
    modifiedAt: new Date(Date.now() - TIME_MS.DAY * 5),
  },
  '4': {
    id: '4',
    title: 'Git Rebase vs Merge',
    content: `# Git Rebase vs Merge

## Merge
Creates a merge commit that combines two branches.

### Pros
- Preserves complete history
- Non-destructive operation
- Safe for public branches

### Cons
- Can create complex history
- Many merge commits

### When to use
- Merging feature branches to main
- Public branches

## Rebase
Rewrites commit history by replaying commits on top of another branch.

### Pros
- Clean, linear history
- Easier to understand
- Better for code review

### Cons
- Rewrites history
- Can cause conflicts
- Dangerous for shared branches

### When to use
- Cleaning up local commits
- Before creating PR
- Updating feature branch with main

## Best Practices
1. Never rebase public branches
2. Use merge for main branch
3. Use rebase for feature branches
4. Always communicate with team`,
    createdAt: new Date(2024, 0, 1),
    modifiedAt: new Date(Date.now() - TIME_MS.WEEK * 2),
  },
};
