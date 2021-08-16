using System;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.ServiceModel.Activation;
using Terrasoft.Web.Common;
using System.Web;

namespace Terrasoft.Configuration.RightsScriptGenerator
{
    [ServiceContract]
	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
	public class RightsScriptGeneratorService : BaseService
	{
		private RightsScriptGeneratorHelper generatorHelper;

		private RightsScriptGeneratorHelper GeneratorHelper
		{
			get => generatorHelper ?? (generatorHelper = new RightsScriptGeneratorHelper(UserConnection));
		}

		[OperationContract]
		[WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
			ResponseFormat = WebMessageFormat.Json)]
		public GenerationResult GenerateScript(string scriptName, string script)
		{
			Uri request = HttpContext.Current?.Request.Url;
			string mainUrl = $"{request.Scheme}://{request.Host}:{request.Port}/0";

			return (string.IsNullOrEmpty(scriptName) || string.IsNullOrEmpty(script)) ?
				new GenerationResult():
				GeneratorHelper.GenerateScript(scriptName, script, mainUrl);
		}
	}
}