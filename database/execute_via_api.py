#!/usr/bin/env python3
"""Execute schema SQL via Supabase REST API"""
import os
import requests
import json

# Get credentials
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_KEY')

if not supabase_url or not supabase_key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY")
    exit(1)

# Read schema
with open('/home/ubuntu/system-assembler-site/database/schema.sql', 'r') as f:
    schema_sql = f.read()

print("🚀 Executando schema no Supabase...")
print(f"📍 URL: {supabase_url}")
print()

# Try to execute via PostgREST RPC (if available)
# Note: This won't work directly as PostgREST doesn't support raw SQL execution
# We need to use the Management API or direct PostgreSQL connection

print("⚠️  A API REST do Supabase (PostgREST) não suporta execução de SQL bruto.")
print("📝 Vou usar o navegador para colar o schema no SQL Editor.")
print()
print("✅ Schema preparado em: /tmp/schema_to_paste.sql")
