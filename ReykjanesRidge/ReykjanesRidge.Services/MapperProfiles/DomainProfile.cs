using AutoMapper;
using ReykjanesRidge.Models.Dtos;
using ReykjanesRidge.Models.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Services.MapperProfiles
{
    public class DomainProfile : Profile
    {
        public DomainProfile()
        {
            CreateMap<EarthquakeDto, Earthquake>()
                .ForMember(e => e.ID, opt => opt.Ignore());
        }
    }
}
