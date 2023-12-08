using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ReykjanesRidge.Models.Entities
{
    public class Earthquake : IEarthquake
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid ID { get; set; }

        /* AlternativeID is basically a combination of the latitude, longitude, depth and magnitude
         * We'll use something like the Levenshtein distance algorithm to figure out if an update to an
         * earthquake matches closely enough to a quake in our database
         */
        /*public string AlternativeID { 
            get
            {
                return $"{TimeStamp.ToString("s")}_{Latitude}_{Longitude}_{Depth}_{Magnitude}_{Quality}";
            }
        }*/
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
