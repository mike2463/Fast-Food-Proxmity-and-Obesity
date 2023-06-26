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
# url is postgresql://username:password@host:port/database_name
database_url = "postgresql://postgres:postgres@localhost:5432/project_three"

# Create the engine
engine = create_engine(database_url)

# Reflect an existing database into a new model
base = automap_base()
# Reflect the tables
base.prepare(engine, reflect=True)

# create names for each table in database
coordinates = base.classes.coordinates
county_data = base.classes.county_data
restaurant_names = base.classes.restaurant_names
state_data = base.classes.state_data
wic_obesity = base.classes.wic_obesity

# Create a session
session = Session(engine)

# Query the data from the table
results = session.query(coordinates).all()

# Return the data as JSON
app = Flask(__name__)

@app.route('/')
def homepage():
    """list available routes"""
    return (
        f"Available Routes: <br/>"
        f"/api/v1.0/restaurant_data<br/>"
        f"/api/v1.0/county_data<br/>"
        f"/api/v1.0/state_data<br/>"
        f"/api/v1.0/wic_obesity"        
    )

@app.route("/api/v1.0/restaurant_data")
def rest_data():
    """add query results into dict, then jsonify it."""
    coords = session.query(coordinates).all()
    rests = session.query(restaurant_names).all()
    lat = []
    long = []
    rnames = []
    for coord in coords:
        lat.append(coord.lat)
        long.append(coord.lon)
    rest_coords = (zip(lat,long))
    for rest in rests:
        rnames.append(rest.restaurant_name)
    rest_dict = dict(zip(rnames,rest_coords))
    return jsonify(rest_dict)


if __name__ == '__main__':
    app.run(debug=True)

# Close the session
session.close()