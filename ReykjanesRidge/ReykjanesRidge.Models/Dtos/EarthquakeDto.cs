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
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public decimal Depth { get; set; }
        public decimal Magnitude { get; set; }
        public decimal Quality { get; set; }
        public string FriendlyLocation { get; set; }
    }
}
