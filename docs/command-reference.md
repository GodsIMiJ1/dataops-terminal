# R3B3L 4F Command Reference

This document provides a comprehensive list of all commands available in R3B3L 4F.

## Command Syntax

Commands in R3B3L 4F are prefixed with `!` followed by the command name and any arguments:

```
!command [argument1] [argument2] ...
```

## Core Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!help` | [command] | Display help information. If a command is specified, show detailed help for that command. |
| `!clear` | | Clear the terminal display. |
| `!status` | | Display system status information. |
| `!version` | | Show the current version of R3B3L 4F. |
| `!exit` | | Exit the current session. |

## System Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!system` | | Display system information. |
| `!memory` | | Show memory usage statistics. |
| `!storage` | | Display storage usage information. |
| `!cpu` | | Show CPU usage statistics. |
| `!network` | | Display network status and statistics. |
| `!processes` | | List running processes. |
| `!kill` | [process_id] | Terminate a process by ID. |

## Airlock Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!airlock` | | Display current airlock status. |
| `!airlock on` | | Activate the airlock (block internet access). |
| `!airlock off` | | Deactivate the airlock (allow internet access). |
| `!airlock status` | | Show detailed airlock status. |
| `!airlock whitelist` | [domain] | Add a domain to the airlock whitelist. |
| `!airlock blacklist` | [domain] | Add a domain to the airlock blacklist. |

## Mission Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!mission` | | Display current mission information. |
| `!mission list` | | List all missions. |
| `!mission start` | [name] [objective] | Start a new mission with the specified name and objective. |
| `!mission status` | | Show the status of the current mission. |
| `!mission complete` | | Mark the current mission as complete. |
| `!mission abort` | | Abort the current mission. |
| `!mission log` | [message] | Add a log entry to the current mission. |

## Scroll Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!scroll` | | List available scrolls. |
| `!scroll create` | [name] | Create a new scroll with the specified name. |
| `!scroll read` | [name] | Display the contents of the specified scroll. |
| `!scroll write` | [name] [content] | Write content to the specified scroll. |
| `!scroll append` | [name] [content] | Append content to the specified scroll. |
| `!scroll delete` | [name] | Delete the specified scroll. |
| `!scroll export` | [name] [format] | Export a scroll in the specified format (txt, md, json). |

## Network Reconnaissance Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!net-scan` | [domain/IP] | Perform a basic network scan on the specified domain or IP. |
| `!whois` | [domain] | Perform a WHOIS lookup on the specified domain. |
| `!dns` | [domain] [type] | Perform a DNS lookup. Type can be A, AAAA, MX, TXT, etc. |
| `!traceroute` | [host] | Perform a traceroute to the specified host. |
| `!ping` | [host] [count] | Ping the specified host a number of times. |
| `!port-scan` | [host] [port-range] | Scan the specified ports on the host. |
| `!headers` | [url] | Retrieve and display HTTP headers from the specified URL. |

## GitHub Reconnaissance Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!git-harvest` | [username] | Gather information about a GitHub user. |
| `!git-repos` | [username] | List repositories for a GitHub user. |
| `!git-repo` | [username] [repo] | Get detailed information about a specific repository. |
| `!git-commits` | [username] [repo] | List recent commits for a repository. |
| `!git-issues` | [username] [repo] | List open issues for a repository. |
| `!git-contributors` | [username] [repo] | List contributors to a repository. |
| `!git-search` | [query] | Search GitHub for repositories matching the query. |

## File System Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!ls` | [directory] | List files in the specified directory. |
| `!cd` | [directory] | Change the current directory. |
| `!pwd` | | Display the current directory. |
| `!cat` | [file] | Display the contents of a file. |
| `!mkdir` | [directory] | Create a new directory. |
| `!rm` | [file/directory] | Remove a file or directory. |
| `!cp` | [source] [destination] | Copy a file or directory. |
| `!mv` | [source] [destination] | Move a file or directory. |
| `!find` | [pattern] | Search for files matching the pattern. |
| `!grep` | [pattern] [file] | Search for a pattern in a file. |

## Configuration Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!config` | | Display current configuration. |
| `!config set` | [key] [value] | Set a configuration value. |
| `!config get` | [key] | Get a configuration value. |
| `!config reset` | [key] | Reset a configuration value to default. |
| `!config export` | [file] | Export configuration to a file. |
| `!config import` | [file] | Import configuration from a file. |

## Utility Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!echo` | [text] | Display the specified text. |
| `!date` | | Display the current date and time. |
| `!calc` | [expression] | Calculate the result of a mathematical expression. |
| `!timer` | [seconds] | Set a timer for the specified number of seconds. |
| `!countdown` | [seconds] | Start a countdown for the specified number of seconds. |
| `!random` | [min] [max] | Generate a random number between min and max. |
| `!uuid` | | Generate a UUID. |
| `!hash` | [algorithm] [text] | Generate a hash of the specified text using the specified algorithm. |
| `!encode` | [format] [text] | Encode text in the specified format (base64, url, etc.). |
| `!decode` | [format] [text] | Decode text from the specified format. |

## Advanced Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `!exec` | [command] | Execute a system command (requires confirmation for dangerous commands). |
| `!script` | [file] | Execute a script file. |
| `!alias` | [name] [command] | Create a command alias. |
| `!unalias` | [name] | Remove a command alias. |
| `!cron` | [schedule] [command] | Schedule a command to run at specified intervals. |
| `!log` | [level] [message] | Add a message to the system log with the specified level. |
| `!watch` | [command] [interval] | Execute a command repeatedly at the specified interval. |

## Command Flags

Many commands support additional flags to modify their behavior:

- `-v, --verbose`: Provide more detailed output
- `-q, --quiet`: Provide minimal output
- `-h, --help`: Display help for the command
- `-f, --force`: Force the operation without confirmation
- `-r, --recursive`: Perform the operation recursively
- `-o, --output [file]`: Write output to a file
- `-j, --json`: Format output as JSON
- `-t, --timeout [seconds]`: Set a timeout for the command

## Examples

```
!help net-scan
!status
!airlock off
!mission start "Reconnaissance" "Gather information about target systems"
!net-scan example.com
!git-harvest octocat
!scroll create recon-notes
!scroll write recon-notes "Found the following information: ..."
!config set theme cyberpunk
```

## Command Execution Context

Commands are executed in the context of the current session, with access to:

- Current mission
- Current directory
- Environment variables
- Command history
- User preferences

## Command Permissions

Some commands require specific permissions or conditions:

- Dangerous commands require confirmation
- Network commands require the airlock to be deactivated
- File system commands operate within a restricted sandbox
- System commands may have limited functionality based on the deployment environment
