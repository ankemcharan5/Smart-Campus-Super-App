from app.database.connection import (
    check_database_connection,
    db,
)


try:

    check_database_connection()

    print()
    print("==============================")
    print("MongoDB connection successful!")
    print(f"Database: {db.name}")
    print("==============================")
    print()

except Exception as error:

    print()
    print("==============================")
    print("MongoDB connection failed!")
    print("==============================")
    print()

    print(error)