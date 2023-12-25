using ReykjanesRidge.Models;
using ReykjanesRidge.Models.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Services.Implementations
{
    public class EarthquakeNotifierService
    {
        public event Action<EarthquakeEventArgs> OnEarthquakeAdded;

        public EarthquakeNotifierService() { }

        public void EarthquakeAdded(EarthquakeDto earthquakeDto)
        {
            var args = new EarthquakeEventArgs
            {
                Earthquake = earthquakeDto
            };

            if (OnEarthquakeAdded != null) // Is event subscribed
            {
                OnEarthquakeAdded.Invoke(args);
            }
        }
    }
}
