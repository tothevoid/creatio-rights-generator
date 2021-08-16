using System;
using Terrasoft.Core;
using Terrasoft.Core.Entities;
using Terrasoft.Core.DB;
using Terrasoft.Core.Packages;
using System.Text;
using Terrasoft.Common;
using System.Data;

namespace Terrasoft.Configuration.RightsScriptGenerator
{
	public class GenerationResult
	{
		public GenerationResult() { }

		public GenerationResult(Guid scriptId, Guid packageUrl, string mainUrl)
		{
			if (scriptId != Guid.Empty && packageUrl != Guid.Empty)
			{
				IsSuccessful = true;
				ScriptUrl = $"{mainUrl}/PackageSqlScriptEdit.aspx?packageId={packageUrl}&itemId={scriptId}";
			}
		}

		public bool IsSuccessful { get; set; }

		public string ScriptUrl { get; set; }
	}

	public class RightsScriptGeneratorHelper
	{
		private UserConnection UserConnection { get; }
        public RightsScriptGeneratorHelper(UserConnection userConnection)
        {
			UserConnection = userConnection;
		}
		
		public GenerationResult GenerateScript(string scriptName, string script, string mainUrl)
        {
			if (string.IsNullOrEmpty(scriptName) || string.IsNullOrEmpty(script) || string.IsNullOrEmpty(mainUrl))
            {
				return new GenerationResult();
			}

			var (scriptId, scriptPackageId) = CheckIsScriptAlreadyExists(scriptName);
			if (scriptId != Guid.Empty)
            {
				UpdateExisting(scriptId, script);
				return new GenerationResult(scriptId, scriptPackageId, mainUrl);
			}
			else
            {
				Guid packageId = GetAvailablePackageId();
				Guid newScriptId = CreateNewScript(scriptName, script, packageId);
				return new GenerationResult(newScriptId, packageId, mainUrl);
			}
		}
		
		private void UpdateExisting(Guid id, string script)
        {
			var update = new Update(UserConnection, nameof(SysPackageSqlScript))
				.Set("Body", Column.Parameter(Encoding.UTF8.GetBytes(script)))
				.Set(nameof(SysPackageSqlScript.IsChanged), Column.Const(true))
				.Set(nameof(SysPackageSqlScript.NeedInstall), Column.Const(true))
				.Where("Id").IsEqual(Column.Const(id));
			update.Execute();
        }

		private Guid CreateNewScript(string scriptName, string script, Guid packageId)
		{
			Guid id = Guid.NewGuid();
			var insert = new Insert(UserConnection)
				.Into(nameof(SysPackageSqlScript))
				.Set("Id", Column.Const(id))
				.Set(nameof(SysPackageSqlScript.UId), Column.Const(Guid.NewGuid()))
				.Set(nameof(SysPackageSqlScript.Name), Column.Const(scriptName))
				.Set(nameof(SysPackageSqlScript.SysPackageId), Column.Const(packageId))
				.Set(nameof(SysPackageSqlScript.DBEngineType), Column.Const((int)UserConnection.DBEngine.DBEngineType))
				.Set(nameof(SysPackageSqlScript.InstallType), Column.Const((int)SysPackageSqlScriptInstallType.AfterPackage))
				.Set(nameof(SysPackageSqlScript.IsChanged), Column.Const(true))
				.Set(nameof(SysPackageSqlScript.NeedInstall), Column.Const(true))
				.Set("Body", Column.Parameter(Encoding.UTF8.GetBytes(script)));
			insert.Execute();
			return id;
		}

		private (Guid, Guid) CheckIsScriptAlreadyExists(string name)
        {
			Select select = new Select(UserConnection)
				.Column(nameof(SysPackageSqlScript), "Id").As("ScriptId")
				.Column(nameof(SysPackage), "Id").As("PackageId")
				.From(nameof(SysPackageSqlScript))
				.Where(nameof(SysPackageSqlScript), nameof(SysPackageSqlScript.Name))
				.IsEqual(Column.Const(name))
				.And(nameof(SysPackage), nameof(SysPackage.Maintainer))
				.IsEqual(Column.Const(UserConnection.Maintainer))
				.InnerJoin(nameof(SysPackage))
					.On(nameof(SysPackage), nameof(SysPackage.Id))
					.IsEqual(nameof(SysPackageSqlScript), nameof(SysPackageSqlScript.SysPackageId)) as Select;

			using (DBExecutor executor = UserConnection.EnsureDBConnection())
			{
				using (IDataReader reader = select.ExecuteReader(executor))
				{
					while (reader.Read())
					{
						return (reader.GetColumnValue<Guid>("ScriptId"),
							reader.GetColumnValue<Guid>("PackageId"));					
					}
				}

			}
			return (Guid.Empty, Guid.Empty);
		}

		private Guid QuerySysSetting(string settingName) =>
			Core.Configuration.SysSettings.GetValue(UserConnection, settingName, Guid.Empty);

		private Guid GetPackageId(Guid packageUId)
		{
			Select select = new Select(UserConnection)
				.Column("Id")
				.From(nameof(SysPackage))
				.Where(nameof(SysPackage.UId)).IsEqual(Column.Const(packageUId))
					.And(nameof(SysPackage.Maintainer))
					.IsEqual(Column.Const(UserConnection.Maintainer)) as Select;

			return select.ExecuteScalar<Guid>();
		}

		private Guid GetAvailablePackageId()
		{
			Guid currentPackageUid = QuerySysSetting("CurrentPackageId");
			if (currentPackageUid != Guid.Empty)
            {
				Guid currentPackageId = GetPackageId(currentPackageUid);
				if (currentPackageId != Guid.Empty)
                {
					return currentPackageUid;
				}
			}

			Guid customPackageId = QuerySysSetting("CustomPackageUId");
			return GetPackageId(customPackageId);
		}
	}
}