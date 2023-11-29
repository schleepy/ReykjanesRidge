using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ReykjanesRidge.Models.Dtos
{
    public class EarthquakeDto : IEarthquake
    {
        public Guid ID { get; set; }
        public string AlternativeID { get; set; }
        public DateTime TimeStamp { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Depth { get; set; }
        public double Magnitude { get; set; }
        public double Quality { get; set; }
        public string FriendlyLocation { get; set; }
    }
}
