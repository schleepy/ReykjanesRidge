using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Models.Settings
{
    public class BackgroundServiceSettings : IBackgroundServiceSettings
    {
        public string? CronExpression { get; set; }
        public TimeZoneInfo TimeZoneInfo { get; set; } = TimeZoneInfo.Local;

    }
}
