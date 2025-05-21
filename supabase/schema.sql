-- R3B3L 4F Supabase Schema
-- This file contains the SQL schema for the Supabase database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: device_sessions
-- Stores device IDs for anonymous persistence
CREATE TABLE IF NOT EXISTS device_sessions (
  device_id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: chat_logs
-- Stores chat messages for each device
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT REFERENCES device_sessions(device_id),
  role TEXT,
  content TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_logs_device_id ON chat_logs(device_id);

-- Create RLS policies for device_sessions
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read for device_sessions"
  ON device_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert for device_sessions"
  ON device_sessions
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for chat_logs
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read for chat_logs"
  ON chat_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert for chat_logs"
  ON chat_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete for chat_logs"
  ON chat_logs
  FOR DELETE
  USING (true);
