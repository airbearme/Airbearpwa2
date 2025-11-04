-- Add latitude and longitude to airbears table
ALTER TABLE airbears
ADD COLUMN latitude decimal(10, 8),
ADD COLUMN longitude decimal(11, 8);

-- Create a GIST index for efficient geospatial queries
CREATE INDEX idx_airbears_location ON airbears USING gist (ll_to_earth(latitude, longitude));
