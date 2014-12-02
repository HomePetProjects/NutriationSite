using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NutriationSite.Models;
using Newtonsoft.Json;

namespace NutriationSite.Controllers
{
    [Authorize]
    public class ParameterController : Controller
    {
        NutriationContext _nutrContext = new NutriationContext();
        UsersContext _usContext = new UsersContext();

        [Authorize]
        public ActionResult Index()
        {
            ViewBag.ParamValue = _nutrContext.ParameterValues;
            int id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
            return View(_nutrContext.Parameters.Where(e => e.User_Id == id));
        }

        public string DeleteChart()
        {
            int id = Convert.ToInt32(Request.Params["id"]);
            _nutrContext.Parameters.Remove(_nutrContext.Parameters.Where(e => e.Id == id).First());
            _nutrContext.SaveChanges();
            return "";
        }

        public ActionResult AddValue(int id)
        {
            ParameterValue param = new ParameterValue();
            param.Parameter_Id = id;

            return PartialView("AddValue", param);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AddValue(ParameterValue param)
        {
            param.DateTime = DateTime.Now;
            _nutrContext.ParameterValues.Add(param);
            _nutrContext.SaveChanges();

            return RedirectToAction("Index");
        }


        //Action return partial view for dialog "Add Parameter"
        public ActionResult AddParameter()
        {
            return PartialView("AddParameter");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AddParameter(Parameter param)
        {
            param.User_Id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
            if (param.Measure_Unit == null) param.Measure_Unit = "Unit";
            _nutrContext.Parameters.Add(param);
            _nutrContext.SaveChanges();

            return RedirectToAction("Index");
        }

        
        public string GetCharts()
        {
            int id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
            List<Parameter> paramList = _nutrContext.Parameters.Where(e => e.User_Id == id).ToList();

            List<object> anonList = new List<object>();
            foreach(var i in paramList)
            {
                ParameterValue[] arr = (from a in _nutrContext.ParameterValues where a.Parameter_Id == i.Id select a).ToArray();
                List<Object> anonValueList = new List<object>();
                foreach (var j in arr)
                {
                    anonValueList.Add(new { 
                        Id = j.Id,
                        DateTime = j.DateTime.ToShortTimeString() + " " + j.DateTime.ToShortDateString(), 
                        Value = j.Value, 
                        Comment = j.Comment, 
                        Parameter_Id = j.Parameter_Id });
                }
                anonList.Add(new { Parameter = new { Id = i.Id, Name = i.Name, Measure_Unit = i.Measure_Unit, User_Id = i.User_Id }, ValueArr = anonValueList.ToArray() });
            }

            string json = JsonConvert.SerializeObject(anonList);
            return json;
        }
    }
}
