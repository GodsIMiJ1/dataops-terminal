# R3B3L 4F Troubleshooting Guide

This guide helps you diagnose and resolve common issues with R3B3L 4F.

## Table of Contents

- [Connection Issues](#connection-issues)
- [API Key Problems](#api-key-problems)
- [Airlock Issues](#airlock-issues)
- [Command Execution Problems](#command-execution-problems)
- [UI and Display Issues](#ui-and-display-issues)
- [Performance Problems](#performance-problems)
- [Deployment Troubles](#deployment-troubles)
- [Persistence Issues](#persistence-issues)
- [Common Error Messages](#common-error-messages)

## Connection Issues

### Problem: Cannot connect to OpenAI API

**Symptoms:**
- Error message: "Could not connect to OpenAI API"
- Chat responses fail to load
- Fallback responses appear instead of AI responses

**Possible Causes:**
1. Internet connection is down
2. Airlock is active
3. OpenAI API is experiencing downtime
4. API key is invalid or expired

**Solutions:**
1. Check your internet connection
2. Deactivate the airlock with `!airlock off`
3. Verify OpenAI API status at [status.openai.com](https://status.openai.com)
4. Check your API key in the `.env` file
5. Regenerate your OpenAI API key if necessary

### Problem: CORS Errors

**Symptoms:**
- Console errors mentioning CORS policy
- API requests fail with CORS errors
- Features dependent on external APIs don't work

**Solutions:**
1. Ensure your server's CORS configuration includes your frontend domain
2. Use a CORS proxy for development (not recommended for production)
3. Check browser extensions that might interfere with CORS

## API Key Problems

### Problem: Invalid or Missing API Key

**Symptoms:**
- Error message: "OpenAI API key is not configured"
- Authentication errors in the console
- 401 Unauthorized responses from the API

**Solutions:**
1. Check that your `.env` file contains the `VITE_OPENAI_API_KEY` variable
2. Verify that the API key is correct and not expired
3. Regenerate your API key if necessary
4. Ensure the API key has the necessary permissions
5. Check for whitespace or special characters in the API key

### Problem: API Key Exposure

**Symptoms:**
- Unexpected API usage or billing
- Security alerts from OpenAI
- Unauthorized access to your account

**Solutions:**
1. Immediately revoke the exposed API key
2. Generate a new API key
3. Check your code for accidental key exposure
4. Ensure your `.env` file is in `.gitignore`
5. Consider using environment variables in your deployment platform

## Airlock Issues

### Problem: Airlock Won't Deactivate

**Symptoms:**
- Internet access remains blocked after `!airlock off`
- Error message: "Failed to deactivate airlock"
- External API calls continue to fail

**Solutions:**
1. Refresh the page to reset the airlock state
2. Check the browser console for errors
3. Verify that the AirlockService is properly initialized
4. Check for conflicts with browser extensions or security settings

### Problem: Airlock Status Inconsistency

**Symptoms:**
- Airlock indicator shows "OPEN" but internet access is still blocked
- Status inconsistency between UI and actual behavior

**Solutions:**
1. Toggle the airlock multiple times (`!airlock on` then `!airlock off`)
2. Refresh the page to reset the state
3. Check the browser console for errors in the airlock initialization

## Command Execution Problems

### Problem: Commands Not Executing

**Symptoms:**
- No response after entering commands
- Error message: "Command execution failed"
- Command appears to be ignored

**Solutions:**
1. Check that commands are prefixed with `!`
2. Verify command syntax and arguments
3. Check if the command requires the airlock to be deactivated
4. Ensure the command is supported in your deployment environment
5. Check browser console for JavaScript errors

### Problem: Dangerous Command Confirmation Issues

**Symptoms:**
- Confirmation prompt doesn't appear for dangerous commands
- Confirmation token doesn't work
- Command executes without confirmation

**Solutions:**
1. Check that the dangerous command detection is working
2. Verify that you're using the correct confirmation token
3. Ensure the confirmation system is properly initialized
4. Check for conflicts with browser extensions

## UI and Display Issues

### Problem: Broken Layout or Styling

**Symptoms:**
- Elements overlapping or misaligned
- Missing or incorrect styles
- Visual glitches or artifacts

**Solutions:**
1. Clear browser cache and reload
2. Check if all CSS files are loading correctly
3. Verify browser compatibility
4. Check for JavaScript errors in the console
5. Try a different browser to isolate the issue

### Problem: Text Rendering Issues

**Symptoms:**
- Glitch text effect not working
- Font rendering problems
- Text overflow or truncation

**Solutions:**
1. Ensure custom fonts are loading correctly
2. Check for CSS conflicts
3. Verify that the glitch effect components are properly initialized
4. Try disabling browser extensions that might interfere with rendering

## Performance Problems

### Problem: Slow Response Times

**Symptoms:**
- Long delays when sending messages
- UI feels sluggish
- High CPU or memory usage

**Solutions:**
1. Reduce the chat history length
2. Close unused browser tabs
3. Check for memory leaks in the browser console
4. Verify that you're not making too many API calls
5. Consider using a more powerful device

### Problem: High Resource Usage

**Symptoms:**
- Browser tab using excessive CPU or memory
- Device running hot
- Battery draining quickly

**Solutions:**
1. Reduce animation effects if possible
2. Close the application when not in use
3. Check for infinite loops or memory leaks
4. Consider using a more lightweight theme

## Deployment Troubles

### Problem: Netlify Deployment Fails

**Symptoms:**
- Build errors in Netlify logs
- Deployment completes but site doesn't work
- Environment variables not being applied

**Solutions:**
1. Check Netlify build logs for specific errors
2. Verify that all environment variables are set in Netlify dashboard
3. Ensure your build command and publish directory are correct
4. Check for dependencies that might not be compatible with Netlify

### Problem: Local Development Issues

**Symptoms:**
- Development server won't start
- Hot reloading not working
- Environment variables not being loaded

**Solutions:**
1. Check that Node.js version meets requirements (18.0.0+)
2. Verify that all dependencies are installed (`npm install`)
3. Ensure `.env` file is in the correct location
4. Check for errors in the terminal output

## Persistence Issues

### Problem: Supabase Connection Failures

**Symptoms:**
- Error message: "Failed to connect to Supabase"
- Chat history not saving
- Mission data not persisting

**Solutions:**
1. Check Supabase URL and anonymous key in `.env`
2. Verify that your Supabase project is active
3. Check if the required tables exist in your Supabase database
4. Ensure you have the correct permissions for the tables

### Problem: Local Storage Issues

**Symptoms:**
- Settings not saving between sessions
- Local data disappearing
- Storage quota exceeded errors

**Solutions:**
1. Check browser storage permissions
2. Clear some browser storage if quota is exceeded
3. Verify that localStorage is available in your browser
4. Check for errors in the storage operations

## Common Error Messages

### "Airlock is active. Internet access is disabled."

**Cause:** You're trying to access an external API while the airlock is active.

**Solution:** Deactivate the airlock with `!airlock off` command.

### "OpenAI API key is not configured."

**Cause:** The application cannot find a valid OpenAI API key.

**Solution:** Add your API key to the `.env` file as `VITE_OPENAI_API_KEY=your-key-here`.

### "API Error: 429 - Too Many Requests"

**Cause:** You've exceeded the rate limits for the OpenAI API.

**Solution:** Wait a few minutes before trying again or upgrade your OpenAI plan.

### "NetworkError when attempting to fetch resource."

**Cause:** Network request failed, possibly due to connection issues.

**Solution:** Check your internet connection, verify the URL, and ensure CORS is properly configured.

### "This command requires confirmation."

**Cause:** You're trying to execute a potentially dangerous command.

**Solution:** Use the provided confirmation token with the `!confirm` command.

### "Failed to execute command: Permission denied"

**Cause:** The command requires permissions that are not available.

**Solution:** Check if the command needs elevated privileges or if it's restricted in your environment.

## Diagnostic Tools

### Browser Console

Access the browser console (F12 or Ctrl+Shift+J) to check for JavaScript errors and network requests.

### Network Monitor

Use the Network tab in browser developer tools to inspect API calls and responses.

### Local Storage Inspector

Check browser developer tools' Application tab to inspect localStorage contents.

### Command Line Diagnostics

Use these commands to diagnose issues:

- `!status` - Check system status
- `!system` - View system information
- `!network` - Check network status
- `!airlock status` - Verify airlock configuration

## Getting Help

If you're still experiencing issues after trying these solutions:

1. Check the [GitHub repository](https://github.com/GodsIMiJ1/R3B3L-4F) for known issues
2. Search for similar problems in the Issues section
3. Create a new issue with detailed information about your problem
4. Include error messages, browser information, and steps to reproduce
