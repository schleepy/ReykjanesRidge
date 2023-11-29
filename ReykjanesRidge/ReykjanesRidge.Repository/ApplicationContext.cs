using Microsoft.EntityFrameworkCore;
using ReykjanesRidge.Models.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Repository
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Earthquake> Earthquakes { get; set; }

        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) 
        { 
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Earthquake>()
                .Property(c => c.ID)
                .ValueGeneratedOnAdd();

            /*modelBuilder.Entity<Earthquake>()
                .HasAlternateKey(e => e.AlternativeID);*/
        }
    }
}
