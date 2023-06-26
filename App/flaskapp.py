# Import the dependencies
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
    """add data from two tables into one dict, then jsonify it."""
    coords = session.query(coordinates).all()
    rests = session.query(restaurant_names).all()
    # initialize empty lists
    lat = []
    long = []
    rnames = []
    # take lat and long in each row, then zip together
    for coord in coords:
        lat.append(coord.lat)
        long.append(coord.lon)
    rest_coords = (zip(lat,long))
    # zip together restaurant and location, then make dict
    for rest in rests:
        rnames.append(rest.restaurant_name)
    rest_dict = dict(zip(rnames,rest_coords))
    return jsonify(rest_dict)

@app.route("/api/v1.0/county_data")
def counties():
    """create dict of county data, then json"""
    co_data = session.query(county_data).all()
    s_c_code = []
    poverty = []
    year = []
    for i in co_data:
        s_c_code.append(i.state_county_code)
        poverty.append(i.poverty_rate)
        year.append(i.year)
    pov_year = zip(poverty, year)
    pov_dict = dict(zip(s_c_code,pov_year))
    return jsonify(pov_dict)

@app.route("/api/v1.0/state_data")
def states():
    """create dict of state data, then json"""
    st_data = session.query(state_data).all()
    s_c_code = []
    poverty = []
    year = []
    for i in st_data:
        s_c_code.append(i.state_county_code)
        poverty.append(i.poverty_rate)
        year.append(i.year)
    pov_year = zip(poverty, year)
    pov_state_dict = dict(zip(s_c_code,pov_year))
    return jsonify(pov_state_dict)

@app.route("/api/v1.0/wic_obesity")
def wic():
    """create dict of wic data then json"""
    wic_data = session.query(wic_obesity).all()
    lat = []
    long = []
    obesity = []
    index = []

    for x in wic_data:
        lat.append(x.latitude)
        long.append(x.longitude)
        obesity.append(x.data_value)
        index.append(x.index)

    coords = zip(lat, long)
    ob_co = zip(obesity,coords)
    data_dict = dict(zip(index, ob_co))
    return jsonify(data_dict)

if __name__ == '__main__':
    app.run(debug=True)

# Close the session
session.close()