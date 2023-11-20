using System;
using System.Collections.Generic;
using System.Text;

namespace ReykjanesRidge.Models
{
    public interface IBackgroundServiceSettings
    {
        string CronExpression { get; set; }
        TimeZoneInfo TimeZoneInfo { get; set; }
    }
}
