# R3B3L 4F User Guide

This comprehensive guide will help you make the most of R3B3L 4F's features and capabilities.

## Table of Contents

- [Getting Started](#getting-started)
- [User Interface](#user-interface)
- [Chat Functionality](#chat-functionality)
- [Command System](#command-system)
- [Airlock System](#airlock-system)
- [Missions and Memory](#missions-and-memory)
- [Reconnaissance Tools](#reconnaissance-tools)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## Getting Started

If you haven't set up R3B3L 4F yet, please refer to the [Getting Started](./getting-started.md) guide first.

## User Interface

The R3B3L 4F interface is designed with a cyberpunk aesthetic and consists of several key areas:

### Main Terminal

The central area displays chat messages, command outputs, and system notifications. This is where most of your interaction with R3B3L 4F will take place.

### Input Area

Located at the bottom of the screen, this is where you type messages and commands. Press Enter to send.

### Status Panels

Located on the sides of the interface, these panels display:
- System status
- Airlock status
- Mission information
- Memory status
- Network status

### Navigation

- **Top Bar**: Contains the R3B3L 4F logo and system controls
- **Side Panels**: Show status information and controls
- **Bottom Bar**: Contains the input area and additional controls

## Chat Functionality

R3B3L 4F provides an advanced chat interface powered by OpenAI's GPT-4o model.

### Basic Chat

Simply type your message in the input area and press Enter. R3B3L 4F will respond in its cyberpunk militant persona.

### Chat Commands

You can use special commands within the chat by prefixing them with `!`:

```
!help                 # Display available commands
!clear                # Clear the chat history
!status               # Check system status
```

### Conversation Context

R3B3L 4F maintains context throughout your conversation, allowing for more coherent and relevant interactions. The context window is limited, so very long conversations may lose earlier context.

### Offline Mode

If you're offline or the airlock is active, R3B3L 4F will use fallback responses. These are less sophisticated but allow basic functionality without internet access.

## Command System

R3B3L 4F features a powerful command system that allows you to execute various actions.

### Command Syntax

Commands are prefixed with `!` followed by the command name and any arguments:

```
!command [argument1] [argument2] ...
```

### Basic Commands

- `!help` - Display available commands
- `!clear` - Clear the terminal
- `!status` - Check system status
- `!version` - Display R3B3L 4F version information
- `!exit` - Exit the current session

### System Commands

- `!system` - Display system information
- `!memory` - Check memory usage
- `!storage` - Check storage usage
- `!network` - Check network status

### Dangerous Commands

Some commands are flagged as potentially dangerous and require confirmation:

```
!rm -rf [directory]   # Will prompt for confirmation
```

To confirm a dangerous command, you'll need to use the confirmation token provided:

```
!confirm [token]
```

## Airlock System

The airlock system controls R3B3L 4F's access to the internet, providing an additional layer of security.

### Airlock Commands

- `!airlock status` - Check the current airlock status
- `!airlock on` - Activate the airlock (block internet access)
- `!airlock off` - Deactivate the airlock (allow internet access)

### Airlock Indicators

The interface displays the current airlock status:
- **SEALED**: Airlock is active, internet access is blocked
- **OPEN**: Airlock is inactive, internet access is allowed

### Airlock Behavior

When the airlock is active:
- External API calls are blocked
- Web reconnaissance tools are disabled
- Chat uses fallback responses instead of OpenAI
- Local commands continue to function

## Missions and Memory

R3B3L 4F includes a mission system for organizing your activities and maintaining memory across sessions.

### Mission Commands

- `!mission list` - List all missions
- `!mission start [name]` - Start a new mission
- `!mission status` - Check current mission status
- `!mission complete` - Mark the current mission as complete

### Scrolls

Scrolls are persistent memory logs that record important information:

- `!scroll create [name]` - Create a new scroll
- `!scroll list` - List all scrolls
- `!scroll read [name]` - Read a scroll
- `!scroll write [name] [content]` - Write to a scroll
- `!scroll delete [name]` - Delete a scroll

### Persistence

Mission data and scrolls can be persisted using Supabase integration. This allows you to access your data across different devices and sessions.

## Reconnaissance Tools

R3B3L 4F includes several tools for gathering information and reconnaissance.

### Network Reconnaissance

- `!net-scan [domain]` - Perform DNS lookup and basic port scan
- `!whois [domain]` - Perform WHOIS lookup
- `!traceroute [host]` - Perform traceroute
- `!headers [url]` - Check HTTP headers

### GitHub Reconnaissance

- `!git-harvest [username]` - Gather information about GitHub user
- `!git-repos [username]` - List repositories for a GitHub user
- `!git-analyze [repo]` - Analyze a GitHub repository

## Customization

R3B3L 4F offers several customization options to tailor the experience to your preferences.

### Appearance

- `!theme [name]` - Change the interface theme
- `!font [name]` - Change the terminal font
- `!color [element] [color]` - Change specific color elements

### Behavior

- `!set prefix [character]` - Change the command prefix
- `!set airlockDefault [on|off]` - Set default airlock status
- `!set logLevel [level]` - Set logging verbosity

## Troubleshooting

If you encounter issues with R3B3L 4F, try these common solutions:

### Connection Issues

- Check your internet connection
- Verify that the airlock is deactivated
- Ensure your OpenAI API key is valid

### Performance Issues

- Reduce the chat history length
- Close unused browser tabs
- Check system resources

### Command Failures

- Verify command syntax
- Check for required permissions
- Look for error messages in the output

For more detailed troubleshooting, see the [Troubleshooting](./troubleshooting.md) guide.
