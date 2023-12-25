using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ReykjanesRidge.Models.Dtos;
using ReykjanesRidge.Models.Settings;
using ReykjanesRidge.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReykjanesRidge.Services.Implementations
{
    public class EarthquakeService
    {
        private readonly ApplicationContext Context;
        private readonly EarthquakeVisualizerSettings EarthquakeVisualizerSettings;
        private readonly IMapper Mapper;

        public event Action<EarthquakeDto> OnEarthquakeAdded;

        public EarthquakeService(ApplicationContext context, EarthquakeVisualizerSettings earthquakeVisualizerSettings, IMapper mapper)
        {
            Context = context;
            Mapper = mapper;
            EarthquakeVisualizerSettings = earthquakeVisualizerSettings;
            //EarthquakePopulatorService = earthquakePopulatorService;

            // Connect notifier up the chain
            //earthquakePopulatorService.OnEarthquakeAdded += OnEarthquakeAdded;
        }

        public async Task<List<EarthquakeDto>> GetAll()
        {
            var earthquakes = (await Context.Earthquakes.ToListAsync()).Where(e => (DateTime.UtcNow - e.TimeStamp).TotalHours <= EarthquakeVisualizerSettings.RetentionPolicy);
            return Mapper.Map<List<EarthquakeDto>>(earthquakes);
        }

        public async Task<EarthquakeDto> GetOne()
        {
            return Mapper.Map<EarthquakeDto>(await Context.Earthquakes.FirstOrDefaultAsync());
        }
    }
}
