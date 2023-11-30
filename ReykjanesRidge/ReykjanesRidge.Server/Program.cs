using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ReykjanesRidge.Models.Settings;
using ReykjanesRidge.Repository;
using ReykjanesRidge.Server.Data;
using ReykjanesRidge.Services.Implementations;
using AutoMapper;

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

            var connectionString = builder.Configuration.GetConnectionString("ApplicationContext");
            builder.Services.AddDbContext<ApplicationContext>(options =>
                options.UseSqlite(connectionString, b => b.MigrationsAssembly("ReykjanesRidge.Server")));//.EnableSensitiveDataLogging());

            // Settings
            builder.Services.Configure<EarthquakePopulatorSettings>(builder.Configuration.GetSection("EarthquakePopulator"));
            builder.Services.AddSingleton(resolver => resolver.GetRequiredService<IOptions<EarthquakePopulatorSettings>>().Value);

            // AutoMapper
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // Background services
            builder.Services.AddHostedService<EarthquakePopulatorService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseStaticFiles();

            app.UseRouting();

            app.MapBlazorHub();
            app.MapFallbackToPage("/_Host");

            app.Run();
        }
    }
}