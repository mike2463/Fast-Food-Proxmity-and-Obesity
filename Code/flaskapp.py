# Import the dependencies
import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from flask import Flask, jsonify

#################################################
# Database Setup
#################################################
# Provide your database connection URL here
database_url = ""

# Create the engine
engine = create_engine(database_url)

# Reflect an existing database into a new model
base = automap_base()
# Reflect the tables
base.prepare(engine, reflect=True)

# Choose the table you want to query (replace 'Table' with the actual table name)
Table = base.classes.Table

# Create a session
session = Session(engine)

# Query the data from the table
results = session.query(Table).all()

# Convert the results to a list of dictionaries
data = []
for result in results:
    data.append(result.__dict__)

# Close the session
session.close()

# Return the data as JSON
app = Flask(__name__)

@app.route('/')
def index():
    return jsonify(data)

if __name__ == '__main__':
    app.run()
