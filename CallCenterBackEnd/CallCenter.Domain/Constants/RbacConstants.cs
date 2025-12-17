namespace CallCenter.Domain.Constants;

public static class RbacConstants
{
    // Default Role IDs (must match seed data)
    public static readonly Guid SuperAdminRoleId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid AdministratorRoleId = Guid.Parse("10000000-0000-0000-0000-000000000002");
    public static readonly Guid SupervisorRoleId = Guid.Parse("10000000-0000-0000-0000-000000000003");
    public static readonly Guid QaEvaluatorRoleId = Guid.Parse("10000000-0000-0000-0000-000000000004");
    public static readonly Guid TeamLeadRoleId = Guid.Parse("10000000-0000-0000-0000-000000000005");
    public static readonly Guid AgentRoleId = Guid.Parse("10000000-0000-0000-0000-000000000006");

    // System role names
    public const string SuperAdminSystemName = "super_admin";
    public const string AdministratorSystemName = "administrator";
    public const string SupervisorSystemName = "supervisor";
    public const string QaEvaluatorSystemName = "qa_evaluator";
    public const string TeamLeadSystemName = "team_lead";
    public const string AgentSystemName = "agent";
}
