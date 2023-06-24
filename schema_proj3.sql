-- schema for tables in our database

CREATE TABLE wic_obesity (
index INT NOT NULL,
YearStart TIMESTAMP,
LocationAbbr VARCHAR(2) NOT NULL,
Data_Value FLOAT,
Latitude FLOAT,
Longitude FLOAT,
Sample_Size FLOAT,
Question VARCHAR(100) NOT NULL,
Age_Category VARCHAR(50) NOT NULL,
States FLOAT,
Counties FLOAT,
Stratification1 VARCHAR(50) NOT NULL,
PRIMARY KEY (index)
);

CREATE TABLE state_data (
	index INT,
	locationabbr VARCHAR(2) NOT NULL,
	state_code INT,
	state_county_code INT,
	poverty_rate FLOAT,
	year INT,
	PRIMARY KEY (index)
);

CREATE TABLE county_data (
	index INT,
	county_name VARCHAR(50) NOT NULL,
	county_code INT,
	locationabbr VARCHAR(2) NOT NULL,
	state_code INT,
	state_county_code INT,
	poverty_rate FLOAT,
	year INT,
	PRIMARY KEY (index)
);

CREATE TABLE coordinates (
	lat FLOAT,
	lon FLOAT,
	coordinates_id INT,
	PRIMARY KEY (coordinates_id)	
);

CREATE TABLE restaurant_names (
	restaurant_name VARCHAR (100) NOT NULL,
	name_id INT NOT NULL,
	PRIMARY KEY (name_id)
);