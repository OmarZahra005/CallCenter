namespace CallCenter.Domain.Constants;

public static class Permissions
{
    /// <summary>
    /// Permissions related to asset management and operations.
    /// These permissions are typically scoped to the user's assigned profiles unless otherwise specified.
    /// </summary>
    public static class Assets
    {
        /// <summary>
        /// Allows viewing assets within the user's assigned profiles.
        /// Users can see asset details, field values, and basic information.
        /// </summary>
        public const string View = "Permissions.Assets.View";

        /// <summary>
        /// Allows creating new assets within the user's assigned profiles.
        /// Users can add assets and set initial field values according to profile configuration.
        /// </summary>
        public const string Create = "Permissions.Assets.Create";

        /// <summary>
        /// Allows editing existing assets within the user's assigned profiles.
        /// Users can modify asset field values and update asset information.
        /// </summary>
        public const string Edit = "Permissions.Assets.Edit";

        /// <summary>
        /// Allows deleting assets within the user's assigned profiles.
        /// This typically performs soft deletion to maintain audit trails.
        /// </summary>
        public const string Delete = "Permissions.Assets.Delete";

        /// <summary>
        /// Allows exporting asset data to various formats (Excel, CSV, PDF).
        /// Export is limited to assets within the user's assigned profiles.
        /// </summary>
        public const string Export = "Permissions.Assets.Export";

        /// <summary>
        /// Allows importing asset data from external files.
        /// Imported assets will be created within the user's assigned profiles.
        /// </summary>
        public const string Import = "Permissions.Assets.Import";

        /// <summary>
        /// Allows viewing assets across all profiles, regardless of user profile assignments.
        /// This is a cross-profile permission typically granted to administrators and auditors.
        /// </summary>
        public const string ViewAll = "Permissions.Assets.ViewAll";
    }

    /// <summary>
    /// Permissions related to asset field definition and global configuration.
    /// These permissions affect the master field definitions used across all profiles.
    /// </summary>
    public static class Fields
    {
        /// <summary>
        /// Allows viewing asset field definitions and their configurations.
        /// Users can see field types, validation rules, and basic properties.
        /// </summary>
        public const string View = "Permissions.Fields.View";

        /// <summary>
        /// Allows creating new asset field definitions.
        /// Users can define new fields that will be available across all profiles.
        /// </summary>
        public const string Create = "Permissions.Fields.Create";

        /// <summary>
        /// Allows editing existing asset field definitions.
        /// Changes affect the master field configuration used by all profiles.
        /// </summary>
        public const string Edit = "Permissions.Fields.Edit";

        /// <summary>
        /// Allows deleting asset field definitions.
        /// This typically performs soft deletion to preserve historical data integrity.
        /// </summary>
        public const string Delete = "Permissions.Fields.Delete";

        /// <summary>
        /// Allows configuring global field settings such as validation rules, 
        /// field ordering, and system-wide field properties.
        /// </summary>
        public const string Configure = "Permissions.Fields.Configure";
    }

    /// <summary>
    /// Permissions related to dictionary management for dropdown and selection fields.
    /// Dictionary items provide standardized values for asset fields.
    /// </summary>
    public static class Dictionary
    {
        /// <summary>
        /// Allows viewing dictionary types and their items.
        /// Users can see available options for dropdown and selection fields.
        /// </summary>
        public const string View = "Permissions.Dictionary.View";

        /// <summary>
        /// Allows creating new dictionary items within existing dictionary types.
        /// Users can add new options to dropdown lists and selection fields.
        /// </summary>
        public const string Create = "Permissions.Dictionary.Create";

        /// <summary>
        /// Allows editing existing dictionary items and their translations.
        /// Users can modify option values and multilingual labels.
        /// </summary>
        public const string Edit = "Permissions.Dictionary.Edit";

        /// <summary>
        /// Allows deleting dictionary items.
        /// This typically performs soft deletion to maintain referential integrity.
        /// </summary>
        public const string Delete = "Permissions.Dictionary.Delete";

        /// <summary>
        /// Allows managing dictionary types themselves - creating new dictionaries,
        /// configuring tree structures, and setting up hierarchical relationships.
        /// </summary>
        public const string ManageTypes = "Permissions.Dictionary.ManageTypes";
    }

    /// <summary>
    /// Permissions related to profile management and configuration.
    /// Profiles define different asset categorizations and field configurations.
    /// </summary>
    public static class Profiles
    {
        /// <summary>
        /// Allows viewing profile definitions and their basic information.
        /// Users can see available profiles and their descriptions.
        /// </summary>
        public const string View = "Permissions.Profiles.View";

        /// <summary>
        /// Allows creating new profiles with their translations and basic configuration.
        /// Users can define new asset categorizations.
        /// </summary>
        public const string Create = "Permissions.Profiles.Create";

        /// <summary>
        /// Allows editing profile information, descriptions, and basic settings.
        /// Users can modify profile metadata and activation status.
        /// </summary>
        public const string Edit = "Permissions.Profiles.Edit";

        /// <summary>
        /// Allows deleting profiles.
        /// This typically performs soft deletion and requires handling of associated assets.
        /// </summary>
        public const string Delete = "Permissions.Profiles.Delete";

        /// <summary>
        /// Allows configuring which fields are enabled/disabled for specific profiles
        /// and setting profile-specific field behavior.
        /// </summary>
        public const string ConfigureFields = "Permissions.Profiles.ConfigureFields";

        /// <summary>
        /// Allows assigning users to profiles, controlling which users can access
        /// which asset categories.
        /// </summary>
        public const string AssignUsers = "Permissions.Profiles.AssignUsers";

        /// <summary>
        /// Allows viewing all profiles regardless of user assignments.
        /// This is a cross-profile permission for administrators.
        /// </summary>
        public const string ViewAll = "Permissions.Profiles.ViewAll";
    }

    /// <summary>
    /// Permissions specifically for managing profile-specific field overrides.
    /// These control how fields behave differently across various profiles.
    /// </summary>
    public static class ProfileFields
    {
        /// <summary>
        /// Allows viewing how fields are configured within specific profiles,
        /// including which fields are enabled/disabled and their display settings.
        /// </summary>
        public const string View = "Permissions.ProfileFields.View";

        /// <summary>
        /// Allows modifying field configurations within profiles, such as
        /// changing display order, visibility, and requirement settings.
        /// </summary>
        public const string Configure = "Permissions.ProfileFields.Configure";

        /// <summary>
        /// Allows creating profile-specific overrides that differ from the
        /// global field configuration. This enables field customization per profile.
        /// </summary>
        public const string Override = "Permissions.ProfileFields.Override";

        /// <summary>
        /// Allows resetting profile field configurations back to their global defaults,
        /// removing any profile-specific overrides.
        /// </summary>
        public const string Reset = "Permissions.ProfileFields.Reset";
    }

    /// <summary>
    /// Permissions related to user management and access control.
    /// These control user administration and profile assignment capabilities.
    /// </summary>
    public static class Users
    {
        /// <summary>
        /// Allows viewing user accounts and their basic information.
        /// Users can see user lists and profile assignments.
        /// </summary>
        public const string View = "Permissions.Users.View";

        /// <summary>
        /// Allows creating new user accounts and setting initial configurations.
        /// Users can register new system users.
        /// </summary>
        public const string Create = "Permissions.Users.Create";

        /// <summary>
        /// Allows editing user account information, including personal details
        /// and account settings.
        /// </summary>
        public const string Edit = "Permissions.Users.Edit";

        /// <summary>
        /// Allows deactivating or deleting user accounts.
        /// This typically performs soft deletion to maintain audit trails.
        /// </summary>
        public const string Delete = "Permissions.Users.Delete";

        /// <summary>
        /// Allows assigning users to specific profiles, controlling which
        /// asset categories users can access.
        /// </summary>
        public const string AssignProfiles = "Permissions.Users.AssignProfiles";

        /// <summary>
        /// Allows viewing which profiles are assigned to users and
        /// understanding user access scope.
        /// </summary>
        public const string ViewProfiles = "Permissions.Users.ViewProfiles";

        /// <summary>
        /// Allows managing comprehensive user access rights, including
        /// role assignments and permission modifications.
        /// </summary>
        public const string ManageAccess = "Permissions.Users.ManageAccess";
    }

    /// <summary>
    /// Permissions related to role management and permission assignment.
    /// Roles group permissions together for easier user administration.
    /// </summary>
    public static class Roles
    {
        /// <summary>
        /// Allows viewing role definitions and their assigned permissions.
        /// Users can see available roles and their capabilities.
        /// </summary>
        public const string View = "Permissions.Roles.View";

        /// <summary>
        /// Allows creating new roles with custom permission combinations.
        /// Users can define new role templates.
        /// </summary>
        public const string Create = "Permissions.Roles.Create";

        /// <summary>
        /// Allows editing role information and descriptions.
        /// Users can modify role metadata and activation status.
        /// </summary>
        public const string Edit = "Permissions.Roles.Edit";

        /// <summary>
        /// Allows deleting roles from the system.
        /// This requires handling users currently assigned to the role.
        /// </summary>
        public const string Delete = "Permissions.Roles.Delete";

        /// <summary>
        /// Allows modifying which permissions are assigned to roles,
        /// controlling the capabilities granted by each role.
        /// </summary>
        public const string AssignPermissions = "Permissions.Roles.AssignPermissions";
    }

    /// <summary>
    /// Permissions related to file management and storage operations.
    /// These control access to file upload, download, and management capabilities.
    /// </summary>
    public static class Files
    {
        /// <summary>
        /// Allows viewing files and their metadata.
        /// Users can see file lists and basic file information.
        /// </summary>
        public const string View = "Permissions.Files.View";

        /// <summary>
        /// Allows uploading new files to the system.
        /// Users can upload files and create file records.
        /// </summary>
        public const string Upload = "Permissions.Files.Upload";

        /// <summary>
        /// Allows downloading files from the system.
        /// Users can access and download file content.
        /// </summary>
        public const string Download = "Permissions.Files.Download";

        /// <summary>
        /// Allows editing file metadata and properties.
        /// Users can modify file names and other metadata.
        /// </summary>
        public const string Edit = "Permissions.Files.Edit";

        /// <summary>
        /// Allows deleting files from the system.
        /// This typically performs soft deletion to maintain audit trails.
        /// </summary>
        public const string Delete = "Permissions.Files.Delete";

        /// <summary>
        /// Allows managing file storage settings and cleanup operations.
        /// Users can perform file maintenance and storage management.
        /// </summary>
        public const string Manage = "Permissions.Files.Manage";
    }

    /// <summary>
    /// Permissions related to reporting and analytics functionality.
    /// These control access to various reporting capabilities and data analysis.
    /// </summary>
    public static class Reports
    {
        /// <summary>
        /// Allows viewing available reports and accessing report interfaces.
        /// Reports are typically scoped to the user's assigned profiles.
        /// </summary>
        public const string View = "Permissions.Reports.View";

        /// <summary>
        /// Allows generating reports with custom parameters and filters.
        /// Users can create ad-hoc reports within their profile scope.
        /// </summary>
        public const string Generate = "Permissions.Reports.Generate";

        /// <summary>
        /// Allows exporting report data to various formats (PDF, Excel, CSV).
        /// Export capabilities follow the same profile scoping as report viewing.
        /// </summary>
        public const string Export = "Permissions.Reports.Export";

        /// <summary>
        /// Allows setting up scheduled reports that run automatically
        /// and can be delivered via email or saved to designated locations.
        /// </summary>
        public const string Schedule = "Permissions.Reports.Schedule";

        /// <summary>
        /// Allows generating reports across all profiles regardless of user assignments.
        /// This is a cross-profile permission for comprehensive system reporting.
        /// </summary>
        public const string ViewAll = "Permissions.Reports.ViewAll";
    }

    /// <summary>
    /// Permissions related to system administration and maintenance.
    /// These are typically reserved for technical administrators and system managers.
    /// </summary>
    public static class System
    {
        /// <summary>
        /// Allows viewing system logs, error logs, and audit trails.
        /// Users can monitor system health and troubleshoot issues.
        /// </summary>
        public const string ViewLogs = "Permissions.System.ViewLogs";

        /// <summary>
        /// Allows modifying system-wide settings, configurations, and parameters.
        /// This includes global system behavior and integration settings.
        /// </summary>
        public const string ManageSettings = "Permissions.System.ManageSettings";

        /// <summary>
        /// Allows viewing detailed audit trails showing who did what and when.
        /// This provides comprehensive system activity monitoring.
        /// </summary>
        public const string ViewAuditTrail = "Permissions.System.ViewAuditTrail";

        /// <summary>
        /// Allows managing system translations and multilingual content.
        /// Users can update language files and localization settings.
        /// </summary>
        public const string ManageTranslations = "Permissions.System.ManageTranslations";

        /// <summary>
        /// Allows performing database maintenance operations such as
        /// cleanup routines, optimization, and data archival.
        /// </summary>
        public const string DatabaseMaintenance = "Permissions.System.DatabaseMaintenance";
    }

    /// <summary>
    /// Permissions related to audit log management and monitoring.
    /// These permissions control access to system audit trails and activity monitoring.
    /// </summary>
    public static class AuditLogs
    {
        /// <summary>
        /// Allows viewing audit logs and system activity records.
        /// Users can see who performed what actions and when they occurred.
        /// </summary>
        public const string View = "Permissions.AuditLogs.View";

        /// <summary>
        /// Allows viewing detailed audit log information including
        /// change history, before/after values, and comprehensive activity details.
        /// </summary>
        public const string ViewDetails = "Permissions.AuditLogs.ViewDetails";

        /// <summary>
        /// Allows exporting audit logs to various formats (Excel, CSV, PDF).
        /// Users can generate audit reports for compliance and analysis purposes.
        /// </summary>
        public const string Export = "Permissions.AuditLogs.Export";

        /// <summary>
        /// Allows viewing audit logs across all profiles and entities,
        /// regardless of user profile assignments. This is a cross-system permission
        /// typically granted to auditors and system administrators.
        /// </summary>
        public const string ViewAll = "Permissions.AuditLogs.ViewAll";

        /// <summary>
        /// Allows configuring audit log retention policies, cleanup schedules,
        /// and audit logging settings. This includes managing what activities
        /// are logged and for how long.
        /// </summary>
        public const string Configure = "Permissions.AuditLogs.Configure";

        /// <summary>
        /// Allows performing audit log maintenance operations such as
        /// archival, cleanup of old records, and database optimization
        /// related to audit log storage.
        /// </summary>
        public const string Maintain = "Permissions.AuditLogs.Maintain";
    }

    /// <summary>
    /// Predefined permission groups that represent common role templates.
    /// These groups combine related permissions for easier role management and assignment.
    /// </summary>
    public static class PermissionGroups
    {
        /// <summary>
        /// Dictionary mapping role names to their associated permissions.
        /// These serve as templates for creating roles with standard permission sets.
        /// </summary>
        public static readonly Dictionary<string, List<string>> Groups = new()
        {
            /// <summary>
            /// Standard asset manager role for day-to-day asset operations.
            /// Can view, create, and edit assets within assigned profiles.
            /// Suitable for operational staff managing assets in their departments.
            /// </summary>
            ["Asset Manager"] =
            [
                Assets.View, Assets.Create, Assets.Edit, Assets.Export,
                Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View,
                Files.View, Files.Download,
                Reports.View, Reports.Generate
            ],

            /// <summary>
            /// Advanced asset management role with administrative capabilities.
            /// Can perform all asset operations including deletion and import/export.
            /// Can configure fields and manage asset transfers between profiles.
            /// Suitable for departmental asset administrators.
            /// </summary>
            ["Asset Admin"] =
            [
                Assets.View, Assets.Create, Assets.Edit, Assets.Delete,
                Assets.Export, Assets.Import,
                Fields.View, Fields.Create, Fields.Edit, Fields.Configure,
                Dictionary.View, Dictionary.Create, Dictionary.Edit,
                Profiles.View, Profiles.ConfigureFields,
                ProfileFields.View, ProfileFields.Configure, ProfileFields.Override, ProfileFields.Reset,
                Files.View, Files.Upload, Files.Download, Files.Edit, Files.Delete,
                Reports.View, Reports.Generate, Reports.Export
            ],

            /// <summary>
            /// Profile administration role focused on managing profiles and user assignments.
            /// Can create and configure profiles, assign users, and manage field overrides.
            /// Has cross-profile visibility for administrative oversight.
            /// Suitable for IT administrators managing system structure.
            /// </summary>
            ["Profile Admin"] =
            [
                Profiles.View, Profiles.Create, Profiles.Edit, Profiles.Delete,
                Profiles.ConfigureFields, Profiles.AssignUsers, Profiles.ViewAll,
                ProfileFields.View, ProfileFields.Configure, ProfileFields.Override, ProfileFields.Reset,
                Users.View, Users.AssignProfiles, Users.ViewProfiles,
                Assets.ViewAll, Reports.ViewAll
            ],

            /// <summary>
            /// Complete system administrator role with all permissions.
            /// Can perform any operation in the system including system maintenance.
            /// Has unrestricted access across all profiles and system functions.
            /// Suitable for technical administrators and system owners.
            /// </summary>
            ["System Admin"] =
            [
                // All permissions - complete system access
                Assets.View, Assets.Create, Assets.Edit, Assets.Delete, Assets.Export, Assets.Import, Assets.ViewAll,
                Fields.View, Fields.Create, Fields.Edit, Fields.Delete, Fields.Configure,
                Dictionary.View, Dictionary.Create, Dictionary.Edit, Dictionary.Delete, Dictionary.ManageTypes,
                Profiles.View, Profiles.Create, Profiles.Edit, Profiles.Delete, Profiles.ConfigureFields, Profiles.AssignUsers, Profiles.ViewAll,
                ProfileFields.View, ProfileFields.Configure, ProfileFields.Override, ProfileFields.Reset,
                Users.View, Users.Create, Users.Edit, Users.Delete, Users.AssignProfiles, Users.ViewProfiles, Users.ManageAccess,
                Roles.View, Roles.Create, Roles.Edit, Roles.Delete, Roles.AssignPermissions,
                Files.View, Files.Upload, Files.Download, Files.Edit, Files.Delete, Files.Manage,
                Reports.View, Reports.Generate, Reports.Export, Reports.Schedule, Reports.ViewAll,
                AuditLogs.View, AuditLogs.ViewDetails, AuditLogs.Export, AuditLogs.ViewAll, AuditLogs.Configure, AuditLogs.Maintain,
                System.ViewLogs, System.ManageSettings, System.ViewAuditTrail, System.ManageTranslations, System.DatabaseMaintenance
            ],

            /// <summary>
            /// Read-only access role for viewing system information without modification rights.
            /// Can view all data types but cannot create, edit, or delete anything.
            /// Suitable for auditors, consultants, or staff needing information access only.
            /// </summary>
            ["Read Only"] =
            [
                Assets.View, Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View,
                Users.View, Roles.View, Files.View,
                Reports.View, AuditLogs.View
            ],

            /// <summary>
            /// Specialized role for IT department asset management.
            /// Standard asset management permissions typically assigned to IT_ASSETS profile.
            /// Focused on technology asset lifecycle management.
            /// </summary>
            ["IT Asset Manager"] =
            [
                Assets.View, Assets.Create, Assets.Edit, Assets.Export,
                Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View,
                Reports.View, Reports.Generate
                // Note: This would be combined with profile assignment to IT_ASSETS profile
            ],

            /// <summary>
            /// Specialized role for facilities and building management.
            /// Standard asset management permissions typically assigned to FACILITIES profile.
            /// Focused on facility, furniture, and building asset management.
            /// </summary>
            ["Facilities Manager"] =
            [
                Assets.View, Assets.Create, Assets.Edit, Assets.Export,
                Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View,
                Reports.View, Reports.Generate
                // Note: This would be combined with profile assignment to FACILITIES profile
            ],

            /// <summary>
            /// Specialized role for fleet and vehicle management.
            /// Standard asset management permissions typically assigned to VEHICLES profile.
            /// Focused on vehicle, equipment, and mobile asset management.
            /// </summary>
            ["Vehicle Manager"] =
            [
                Assets.View, Assets.Create, Assets.Edit, Assets.Export,
                Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View,
                Reports.View, Reports.Generate
                // Note: This would be combined with profile assignment to VEHICLES profile
            ],

            /// <summary>
            /// Reporting specialist role with advanced reporting capabilities.
            /// Can generate, export, and schedule reports across assigned profiles.
            /// Suitable for business analysts and reporting specialists.
            /// </summary>
            ["Report Analyst"] =
            [
                Assets.View, Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View,
                Reports.View, Reports.Generate, Reports.Export, Reports.Schedule,
                AuditLogs.View, AuditLogs.Export
            ],

            /// <summary>
            /// Data entry specialist role focused on asset creation and maintenance.
            /// Can create and edit assets but has limited administrative capabilities.
            /// Suitable for data entry staff and junior asset coordinators.
            /// </summary>
            ["Data Entry"] =
            [
                Assets.View, Assets.Create, Assets.Edit,
                Fields.View, Dictionary.View,
                Profiles.View, ProfileFields.View
            ]
        };
    }

    /// <summary>
    /// Defines permission hierarchies where higher-level permissions automatically grant lower-level ones.
    /// </summary>
    public static class PermissionHierarchy
    {
        /// <summary>
        /// Maps each permission to all permissions it should automatically grant.
        /// Key = Permission, Value = List of permissions automatically granted.
        /// </summary>
        public static readonly Dictionary<string, List<string>> Hierarchy = new()
        {
            // Assets: Create/Edit/Delete grant View
            [Assets.Create] = [Assets.View],
            [Assets.Edit] = [Assets.View],
            [Assets.Delete] = [Assets.View, Assets.Edit],
            [Assets.Import] = [Assets.View, Assets.Create],
            [Assets.Export] = [Assets.View],

            // Fields: Create/Edit/Delete grant View
            [Fields.Create] = [Fields.View],
            [Fields.Edit] = [Fields.View],
            [Fields.Delete] = [Fields.View, Fields.Edit],
            [Fields.Configure] = [Fields.View, Fields.Edit],

            // Dictionary: Create/Edit/Delete grant View
            [Dictionary.Create] = [Dictionary.View],
            [Dictionary.Edit] = [Dictionary.View],
            [Dictionary.Delete] = [Dictionary.View, Dictionary.Edit],
            [Dictionary.ManageTypes] = [Dictionary.View, Dictionary.Create, Dictionary.Edit],

            // Profiles: Create/Edit/Delete grant View
            [Profiles.Create] = [Profiles.View],
            [Profiles.Edit] = [Profiles.View],
            [Profiles.Delete] = [Profiles.View, Profiles.Edit],
            [Profiles.ConfigureFields] = [Profiles.View],
            [Profiles.AssignUsers] = [Profiles.View],

            // ProfileFields hierarchies
            [ProfileFields.Configure] = [ProfileFields.View],
            [ProfileFields.Override] = [ProfileFields.View, ProfileFields.Configure],
            [ProfileFields.Reset] = [ProfileFields.View, ProfileFields.Configure],

            // Users: Create/Edit/Delete grant View
            [Users.Create] = [Users.View],
            [Users.Edit] = [Users.View],
            [Users.Delete] = [Users.View, Users.Edit],
            [Users.ManageAccess] = [Users.View, Users.Edit],
            [Users.AssignProfiles] = [Users.View, Users.ViewProfiles],

            // Roles: Create/Edit/Delete grant View
            [Roles.Create] = [Roles.View],
            [Roles.Edit] = [Roles.View],
            [Roles.Delete] = [Roles.View, Roles.Edit],
            [Roles.AssignPermissions] = [Roles.View, Roles.Edit],

            // Files: Upload/Edit/Delete grant View, Download is independent
            [Files.Upload] = [Files.View],
            [Files.Edit] = [Files.View],
            [Files.Delete] = [Files.View, Files.Edit],
            [Files.Manage] = [Files.View, Files.Upload, Files.Edit, Files.Delete],

            // Reports hierarchies
            [Reports.Generate] = [Reports.View],
            [Reports.Export] = [Reports.View],
            [Reports.Schedule] = [Reports.View, Reports.Generate],

            // AuditLogs hierarchies
            [AuditLogs.ViewDetails] = [AuditLogs.View],
            [AuditLogs.Export] = [AuditLogs.View],
            [AuditLogs.Configure] = [AuditLogs.View, AuditLogs.ViewDetails],
            [AuditLogs.Maintain] = [AuditLogs.View, AuditLogs.ViewDetails, AuditLogs.Configure],

            // System hierarchies
            [System.ManageSettings] = [System.ViewLogs],
            [System.ManageTranslations] = [System.ViewLogs],
            [System.DatabaseMaintenance] = [System.ViewLogs, System.ViewAuditTrail]
        };
    }

    /// <summary>
    /// Resolves all permissions that should be granted based on the hierarchy.
    /// </summary>
    /// <param name="userPermissions">The permissions directly assigned to the user</param>
    /// <returns>All permissions including those granted through hierarchy</returns>
    public static HashSet<string> ResolveAllPermissions(IEnumerable<string> userPermissions)
    {
        var resolvedPermissions = new HashSet<string>(userPermissions);

        foreach (var permission in userPermissions)
        {
            if (PermissionHierarchy.Hierarchy.TryGetValue(permission, out var grantedPermissions))
            {
                foreach (var grantedPermission in grantedPermissions)
                {
                    resolvedPermissions.Add(grantedPermission);
                }
            }
        }

        return resolvedPermissions;
    }
}

