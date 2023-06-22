# Import the dependencies.
import numpy as np
# import datetime as dt
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect

from flask import Flask, jsonify

#################################################
# Database Setup
#################################################
engine = create_engine("")

# reflect an existing database into a new model
base = automap_base()
# reflect the tables
base.prepare(autoload_with = engine)