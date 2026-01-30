#!/usr/bin/env python3
"""
SamVyt Rifas - Database Schema Executor
Executes the schema.sql file directly in PostgreSQL using psycopg2
"""

import os
import sys
import psycopg2
from urllib.parse import urlparse

def get_db_connection_params():
    """Extract database connection parameters from Supabase URL"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    
    if not supabase_url:
        print("❌ Error: SUPABASE_URL environment variable is required")
        sys.exit(1)
    
    # Parse Supabase URL to get the project reference
    # Format: https://<project-ref>.supabase.co
    parsed = urlparse(supabase_url)
    project_ref = parsed.hostname.split('.')[0] if parsed.hostname else None
    
    if not project_ref:
        print("❌ Error: Could not parse project reference from SUPABASE_URL")
        sys.exit(1)
    
    print(f"📋 Project Reference: {project_ref}")
    print()
    print("=" * 70)
    print("⚠️  IMPORTANT: Direct PostgreSQL Connection Required")
    print("=" * 70)
    print()
    print("To execute the schema, you need the PostgreSQL connection string.")
    print()
    print("📝 How to get your connection string:")
    print("   1. Go to: https://app.supabase.com/project/{project_ref}/settings/database")
    print("   2. Find 'Connection string' section")
    print("   3. Select 'URI' tab")
    print("   4. Copy the connection string")
    print("   5. Replace [YOUR-PASSWORD] with your actual database password")
    print()
    print("🔗 Your connection string format:")
    print(f"   postgresql://postgres:[YOUR-PASSWORD]@db.{project_ref}.supabase.co:5432/postgres")
    print()
    
    # Ask for connection string
    db_url = input("📥 Please paste your PostgreSQL connection string here: ").strip()
    
    if not db_url:
        print("❌ Error: Connection string is required")
        sys.exit(1)
    
    return db_url

def execute_schema(db_url):
    """Execute the schema SQL file"""
    
    # Read schema file
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    
    if not os.path.exists(schema_path):
        print(f"❌ Error: Schema file not found at {schema_path}")
        sys.exit(1)
    
    print("\n📖 Reading schema.sql...")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    print("🔗 Connecting to PostgreSQL...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ Connected successfully!")
        print("⚙️  Executing schema...")
        print()
        
        # Execute schema
        cursor.execute(schema_sql)
        
        print("✅ Schema executed successfully!")
        print()
        
        # Verify tables
        print("🔍 Verifying tables...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"📊 Found {len(tables)} tables:")
        for table in tables:
            print(f"   ✓ {table[0]}")
        
        print()
        
        # Check quotas count
        cursor.execute("SELECT COUNT(*) FROM quotas;")
        quota_count = cursor.fetchone()[0]
        print(f"🎫 Total quotas initialized: {quota_count:,}")
        
        # Check raffle config
        cursor.execute("SELECT name, prize, total_quotas FROM raffle_configs LIMIT 1;")
        raffle = cursor.fetchone()
        if raffle:
            print(f"🎁 Raffle: {raffle[0]}")
            print(f"🏆 Prize: {raffle[1]}")
            print(f"📈 Total Quotas: {raffle[2]:,}")
        
        cursor.close()
        conn.close()
        
        print()
        print("=" * 70)
        print("✨ Database setup completed successfully!")
        print("=" * 70)
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("=" * 70)
    print("🎯 SamVyt Rifas - Database Setup")
    print("=" * 70)
    print()
    
    db_url = get_db_connection_params()
    execute_schema(db_url)

if __name__ == "__main__":
    main()
