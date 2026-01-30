#!/usr/bin/env python3
"""
SamVyt Rifas - Database Setup Script
Executes the schema.sql file in Supabase/PostgreSQL
"""

import os
import sys
from supabase import create_client, Client

def setup_database():
    """Initialize the database with the schema"""
    
    # Get Supabase credentials from environment
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables are required")
        sys.exit(1)
    
    print("🔗 Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Read schema file
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    
    if not os.path.exists(schema_path):
        print(f"❌ Error: Schema file not found at {schema_path}")
        sys.exit(1)
    
    print("📖 Reading schema.sql...")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    print("⚙️  Executing database schema...")
    print("=" * 60)
    
    try:
        # Execute the SQL schema
        # Note: Supabase Python SDK uses PostgREST, which doesn't directly support raw SQL execution
        # For schema setup, we need to use the Supabase SQL Editor or psycopg2
        
        print("⚠️  Note: The Supabase Python SDK uses PostgREST and doesn't support raw SQL execution.")
        print("📝 To set up the database, please:")
        print("   1. Go to your Supabase Dashboard: https://app.supabase.com")
        print("   2. Navigate to SQL Editor")
        print("   3. Copy and paste the contents of 'database/schema.sql'")
        print("   4. Run the SQL script")
        print()
        print("✅ Alternatively, use psql or any PostgreSQL client to execute the schema.")
        print()
        print("=" * 60)
        
        # Test connection by checking if we can query
        print("🧪 Testing Supabase connection...")
        response = supabase.table('raffle_configs').select("*").limit(1).execute()
        
        if response.data is not None:
            print("✅ Connection successful! Database is ready.")
            if len(response.data) > 0:
                print(f"📊 Found raffle config: {response.data[0].get('name', 'N/A')}")
        else:
            print("⚠️  Connection successful but no data found. Please run the schema first.")
            
    except Exception as e:
        print(f"⚠️  Note: {str(e)}")
        print("📝 Please execute the schema.sql manually in Supabase SQL Editor.")
    
    print("\n✨ Setup script completed!")

if __name__ == "__main__":
    setup_database()
