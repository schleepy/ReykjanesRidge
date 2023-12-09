using ReykjanesRidge.Models.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Models
{
    public class EarthquakeEventArgs : EventArgs
    {
        public EarthquakeDto Earthquake { get; set; }
    }
}
