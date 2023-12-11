using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Models.Settings
{
    public class EarthquakePopulatorSettings : BackgroundServiceSettings
    {
        public int RetentionPolicy { get; set; } // how many hours after an earthquake registered do we keep it.
    }
}
