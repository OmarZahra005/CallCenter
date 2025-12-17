namespace CallCenter.Domain.Enums;

public enum DialerRecordStatus
{
    Pending,       // Not yet attempted
    Dialing,       // Currently being dialed
    Connected,     // Call connected
    NoAnswer,      // No answer after ringing
    Busy,          // Line busy
    Failed,        // Technical failure
    Voicemail,     // Reached voicemail
    Completed,     // Successfully completed
    DoNotCall,     // On DNC list
    Callback,      // Scheduled for callback
    Skipped,       // Skipped by agent
    InvalidNumber  // Invalid phone number
}
