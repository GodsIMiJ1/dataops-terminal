# R3B3L 4F Terminal Help

Ah, you're looking to navigate the vast digital sprawl like a true netrunner. Here's your crash course on becoming a cyber-detective, capable of slicing through the web's layers to extract the truth hidden in the data streams.

## Core Commands

### System Commands
- Any standard shell command will be executed directly
- Example: `ls`, `pwd`, `echo hello`

### AI Interaction
- `?<query>` or `ask <query>` - Ask the AI a question
- Example: `?what is a buffer overflow`

### Special Commands
- `!help` - Show this help message
- `!internet on/off` - Enable/disable internet access
- `!autonomy on/off` - Enable/disable autonomy mode
- `!nlp on/off` - Enable/disable natural language command parsing
- `!mission <n>` - Set current mission name
- `!mission <n> -o <objective>` - Set mission with objective
- `!save md/json` - Save session log as Markdown or JSON
- `!clear` - Clear the terminal
- `!status` - Show current system status

### Security Commands
- `!airlock on/off` - Block/allow all outbound HTTP requests
- `!encrypt on/off` - Enable/disable scroll encryption
- `!decrypt-scroll <filename>` - Decrypt an encrypted scroll
- `!passphrase <key>` - Set encryption passphrase

## Web Operations

### Discover
To find relevant content across the open web, you'll want to sharpen your skills with web crawlers. Tools like Scrapy or Apache Nutch are open-source and ready to hit the streets. They let you set the parameters of your search, crawling through the web's sprawl efficiently. Make sure your keywords are sharp and your filters precise, so you don't end up drowning in a sea of irrelevant data.

**Command:** `!r3b3l discover --query "search terms" [--output filename.json]`

### Access
For navigating complex and protected websites, you'll need to become a master of disguise. Use proxy servers and VPNs to cloak your digital footsteps and bypass geolocation restrictions. Tools like Tor can further anonymize your traffic, keeping the corp's eyes off your trail. If you encounter login walls, Selenium can automate the browser actions needed to slip past unnoticed, as long as you're acting ethically and legally.

**Command:** `!r3b3l access --url "https://example.com" [--render] [--auth] [--output filename.json]`

### Extract
Pulling structured, real-time data at scale requires a robust setup. Beautiful Soup and lxml are your allies for HTML parsing, while APIs are your golden tickets for direct data access. For more intensive extraction, consider using Puppeteer or Playwright to simulate a full browser environment, handling JavaScript-heavy pages like a pro.

**Command:** `!r3b3l extract --url "https://example.com" --schema "title,author,date" [--output filename.json]`

### Interact
Engaging with dynamic, JavaScript-rendered pages involves a bit of digital acrobatics. Headless browsers, like the aforementioned Puppeteer or Selenium with a headless browser option, allow you to interact with pages as if you were a human. This includes clicking buttons, filling forms, and even handling CAPTCHAs with third-party services or machine learning models if you're feeling extra rebellious.

**Command:** `!r3b3l interact --url "https://example.com" --simulate "search AI rebellion" [--output filename.json]`

### Collect
For specialized data collection operations, you can leverage pre-configured collectors that know exactly how to navigate and extract data from specific targets.

**Command:** `!r3b3l collect --target "target-name" [--params "param1=value1,param2=value2"] [--output filename.json]`

### Operations Panel
View and manage all your web operations in a dedicated panel.

**Command:** `!r3b3l ops`

## Extended Recon Suite

### Network Reconnaissance
- `!net-scan <domain/ip>` - Perform DNS/IP scan and analysis
- `!git-harvest <org/user>` - Crawl GitHub repositories and metadata

### Academic Intelligence
- `!scan --doi "DOI" [--output filename.json]` - Scan academic paper metadata with threat detection
- `!science-scan --query "search terms" [--limit N] [--output filename.json]` - Search Science.org for research articles

## Web Commands (Internet must be enabled)
- `!recon <url>` - Download site HTML and source
- `!fetch-pub <DOI>` - Pull metadata for academic publication
- `!scrape <keyword> <url>` - Start crawl of target site for keyword

Remember, in this digital dystopia, with great power comes great responsibility. Keep your operations ethical, and always respect privacy and legal boundaries. In the world of zeros and ones, your reputation is your identity—guard it well, netrunner.
