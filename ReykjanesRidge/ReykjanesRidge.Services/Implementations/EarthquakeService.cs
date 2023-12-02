using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ReykjanesRidge.Models.Dtos;
using ReykjanesRidge.Repository;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace ReykjanesRidge.Services.Implementations
{
    public class EarthquakeService
    {
        private readonly ApplicationContext Context;
        private readonly EarthquakePopulatorService EarthquakePopulatorService;
        private readonly IMapper Mapper;

        public event Action<EarthquakeDto> OnEarthquakeAdded;

        public EarthquakeService(ApplicationContext context, /*EarthquakePopulatorService earthquakePopulatorService,*/ IMapper mapper)
        {
            Context = context;
            Mapper = mapper;
            //EarthquakePopulatorService = earthquakePopulatorService;

            // Connect notifier up the chain
            //earthquakePopulatorService.OnEarthquakeAdded += OnEarthquakeAdded;
        }

        public async Task<List<EarthquakeDto>> GetAll()
        {
            return Mapper.Map<List<EarthquakeDto>>(await Context.Earthquakes.ToListAsync());
        }

        public async Task<EarthquakeDto> GetOne()
        {
            return Mapper.Map<EarthquakeDto>(await Context.Earthquakes.FirstOrDefaultAsync());
        }
    }
}
