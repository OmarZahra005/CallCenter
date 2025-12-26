using CallCenter.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CallCenter.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ICallLogService, CallLogService>();
        services.AddScoped<ITwilioVoiceService, TwilioVoiceService>();
        services.AddScoped<IDataExportService, DataExportService>();

        // Note: Twilio options are now loaded from database via IDatabaseOptionsProvider

        return services;
    }
}
