using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Localization;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ReykjanesRidge.Models.Settings;
using ReykjanesRidge.Repository;
using ReykjanesRidge.Services.Implementations;
using AutoMapper;
using Microsoft.AspNetCore.StaticFiles;

namespace ReykjanesRidge.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddRazorPages();
            builder.Services.AddServerSideBlazor();
            builder.Services.AddScoped<EarthquakeService>();
            builder.Services.AddSingleton<EarthquakeNotifierService>();
            builder.Services.AddLocalization();

            var connectionString = builder.Configuration.GetConnectionString("ApplicationContext");
            builder.Services.AddDbContext<ApplicationContext>(options =>
                options.UseSqlite(connectionString, b => b.MigrationsAssembly("ReykjanesRidge.Server")));//.EnableSensitiveDataLogging());

            // Settings
            builder.Services.Configure<EarthquakePopulatorSettings>(builder.Configuration.GetSection("EarthquakePopulator"));
            builder.Services.AddSingleton(resolver => resolver.GetRequiredService<IOptions<EarthquakePopulatorSettings>>().Value);

            builder.Services.Configure<EarthquakeVisualizerSettings>(builder.Configuration.GetSection("EarthquakeVisualizer"));
            builder.Services.AddSingleton(resolver => resolver.GetRequiredService<IOptions<EarthquakeVisualizerSettings>>().Value);

            // AutoMapper
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // Background services
            //builder.Services.AddHostedService<EarthquakePopulatorService>();

            //builder.Services.AddWebOptimizer();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            //app.UseWebOptimizer();

            var supportedCultures = new[]{
            new CultureInfo("en-US")
};
            app.UseRequestLocalization(new RequestLocalizationOptions
            {
                DefaultRequestCulture = new RequestCulture("en-US"),
                SupportedCultures = supportedCultures,
                FallBackToParentCultures = false
            });
            CultureInfo.DefaultThreadCurrentCulture = CultureInfo.CreateSpecificCulture("en-US");

            app.UseHttpsRedirection();

            var provider = new FileExtensionContentTypeProvider();
            provider.Mappings.Add(".fbx", "text/xml");
            //provider.Mappings.Add(".frag", "text/plain");
            //provider.Mappings.Add(".vert", "text/plain");
            provider.Mappings[".txt"] = "text/javascript";
            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider
            });

            app.UseStaticFiles();

            app.UseRouting();

            app.MapBlazorHub();
            app.MapFallbackToPage("/_Host");

            app.Run();
        }
    }
}