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
        private readonly IMapper Mapper;

        public EarthquakeService(ApplicationContext context, IMapper mapper)
        {
            Context = context;
            Mapper = mapper;
        }

        public async Task<List<EarthquakeDto>> GetAll()
        {
            return Mapper.Map<List<EarthquakeDto>>(await Context.Earthquakes.ToListAsync());
        }
    }
}
