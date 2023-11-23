using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReykjanesRidge.Models.Entities;
using ReykjanesRidge.Models.Settings;
using ReykjanesRidge.Repository;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ReykjanesRidge.Common.Helpers;
using Microsoft.Data.Sqlite;

namespace ReykjanesRidge.Services.Implementations
{
    public class EarthquakePopulatorService : BackgroundService
    {
        private readonly IServiceProvider Services;
        private readonly EarthquakePopulatorSettings Settings;
        private readonly IMapper Mapper;
        private readonly ILogger Logger;

        internal class MetOfficeEarthquake
        {
            public DateTime t { get; set; }
            public string a { get; set; }
            public string lat { get; set; }
            public string lon { get; set; }
            public string dep { get; set; }
            public string s { get; set; }
            public string q { get; set; }
            public string dL { get; set; }
            public string dD { get; set; }
            public string dR { get; set; }

            public static explicit operator Earthquake(MetOfficeEarthquake metOfficeEarthquake)
            {
                Earthquake obj = new Earthquake
                {
                    TimeStamp = metOfficeEarthquake.t,
                    Latitude = Convert.ToDouble(metOfficeEarthquake.lat),
                    Longitude = Convert.ToDouble(metOfficeEarthquake.lon),
                    Depth = Convert.ToDouble(metOfficeEarthquake.dep),
                    Magnitude = Convert.ToDouble(metOfficeEarthquake.s),
                    Quality = Convert.ToDouble(metOfficeEarthquake.q),
                    FriendlyLocation = $"{metOfficeEarthquake.dL} km {metOfficeEarthquake.dD.Trim()} of {metOfficeEarthquake.dR}"
                };

                obj.AlternativeID = $"{obj.TimeStamp.ToString("s")}_{Math.Ceiling(obj.Latitude)}_{Math.Ceiling(obj.Longitude)}_{Math.Ceiling(obj.Depth)}";

                return obj;
            }
        }

        public EarthquakePopulatorService(
            IServiceProvider services,
            EarthquakePopulatorSettings settings,
            ILogger<EarthquakePopulatorService> logger,
            IMapper mapper) : base(settings, logger)
        {
            Services = services;
            Settings = settings;
            Mapper = mapper;
            Logger = logger;
        }

        public override async Task DoWork(object state)
        {
            Logger.LogInformation("Retreiving earthquakes");

            using (var scope = Services.CreateScope())
            {
                ApplicationContext Context = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
                var connection = (SqliteConnection)Context.Database.GetDbConnection();
                connection.EnableExtensions(true);
                //connection.LoadExtension(@"spellfix.dll");

                var vedurEarthquakes = await ScrapeVedurIs();

                foreach (var earthquake in vedurEarthquakes)
                {
                    //Earthquake existingEarthquake = Context.Earthquakes.FromSqlRaw<Earthquake>("SELECT 1 FROM [Earthquakes]").FirstOrDefault();
                    var existingEarthquake = await Context.Earthquakes.FirstOrDefaultAsync(e => e.AlternativeID == earthquake.AlternativeID);

                    if (existingEarthquake == null) // new earthquake
                    {
                        await Context.Earthquakes.AddAsync(earthquake);
                        Logger.LogInformation($"Added {earthquake.AlternativeID}");
                    } 
                    else
                    {
                        /*earthquake.ID = existingEarthquake.ID;
                        Context.Earthquakes.Update(earthquake);
                        Logger.LogInformation($"Updated earthquake with id {existingEarthquake.ID}");*/
                    }
                }

                await Context.SaveChangesAsync();
                // Get dump of latest earthquakes
                // See what needs updating
            }

            await base.DoWork(state);
        }

        // Gets all from vedur.is
        private async Task<List<Earthquake>> ScrapeVedurIs()
        {
            using (HttpClient client = new HttpClient())
            {
                var response = await client.GetStringAsync("https://en.vedur.is/earthquakes-and-volcanism/earthquakes#view=table");

                string EarthquakeJSObject = Regex.Match(response, "(?:(VI\\.quakeInfo)\\s\\=\\s\\[.)(.*)(?:\\])").Value.Replace("VI.quakeInfo = ", "");

                EarthquakeJSObject = Regex.Replace(EarthquakeJSObject, "new Date\\([\\d\\,\\-]*\\)", m => ResolveJSDate(m.Value));
                List<Earthquake> earthquakes = new List<Earthquake>();

                JsonConvert.DeserializeObject<List<MetOfficeEarthquake>>(EarthquakeJSObject).ForEach(e => earthquakes.Add((Earthquake)e));

                return earthquakes;
            }
        }

        private string ResolveJSDate(string javascriptDate)
        {
            var captures = Regex.Matches(javascriptDate, @"\d{4}|\d{2}|\d{1}");

            // Basically JavaScript accepts singular digits for example day, 1 becomes 01 automatically but not in c# DateTime
            // Instead of onloading a bunch of Javascript executions libraries we just use simple string manipulation
            string Year    = captures[0].Value,
                   Month   = captures[1].Value.Length == 1 ? $"0{captures[1].Value}" : captures[1].Value,
                   Day     = captures[3].Value.Length == 1 ? $"0{captures[3].Value}" : captures[3].Value,
                   Hours   = captures[4].Value.Length == 1 ? $"0{captures[4].Value}" : captures[4].Value,
                   Minutes = captures[5].Value.Length == 1 ? $"0{captures[5].Value}" : captures[5].Value,
                   Seconds = captures[6].Value.Length == 1 ? $"0{captures[6].Value}" : captures[6].Value;

            return $"'{Year}-{Month}-{Day}T{Hours}:{Minutes}:{Seconds}'"; // Return DateTime acceptable string
        }
    }
}
