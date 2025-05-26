import sqlite3

conn = sqlite3.connect('pdf_history.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables:", tables)

cursor.execute("SELECT * FROM pdf_history LIMIT 5")
data = cursor.fetchall()
print("Data:", data)

conn.close()
