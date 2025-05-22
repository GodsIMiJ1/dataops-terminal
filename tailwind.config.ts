
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Theme colors
				// Professional theme (default)
				pro: {
					bg: {
						DEFAULT: '#1a1f2b',  // Dark charcoal with blue tint
						dark: '#121620',     // Even darker charcoal
						panel: '#1e2433',    // Dark blue-grey for panels
						darkPanel: '#141824' // Very dark blue-grey
					},
					text: {
						DEFAULT: '#e2e8f0',  // Light grey
						dark: '#f8fafc',     // Almost white
						muted: '#94a3b8',    // Medium grey
						mutedDark: '#64748b' // Darker grey
					},
					primary: {
						DEFAULT: '#3b82f6',  // Bright blue
						dark: '#2563eb',     // Darker blue
						light: '#60a5fa'     // Lighter blue
					},
					secondary: {
						DEFAULT: '#6366f1',  // Indigo
						dark: '#4f46e5',     // Darker indigo
						light: '#818cf8'     // Lighter indigo
					},
					accent: {
						DEFAULT: '#0ea5e9',  // Sky blue
						dark: '#0284c7',     // Darker sky blue
						light: '#38bdf8'     // Lighter sky blue
					},
					border: {
						DEFAULT: '#334155',  // Dark slate
						dark: '#1e293b',     // Darker slate
						focus: '#3b82f6'     // Blue for focus
					}
				},
				// Cyberpunk theme (ghost mode)
				cyber: {
					black: '#0a0a0a',
					darkgray: '#1a1a1a',
					red: {
						DEFAULT: '#ff0056',
						bright: '#ff2071',
						dim: '#b3003c'
					},
					cyan: {
						DEFAULT: '#00ffff',
						bright: '#60fdfd',
						dim: '#00b3b3'
					},
					green: {
						DEFAULT: '#00ff66',
						bright: '#33ff85',
						matrix: '#00de16'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"flicker": {
					"0%, 100%": { opacity: "1" },
					"33%": { opacity: "0.8" },
					"66%": { opacity: "0.9" }
				},
				"glitch": {
					"0%, 100%": { transform: "translate(0)" },
					"20%": { transform: "translate(-5px, 5px)" },
					"40%": { transform: "translate(-5px, -5px)" },
					"60%": { transform: "translate(5px, 5px)" },
					"80%": { transform: "translate(5px, -5px)" }
				},
				"scan": {
					from: { top: "-10%" },
					to: { top: "110%" }
				},
				"rain": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
				"pulse": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.5" }
				}
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"flicker": "flicker 0.5s linear infinite",
				"glitch": "glitch 0.3s linear infinite",
				"glitch-slow": "glitch 3s ease-in-out infinite",
				"scan": "scan 4s linear infinite",
				"rain": "rain 15s linear infinite",
				"pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
