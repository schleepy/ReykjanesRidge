using ReykjanesRidge.Models.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Services.Implementations
{
    public class EarthquakeNotifierService
    {
        public event Action<EarthquakeDto> OnEarthquakeAdded;

        public EarthquakeNotifierService()
        {

        }

        public void EarthquakeAdded(EarthquakeDto earthquakeDto)
        {
            if (OnEarthquakeAdded != null) // Is event subscribed
            {
                OnEarthquakeAdded.Invoke(earthquakeDto);
            }
        }
    }
}
