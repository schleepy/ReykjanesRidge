using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Models.Settings
{
    public class Location
    {
        public string Name { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int FontSize { get; set; } = 10;
    }

    public class EarthquakeVisualizerSettings
    {
        public int RetentionPolicy { get; set; } = 120; // 120 hours seems good as a max limit
        public List<Location> Locations { get; set; }
    }
}
