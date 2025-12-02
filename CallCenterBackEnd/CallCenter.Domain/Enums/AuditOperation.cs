using System.ComponentModel;

namespace CallCenter.Domain.Enums;

public enum AuditOperation
{
    [Description("Create")]
    Create = 1,

    [Description("Update")]
    Update = 2,

    [Description("Delete")]
    Delete = 3,

    [Description("SoftDelete")]
    SoftDelete = 4,

    [Description("Restore")]
    Restore = 5,

    [Description("View")]
    View = 6,

    [Description("Export")]
    Export = 7,

    [Description("Import")]
    Import = 8,

    [Description("Login")]
    Login = 9,

    [Description("Logout")]
    Logout = 10,

    [Description("PasswordChange")]
    PasswordChange = 11,

    [Description("PermissionChange")]
    PermissionChange = 12,

    [Description("ProfileAssignment")]
    ProfileAssignment = 13,

    [Description("RoleAssignment")]
    RoleAssignment = 14,

    [Description("SystemConfiguration")]
    SystemConfiguration = 15
}