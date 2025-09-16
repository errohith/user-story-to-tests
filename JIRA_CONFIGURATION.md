# JIRA Integration Configuration Guide

## Overview
This guide will help you configure the JIRA integration for your User Story to Tests application. The integration allows you to:

- **Fetch JIRA stories** directly into your test generation form
- **Search JIRA stories** by title, description, project, or other criteria
- **Auto-populate** story title and acceptance criteria from JIRA
- **Link generated tests** back to JIRA stories as comments

## Prerequisites

### 1. JIRA Cloud Instance
- You need access to a JIRA Cloud instance (e.g., `your-company.atlassian.net`)
- You must have permission to read issues and add comments

### 2. JIRA API Token
- You need to generate an API token for authentication
- This is required for secure API access

## Step-by-Step Configuration

### Step 1: Generate JIRA API Token

1. **Log in to your JIRA Cloud instance**
   - Go to `https://your-company.atlassian.net`
   - Log in with your credentials

2. **Navigate to API Token Management**
   - Click on your profile avatar (top-right corner)
   - Select "Manage account"
   - Go to the "Security" tab
   - Click "Create and manage API tokens"

3. **Create a New API Token**
   - Click "Create API token"
   - Give it a descriptive label (e.g., "User Story to Tests Integration")
   - Click "Create"
   - **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

### Step 2: Set Environment Variables

Create or update your `.env` file in the **root directory** of your project (same level as `package.json`):

```bash
# JIRA Integration Configuration
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token-here

# Existing configuration (keep these as they are)
PORT=8081
CORS_ORIGIN=http://localhost:5173
groq_API_BASE=https://api.groq.com/openai/v1
groq_API_KEY=your-groq-api-key
groq_MODEL=llama-3.1-70b-versatile
```

#### Environment Variable Details:

- **`JIRA_BASE_URL`**: Your JIRA Cloud base URL (without `/rest/api/3`)
  - Example: `https://mycompany.atlassian.net`
  - Example: `https://acme-corp.atlassian.net`

- **`JIRA_USERNAME`**: Your JIRA account email address
  - Example: `john.doe@company.com`
  - This is the email you use to log into JIRA

- **`JIRA_API_TOKEN`**: The API token you generated in Step 1
  - Example: `ATBBt7Hk9G7lMn3Rs5Pq8Xy1Z`
  - Keep this secure and never commit it to version control

### Step 3: Test the Configuration

1. **Start your backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Test JIRA connection**
   - Open your browser and go to: `http://localhost:8081/api/jira/health`
   - You should see a JSON response like:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-09-15T10:30:00.000Z",
     "service": "JIRA integration"
   }
   ```

3. **If you get an error**, check:
   - ✅ Environment variables are set correctly
   - ✅ JIRA base URL is correct (no trailing slash)
   - ✅ Username (email) is correct
   - ✅ API token is valid and copied correctly
   - ✅ You have network access to your JIRA instance

### Step 4: Test Frontend Integration

1. **Start your frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test JIRA features**
   - Click "Browse JIRA" button
   - Try searching for stories
   - Select a story and verify it auto-populates the form
   - Generate tests and try linking them back to JIRA

## Troubleshooting

### Common Issues and Solutions

#### 1. "JIRA service not configured" Error
**Cause**: Environment variables are not set or not loaded correctly.

**Solution**:
- Verify `.env` file is in the root directory (same level as backend folder)
- Check that variable names match exactly (case-sensitive)
- Restart the backend server after changing environment variables

#### 2. "401 Unauthorized" Error
**Cause**: Invalid credentials.

**Solutions**:
- Verify your email address is correct
- Generate a new API token and update the `.env` file
- Ensure the API token is copied without extra spaces

#### 3. "403 Forbidden" Error
**Cause**: Insufficient permissions.

**Solutions**:
- Contact your JIRA administrator to ensure you have:
  - "Browse projects" permission
  - "Browse issues" permission
  - "Add comments" permission (for linking tests)

#### 4. "404 Resource not found" Error when fetching a story
**Cause**: Story doesn't exist or you don't have access.

**Solutions**:
- Verify the JIRA ID is correct (e.g., "PROJ-123")
- Ensure you have access to the project containing the story
- Check if the story was deleted or moved

#### 5. "Connection refused" Error
**Cause**: Network or URL issues.

**Solutions**:
- Verify the JIRA base URL is correct
- Ensure you can access JIRA from your network
- Check if your company uses a VPN or proxy

#### 6. Frontend shows "JIRA service unavailable"
**Cause**: Backend JIRA service is not working.

**Solutions**:
- Check backend logs for detailed error messages
- Verify backend is running on the correct port
- Test the health endpoint directly

## Security Best Practices

### 1. Environment Variables Security
- ✅ **Never commit** `.env` files to version control
- ✅ Add `.env` to your `.gitignore` file
- ✅ Use different API tokens for different environments (dev, staging, prod)

### 2. API Token Management
- ✅ **Rotate tokens regularly** (every 3-6 months)
- ✅ **Revoke unused tokens** from your JIRA account
- ✅ **Use descriptive labels** when creating tokens

### 3. Access Control
- ✅ **Request minimal permissions** needed for the integration
- ✅ **Monitor API usage** in JIRA audit logs
- ✅ **Use service accounts** for production deployments

## Available JIRA Features

### 1. Story Fetching
- **Endpoint**: `GET /api/jira/stories/:id`
- **Purpose**: Fetch individual story details
- **Auto-populates**: Story title and description/acceptance criteria

### 2. Story Search
- **Endpoint**: `POST /api/jira/search`
- **Features**:
  - Search by title/description keywords
  - Filter by project
  - Filter by issue type
  - Filter by status
  - Pagination support (up to 100 results)

### 3. Project Listing
- **Endpoint**: `GET /api/jira/projects`
- **Purpose**: Get available projects for search filtering

### 4. Test Linking
- **Endpoint**: `POST /api/jira/link`
- **Purpose**: Add generated tests as comments to JIRA stories
- **Supports**: Both Manual test cases and BDD scenarios

### 5. Health Check
- **Endpoint**: `GET /api/jira/health`
- **Purpose**: Verify JIRA integration is working

## Example Usage Workflow

1. **Search for Stories**
   - Click "Browse JIRA" button
   - Enter search terms or select a project
   - Click "Search"

2. **Select a Story**
   - Browse the search results
   - Click on the desired story
   - Form will auto-populate with story details

3. **Generate Tests**
   - Review/edit the auto-populated fields
   - Select test categories and formats
   - Click "Generate"

4. **Link Tests to JIRA**
   - After tests are generated, click "Link to [JIRA-ID]"
   - Tests will be added as a comment to the original JIRA story

## Need Help?

If you encounter issues not covered in this guide:

1. **Check the backend logs** for detailed error messages
2. **Test the health endpoint** to verify connectivity
3. **Verify your JIRA permissions** with your administrator
4. **Try accessing JIRA manually** with the same credentials

## Configuration Examples

### Development Environment
```bash
JIRA_BASE_URL=https://dev-company.atlassian.net
JIRA_USERNAME=developer@company.com
JIRA_API_TOKEN=ATBBt7Hk9G7lMn3Rs5Pq8Xy1Z
```

### Production Environment
```bash
JIRA_BASE_URL=https://company.atlassian.net
JIRA_USERNAME=testservice@company.com
JIRA_API_TOKEN=ATCCx9Jm2F4nOp6Qs8Rv5Yz2A
```

Remember to use different API tokens for different environments and consider using dedicated service accounts for production use.