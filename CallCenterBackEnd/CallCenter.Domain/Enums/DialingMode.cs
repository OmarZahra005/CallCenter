namespace CallCenter.Domain.Enums;

public enum DialingMode
{
    Preview,      // Agent reviews contact before dial
    Progressive,  // Auto-dial when agent is ready
    Power,        // Multiple lines per agent
    Predictive    // Algorithm-based dialing with abandonment optimization
}
