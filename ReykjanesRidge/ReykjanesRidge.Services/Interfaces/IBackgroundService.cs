using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace ReykjanesRidge.Services.Interfaces
{
    public interface IBackgroundService : IHostedService
    {
        Task DoWork(object state);
    }
}
