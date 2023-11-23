using Microsoft.Extensions.Logging;
using ReykjanesRidge.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using ReykjanesRidge.Models;
using Cronos;

namespace ReykjanesRidge.Services.Implementations
{
    public abstract class BackgroundService : IBackgroundService, IDisposable
    {
        private int executionCount = 0;
        public ILogger Logger { get; }
        private System.Timers.Timer Timer;
        private readonly IBackgroundServiceSettings Settings;

        public BackgroundService(IBackgroundServiceSettings settings, ILogger logger)
        {
            Settings = settings;
            Logger = logger;
        }

        public virtual async Task StartAsync(CancellationToken cancellationToken)
        {
            await ScheduleJob(cancellationToken);
        }

        public virtual async Task ScheduleJob(CancellationToken cancellationToken)
        {
            var next = CronExpression.Parse(Settings.CronExpression, CronFormat.IncludeSeconds).GetNextOccurrence(DateTimeOffset.Now, Settings.TimeZoneInfo);
            if (next.HasValue)
            {
                var delay = next.Value - DateTimeOffset.Now;
                if (delay.TotalMilliseconds <= 0)   // prevent non-positive values from being passed into Timer
                {
                    await ScheduleJob(cancellationToken);
                }
                Timer = new System.Timers.Timer(delay.TotalMilliseconds);
                Timer.Elapsed += async (sender, args) =>
                {
                    Timer.Dispose();  // reset and dispose timer
                    Timer = null;

                    if (!cancellationToken.IsCancellationRequested)
                    {
                        await DoWork(cancellationToken);
                    }

                    if (!cancellationToken.IsCancellationRequested)
                    {
                        await ScheduleJob(cancellationToken);    // reschedule next
                    }
                };
                Timer.Start();
            }
            await Task.CompletedTask;
        }

        public virtual async Task DoWork(object state)
        {
            var count = Interlocked.Increment(ref executionCount);
        }

        public virtual Task StopAsync(CancellationToken stoppingToken)
        {
            Timer?.Stop();

            return Task.CompletedTask;
        }

        public virtual void Dispose()
        {
            Timer?.Dispose();
        }
    }
}
